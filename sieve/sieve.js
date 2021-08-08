const MAX_NUMBER = 25;
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23];

const DURATION_MS = 1000;

function write(cell, textContent) {
    if (cell !== undefined) {
        cell.style.animationName = undefined;
        cell.style.animationDuration = undefined;
        requestAnimationFrame(() => {
            cell.textContent = textContent;
            cell.style.animationName = "writing";
            cell.style.animationDuration = DURATION_MS + "ms";
        });
    }
}

function move(src, dst) {
    write(dst, src.textContent);
    src.textContent = "";

    requestAnimationFrame((begin) => {
        let left = src.offsetLeft - dst.offsetLeft;
        function animate(time) {
            const x = Math.max(0, (begin + DURATION_MS - time) / DURATION_MS);
            dst.style.left = left * x + "px";
            if (x > 0) {
                requestAnimationFrame(animate);
            }
        }
        animate(begin);
    });
}

window.onload = function () {
    const row = document.getElementById("table-head-row");

    let cell = document.createElement("th");
    row.appendChild(cell);

    cell = document.createElement("th");
    row.appendChild(cell);

    for (let x = 2; x <= MAX_NUMBER; ++x) {
        cell = document.createElement("th");
        const button = document.createElement("button");
        button.onclick = () => clickColumn(x);
        button.textContent = "" + x;
        cell.appendChild(button);
        row.appendChild(cell);
    }
    addRow();
};

function addRow() {
    const tableBody = document.getElementById("table-body");
    const rows = tableBody.children;
    const y = rows.length;
    const prime = PRIMES[y];
    if (prime === undefined) return;

    const row = document.createElement("tr");

    let cell = document.createElement("td");
    row.appendChild(cell);

    cell = document.createElement("td");
    const button = document.createElement("button");
    button.onclick = () => clickRow(y);
    button.textContent = "" + prime;
    cell.appendChild(button);
    row.appendChild(cell);

    for (let x = 2; x <= MAX_NUMBER; ++x) {
        cell = document.createElement("td");
        row.appendChild(cell);
    }
    tableBody.appendChild(row);
}

function clickRow(y) {
    const rows = document.getElementById("table-body").children;
    const cells = rows[y].children;
    const prime = PRIMES[y];

    if (cells[prime].textContent === "") {
        cells[prime].textContent = "" + prime;
    } else {
        for (let i = 2 * prime; i < cells.length; i += prime) {
            if (cells[i].textContent === "") {
                write(cells[i], "✗");
                return;
            }
        }
        if (y === rows.length - 1) {
            addRow();
        }
    }
};

function clickColumn(x) {
    const rows = document.getElementById("table-body").children;
    const y = PRIMES.indexOf(x);

    if (y >= 0) {
        if (y === rows.length) {
            addRow();
        }
        const cells = rows[y].children;
        cells[x].textContent = "" + x;
        write(cells[2 * x], "✗");
    } else {
        for (let y = 0; y < rows.length; ++y) {
            const cells = rows[y].children;
            if (cells[x].textContent === "✗") {
                const dst = cells[x + PRIMES[y]];
                if (dst !== undefined) {
                    move(cells[x], dst);
                } else {
                    write(cells[x], "");
                }
            }
        }
    }
}
