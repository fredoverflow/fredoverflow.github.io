function toggleBit(index) {
    const button = document.getElementsByClassName("bit").item(index);
    if (button.value === "0") {
        setOne(button);
    } else {
        setZero(button);
    }
    updateNumber();
}

function updateNumber() {
    const [...buttons] = document.getElementsByClassName("bit");

    let decimal = buttons.reduce((x, button) => x + +button.value * button.getAttribute("decimal"), 0);

    const [...digits] = document.getElementsByClassName("digit");

    // first digit
    if (decimal >= 10) {
        digits[0].innerText = "1";
        decimal -= 10;
    } else {
        digits[0].innerText = "";
    }

    // following digits
    for (let i = 1; i < digits.length; ++i) {
        const floor = Math.floor(decimal);
        digits[i].innerText = floor;
        decimal -= floor;
        decimal *= 10;
    }

    // remove trailing zeros
    for (let i = digits.length - 1; i > 2 && digits[i].innerText === "0"; --i) {
        digits[i].innerText = "";
    }
}

function setOne(button) {
    button.value = "1";
    const classList = button.classList;
    classList.remove("bit-off");
    classList.add("bit-on");
}

function setZero(button) {
    button.value = "0";
    const classList = button.classList;
    classList.remove("bit-on");
    classList.add("bit-off");
}

function setNumber(x) {
    // round up
    x += 0.0001220703125;

    const buttons = document.getElementsByClassName("bit");
    for (const button of buttons) {
        if (x >= 8) {
            setOne(button);
            x -= 8;
        } else {
            setZero(button);
        }
        x *= 2;
    }
    updateNumber();
}

function setRandomNumber() {
    setNumber(Math.random() * 16);
}

function decrement() {
    const buttons = document.getElementsByClassName("bit");
    for (let i = buttons.length - 1; i >= 0; --i) {
        const button = buttons.item(i);
        if (button.value === "1") {
            setZero(button);
            break;
        } else {
            setOne(button);
        }
    }
    updateNumber();
}

function increment() {
    const buttons = document.getElementsByClassName("bit");
    for (let i = buttons.length - 1; i >= 0; --i) {
        const button = buttons.item(i);
        if (button.value === "0") {
            setOne(button);
            break;
        } else {
            setZero(button);
        }
    }
    updateNumber();
}
