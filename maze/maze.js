const L = 1; // WALL

const SENTINEL = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const VERTICAL = [0, 0, L, 0, L, 0, L, 0, L, 0, L, 0, L, 0, L, 0, L, 0, L, 0, L, 0];
const HORIZONT = [0, L, 1, L, 1, L, 1, L, 1, L, 1, L, 1, L, 1, L, 1, L, 1, L, 1, L];

const GRID = [...SENTINEL,
...VERTICAL, ...HORIZONT,
...VERTICAL, ...HORIZONT,
...VERTICAL, ...HORIZONT,
...VERTICAL, ...HORIZONT,
...VERTICAL, ...HORIZONT,
...VERTICAL, ...HORIZONT,
...VERTICAL, ...HORIZONT,
...VERTICAL, ...HORIZONT,
...VERTICAL, ...HORIZONT,
...VERTICAL, ...HORIZONT,
...VERTICAL, ...SENTINEL];

const grid = new Int8Array(GRID);

const WALL_X = 1;
const WALL_Y = 22;
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

function draw(position, direction) {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "white";
    context.fillRect(0, 0, 646, 646);

    for (let y = 0; y <= 10; ++y) {
        for (let x = 0; x <= 10; ++x) {
            if (horizontalAt(x, y)) {
                context.drawImage(horizontal, 64 * x + 3, 64 * y);
            }
            if (verticalAt(x, y)) {
                context.drawImage(vertical, 64 * x, 64 * y + 3);
            }
        }
    }

    for (let y = 0; y < 10; ++y) {
        for (let x = 0; x < 10; ++x) {
            context.drawImage(beeperAt(x, y) ? beeper : empty, x * 64 + 6, y * 64 + 6);
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
    await generateMaze(center(0, 0), 0);
})();

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

const allDirectionPermutations = [
    [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 2, 3, 1], [0, 3, 1, 2], [0, 3, 2, 1],
    [1, 0, 2, 3], [1, 0, 3, 2], [1, 2, 0, 3], [1, 2, 3, 0], [1, 3, 0, 2], [1, 3, 2, 0],
    [2, 0, 1, 3], [2, 0, 3, 1], [2, 1, 0, 3], [2, 1, 3, 0], [2, 3, 0, 1], [2, 3, 1, 0],
    [3, 0, 1, 2], [3, 0, 2, 1], [3, 1, 0, 2], [3, 1, 2, 0], [3, 2, 0, 1], [3, 2, 1, 0],
];

function randomDirectionPermutation() {
    return allDirectionPermutations[(Math.random() * 24) | 0];
}

async function generateMaze(position, direction) {
    grid[position] = 0;
    draw(position, direction);
    await delay(500);

    for (const dir of randomDirectionPermutation()) {
        const wall = position + WALLS[dir];
        const neighbour = position + NEIGHBOURS[dir];
        if (grid[wall] && grid[neighbour]) {
            grid[wall] = 0;
            await generateMaze(neighbour, dir);

            draw(position, direction);
            await delay(250);
        }
    }
}

function delay(timeout) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, timeout);
    });
}
