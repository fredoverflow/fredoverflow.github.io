const MAX_NUMBER = 25;
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23];
const REVEAL_DELAY = 20;

function write(cell, textContent, delay) {
    if (cell === undefined) return;
    
    cell.style.animationName = undefined;
    cell.style.animationDuration = undefined;
    // CSS engine needs to apply above changes before starting animation, hence the timeout
    setTimeout(() => {
        cell.textContent = textContent;
        cell.style.animationName = "writing";
        cell.style.animationDuration = "1s";
    }, delay || 0);
}

function move(src, dst) {
    write(dst, src.textContent);
    src.textContent = "";

    const left = src.offsetLeft - dst.offsetLeft;
    dst.style.left = left + "px";
    // CSS engine needs to apply above changes before starting transition, hence the timeout
    setTimeout(() => {
        dst.classList.add("sliding");
    }, 0);
}

const startWithSquare = document.createElement('input');
startWithSquare.type = "checkbox";

function firstMultipleOf(prime) {
    return startWithSquare.checked ? prime * prime : 2 * prime;
}

window.onload = function () {
    const row = document.getElementById("table-head-row");

    let cell = document.createElement("th");
    row.appendChild(cell);

    cell = document.createElement("th");
    cell.appendChild(startWithSquare);
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

    cells[prime].textContent = "" + prime;
    for (let i = firstMultipleOf(prime); i < cells.length; i += prime) {
        write(cells[i], "✗", i * REVEAL_DELAY);
    }
    addRow();
    disableButtonInside(cells[1]);
};

function disableButtonInside(cell) {
    cell.firstChild.disabled = true;
}

function clickColumn(x) {
    const rows = document.getElementById("table-body").children;
    const y = PRIMES.indexOf(x);

    if (y >= 0) {
        if (y === rows.length) {
            addRow();
        }
        const cells = rows[y].children;
        cells[x].textContent = "" + x;
        write(cells[firstMultipleOf(x)], "✗");
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
    const row = document.getElementById("table-head-row");
    disableButtonInside(row.children[x]);
}
