const WIDTH = 1920, HEIGHT = 1080, DETAIL = 1024;

let topf = -1.0, left = -2.0, zoom = 1.0 / 512.0;

function render() {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, 0);
    });
}

window.onload = function () {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    const row = context.createImageData(WIDTH, 1);
    const data = row.data;

    async function compute() {
        for (let y = 0; y < HEIGHT; ++y) {
            const ci = y * zoom + topf;

            for (let x = 0, index = 0; x < WIDTH; ++x, index += 4) {
                const cr = x * zoom + left;

                setColor(data, index, iterate(cr, ci));
            }
            context.putImageData(row, 0, y);
            if (y % 16 === 15) {
                await render();
            }
        }
    }
    compute();

    canvas.onclick = function (ev) {
        (ev.shiftKey ? zoomOut2x : zoomIn4x)(ev.offsetX, ev.offsetY);
        compute();
    }
}

function zoomIn4x(x, y) {
    left = (x - WIDTH  / 8.0) * zoom + left;
    topf = (y - HEIGHT / 8.0) * zoom + topf;
    zoom = zoom / 4.0;
}

function zoomOut2x(x, y) {
    left = (x - WIDTH ) * zoom + left;
    topf = (y - HEIGHT) * zoom + topf;
    zoom = zoom * 2.0;
}

function iterate(cr, ci) {
    let zr = 0.0;
    let zi = 0.0;

    for (let i = 0; i < DETAIL; ++i) {
        const zrzr = zr * zr;
        const zizi = zi * zi;

        if (zrzr + zizi >= 4) {
            // c is outside The Mandelbrot Set
            return PALETTE[i & 15];
        }
        zi = 2.0 * zr * zi + ci;
        zr = zrzr - zizi + cr;
    }
    // paint The Mandelbrot Set black
    return 0x000000;
}

const PALETTE = [
    0x00421E0F, 0x0019071A, 0x0009012F, 0x00040449,
    0x00000764, 0x000C2C8A, 0x001852B1, 0x00397DD1,
    0x0086B5E5, 0x00D3ECF8, 0x00F1E9BF, 0x00F8C95F,
    0x00FFAA00, 0x00CC8000, 0x00995700, 0x006A3403,
];

function setColor(data, index, color) {
    data[index    ] =  color        & 255;
    data[index + 1] = (color >>  8) & 255;
    data[index + 2] = (color >> 16);
    data[index + 3] =                 255;
}
