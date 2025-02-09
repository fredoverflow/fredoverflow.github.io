const L = 1; // WALL

const SENTINEL = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const VERTICAL = [0, 0, L, 0, L, 0, L, 0, L, 0, L, 0, L, 0, 0];
const EDGE     = [0, L, 2, L, 3, L, 3, L, 3, L, 3, L, 2, L, 0];
const NORM     = [0, L, 3, L, 4, L, 4, L, 4, L, 4, L, 3, L, 0];

const GRID = [...SENTINEL,
...VERTICAL, ...EDGE,
...VERTICAL, ...NORM,
...VERTICAL, ...NORM,
...VERTICAL, ...NORM,
...VERTICAL, ...NORM,
...VERTICAL, ...EDGE,
...VERTICAL, ...SENTINEL];

let grid = new Int8Array(GRID);

const WALL_X = 1;
const WALL_Y = 15;
const WALLS = new Int8Array([WALL_X, -WALL_Y, -WALL_X, WALL_Y]);

const NEIGHBOUR_X = WALL_X + WALL_X;
const NEIGHBOUR_Y = WALL_Y + WALL_Y;
const NEIGHBOURS = new Int8Array([NEIGHBOUR_X, -NEIGHBOUR_Y, -NEIGHBOUR_X, NEIGHBOUR_Y]);

function center(x, y) {
    return (y + 1) * NEIGHBOUR_Y + (x + 1) * NEIGHBOUR_X;
}

function beeperAt(x, y) {
    return grid[center(x, y)];
}

function horizontalAt(x, y) {
    return grid[center(x, y) - WALL_Y];
}

function verticalAt(x, y) {
    return grid[center(x, y) - WALL_X];
}

function getX(position) {
    return ((position % WALL_Y) >>> 1) - 1;
}    

function getY(position) {
    return ((position / WALL_Y) >>> 1) - 1;
}    

function draw() {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "white";
    context.fillRect(0, 0, 390, 390);

    for (let y = 0; y <= 6; ++y) {
        for (let x = 0; x <= 6; ++x) {
            if (horizontalAt(x, y)) {
                context.drawImage(horizontal, 64 * x + 3, 64 * y);
            }
            if (verticalAt(x, y)) {
                context.drawImage(vertical, 64 * x, 64 * y + 3);
            }
        }
    }

    for (let y = 0; y < 6; ++y) {
        for (let x = 0; x < 6; ++x) {
            let image;
            const n = beeperAt(x, y);
            switch (n) {
                case 1: image = beeper; break;

                case 0:
                case 2:
                case 3:
                case 4: image = empty; break;

                default: continue;
            }
            context.drawImage(image, x * 64 + 6, y * 64 + 6);    
        }
    }

    context.drawImage(karels[direction], getX(position) * 64 + 6, getY(position) * 64 + 6);
}

let empty, beeper, horizontal, vertical, karels;

(async function () {
    const names = [
        "empty", "beeper",
        "horizontal", "vertical",
        "east", "north", "west", "south",
    ];
    [empty, beeper, horizontal, vertical, ...karels] = await loadImages(names);
    draw();
    const canvas = document.getElementById("canvas");
    canvas.onmousedown = function (event) {
        if (event.button === 0) {
            explore(event);
        } else if (event.button === 2) {
            undo();
        }
    };
})();

let position = center(0, 0);
let direction = 0;
grid[position] = -1;
const history = [];

function explore(event) {
    const mouseX = Math.max(0, event.offsetX - 6) >> 6;
    const mouseY = Math.max(0, event.offsetY - 6) >> 6;
    const mouse = center(mouseX, mouseY);
    const karelX = getX(position);
    const karelY = getY(position);

    let wall = 0;
    if (mouseY == karelY) {
        if (mouseX > karelX) {
            wall = WALL_X;
        } else if (mouseX < karelX) {
            wall = -WALL_X;
        }
    } else if (mouseX == karelX) {
        if (mouseY > karelY) {
            wall = WALL_Y;
        } else if (mouseY < karelY) {
            wall = -WALL_Y;
        }
    }
    const neighbour = wall + wall;

    if (neighbour !== 0 && position !== mouse && grid[position + neighbour] > 0) {
        history.push({grid: new Int8Array(grid), position, direction});
        do {
            grid[position + NEIGHBOUR_X]--;
            grid[position - NEIGHBOUR_Y]--;
            grid[position - NEIGHBOUR_X]--;
            grid[position + NEIGHBOUR_Y]--;
            grid[position + wall] = 0;
            grid[position += neighbour] = -1;
        } while (position !== mouse && grid[position + neighbour] > 0);
        direction = WALLS.indexOf(wall);
        draw();
    }
}

function undo() {
    const state = history.pop();
    if (state) {
        ({grid, position, direction} = state);
        draw();
    }
}

function loadImages(names) {
    const promises = names.map(name => loadImage(`tiles/${name}.png`));
    return Promise.all(promises);
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = document.createElement("img");
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
