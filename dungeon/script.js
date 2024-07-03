document.addEventListener('DOMContentLoaded', function() {
    const dungeonContainer = document.getElementById('dungeon');
    const generateButton = document.getElementById('generate-dungeon');

    // Function to create dungeon layout
    function createDungeon(rows, cols) {
        dungeonContainer.innerHTML = ''; // Clear existing dungeon

        // Initialize grid with walls
        const grid = Array.from({ length: rows }, () => Array(cols).fill('wall'));

        function createRoom(x, y, width, height) {
            for (let r = y; r < y + height; r++) {
                for (let c = x; c < x + width; c++) {
                    grid[r][c] = 'room';
                }
            }
        }

        function createHorizontalCorridor(y, x1, x2) {
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                if (grid[y][x] === 'wall') {
                    grid[y][x] = 'corridor';
                }
            }
        }

        function createVerticalCorridor(x, y1, y2) {
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                if (grid[y][x] === 'wall') {
                    grid[y][x] = 'corridor';
                }
            }
        }

        function isSpaceAvailable(x, y, width, height, buffer = 1) {
            for (let r = y - buffer; r < y + height + buffer; r++) {
                for (let c = x - buffer; c < x + width + buffer; c++) {
                    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== 'wall') {
                        return false;
                    }
                }
            }
            return true;
        }

        // Create rooms with buffer space
        const rooms = [];
        for (let i = 0; i < 5; i++) {
            let roomWidth, roomHeight, roomX, roomY;
            let attempts = 0;
            do {
                roomWidth = Math.floor(Math.random() * 4) + 3;
                roomHeight = Math.floor(Math.random() * 4) + 3;
                roomX = Math.floor(Math.random() * (cols - roomWidth - 2)) + 1;
                roomY = Math.floor(Math.random() * (rows - roomHeight - 2)) + 1;
                attempts++;
            } while (!isSpaceAvailable(roomX, roomY, roomWidth, roomHeight) && attempts < 50);

            if (attempts < 50) {
                createRoom(roomX, roomY, roomWidth, roomHeight);
                rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });
            }
        }

        function createEntrance() {
            const entranceSide = Math.floor(Math.random() * 4); // 0 = top, 1 = right, 2 = bottom, 3 = left
            let entranceX, entranceY;

            if (entranceSide === 0) { // Top side
                entranceX = Math.floor(Math.random() * cols);
                for (let y = 0; y < rows; y++) {
                    if (grid[y][entranceX] === 'wall') {
                        grid[y][entranceX] = 'corridor';
                    }
                    if (grid[y][entranceX] === 'room') {
                        break;
                    }
                }
            } else if (entranceSide === 1) { // Right side
                entranceY = Math.floor(Math.random() * rows);
                for (let x = cols - 1; x >= 0; x--) {
                    if (grid[entranceY][x] === 'wall') {
                        grid[entranceY][x] = 'corridor';
                    }
                    if (grid[entranceY][x] === 'room') {
                        break;
                    }
                }
            } else if (entranceSide === 2) { // Bottom side
                entranceX = Math.floor(Math.random() * cols);
                for (let y = rows - 1; y >= 0; y--) {
                    if (grid[y][entranceX] === 'wall') {
                        grid[y][entranceX] = 'corridor';
                    }
                    if (grid[y][entranceX] === 'room') {
                        break;
                    }
                }
            } else if (entranceSide === 3) { // Left side
                entranceY = Math.floor(Math.random() * rows);
                for (let x = 0; x < cols; x++) {
                    if (grid[entranceY][x] === 'wall') {
                        grid[entranceY][x] = 'corridor';
                    }
                    if (grid[entranceY][x] === 'room') {
                        break;
                    }
                }
            }

            // Ensure entrance connects to the first room
            if (rooms.length > 0) {
                const firstRoom = rooms[0];
                const roomCenterX = Math.floor(firstRoom.x + firstRoom.width / 2);
                const roomCenterY = Math.floor(firstRoom.y + firstRoom.height / 2);

                if (entranceSide === 0 || entranceSide === 2) {
                    createHorizontalCorridor(roomCenterY, entranceX, roomCenterX);
                } else {
                    createVerticalCorridor(roomCenterX, entranceY, roomCenterY);
                }
            }
        }

        // Create primary entrance
        createEntrance();

        // Possibly create a secondary entrance with a smaller chance
        if (Math.random() < 0.1) { // 10% chance for a second entrance
            createEntrance();
        }

        // Connect all rooms with corridors
        for (let i = 0; i < rooms.length - 1; i++) {
            const roomA = rooms[i];
            const centerA = {
                x: Math.floor(roomA.x + roomA.width / 2),
                y: Math.floor(roomA.y + roomA.height / 2)
            };

            for (let j = i + 1; j < rooms.length; j++) {
                const roomB = rooms[j];
                const centerB = {
                    x: Math.floor(roomB.x + roomB.width / 2),
                    y: Math.floor(roomB.y + roomB.height / 2)
                };

                // Create corridors between centers of all pairs of rooms
                if (centerA.x !== centerB.x) {
                    createHorizontalCorridor(centerA.y, centerA.x, centerB.x);
                }
                if (centerA.y !== centerB.y) {
                    createVerticalCorridor(centerB.x, centerA.y, centerB.y);
                }
            }
        }

        // Render grid
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                if (grid[r][c] === 'wall') {
                    cell.classList.add('wall');
                }
                dungeonContainer.appendChild(cell);
            }
        }
    }

    // Generate dungeon on page load
    createDungeon(20, 20);

    // Event listener for generate dungeon button
    generateButton.addEventListener('click', function() {
        createDungeon(20, 20);
    });

    // Dice roller functionality (existing code remains unchanged)
    document.querySelectorAll('.dice-images img').forEach(img => {
        img.addEventListener('click', function() {
            const diceType = parseInt(this.dataset.dice);
            const result = rollDice(diceType);
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = ''; // Clear previous results
            const resultDiv = document.createElement('div');
            resultDiv.classList.add('result');
            resultDiv.textContent = `Rolled: ${result} (d${diceType})`;
            resultsContainer.appendChild(resultDiv);
        });
    });

    function rollDice(diceType) {
        const result = Math.floor(Math.random() * diceType) + 1;
        return result;
    }
});
