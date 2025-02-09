document.getElementById("ieee754input").oninput = function (event) {
    const x = +event.target.value;
    document.getElementById("ieee754output").innerText = ieee754(x);
};

function show754(x) {
    document.getElementById("ieee754input").value = x;
    document.getElementById("ieee754output").innerText = ieee754(x);
}

function ieee754(x) {
    const double = new Float64Array(1);
    const raw = new Uint32Array(double.buffer);
    double[0] = x;

    const negative = raw[1] >>> 31;
    let exponent = (raw[1] >>> 20) & 0x7ff;
    const mantissaHi = raw[1] & 0xfffff;
    const mantissaLo = raw[0];

    if (exponent === 2047) {
        return (mantissaHi | mantissaLo) ? "NaN" : negative ? "-Infinity" : "+Infinity";
    }

    let leading = +(exponent !== 0);
    exponent = exponent - 1022 - leading;

    const visiblePlus = exponent > 0 ? "+" : "";
    const scale = "2^" + visiblePlus + exponent;
    const padding = " ".repeat(7 - scale.length);
    const mantissa = leading + "." + toNibbles(mantissaHi).substring(16) + toNibbles(mantissaLo);

    return padding + scale + " * " + (negative ? "-" : "+") + mantissa + "\n\n          " + exactDecimalString(x);
}

const nibbles = [
    " 0000", " 0001", " 0010", " 0011", " 0100", " 0101", " 0110", " 0111",
    " 1000", " 1001", " 1010", " 1011", " 1100", " 1101", " 1110", " 1111"
];

function toNibbles(x) {
    function nibble(shift) {
        return nibbles[(x >>> shift) & 15];
    }
    return nibble(28) + nibble(24) + nibble(20) + nibble(16) + nibble(12) + nibble(8) + nibble(4) + nibble(0);
}

/////////////////////////
//// Here be dragons ////
/////////////////////////

const PLUS = 43;
const MINUS = 45;
const DOT = 46;
const ZERO = 48;

const THRESHOLD = 1_000_000_000;
const DIGITS = 9;
const HEADROOM = 0x80000000 - THRESHOLD;

Uint32Array.prototype.concat = function (element) {
    const result = new Uint32Array(this.length + 1);
    result.set(this);
    result[this.length] = element;
    return result;
};

const POSITIVE_POWERS_OF_TWO = [];
let positive = Uint32Array.of(1);
for (let i = 0; i < 1024; ++i) {
    POSITIVE_POWERS_OF_TWO.push(positive.slice());
    positive = addInteger(positive, positive);
}

const NEGATIVE_POWERS_OF_TWO = [];
let negative = Uint32Array.of(THRESHOLD);
for (let i = 0; i < 1074; ++i) {
    negative = halve(negative);
    NEGATIVE_POWERS_OF_TWO.push(negative.slice());
}

function addInteger(x, y) {
    if (x.length < y.length) {
        const bigger = new Uint32Array(y.length);
        bigger.set(x);
        x = bigger;
    }
    let negativeCarry = 0; // or -1
    let i;
    for (i = 0; i < y.length; ++i) {
        const sum = x[i] + y[i] - negativeCarry;
        negativeCarry = (sum + HEADROOM) >> 31;
        x[i] = sum - (negativeCarry & THRESHOLD);
    }
    if (negativeCarry !== 0) {
        for (; i < x.length; ++i) {
            if (++x[i] < THRESHOLD) return x;
            x[i] = 0;
        }
        x = x.concat(1);
    }
    return x;
}

function halve(x) {
    let borrow = 0;
    let i;
    for (i = 0; i < x.length; ++i) {
        let segment = x[i];
        x[i] = (segment + borrow) >>> 1;
        borrow = (segment << 31 >> 31) & THRESHOLD;
    }
    if (borrow !== 0) {
        x = x.concat(borrow >>> 1);
    }
    return x;
}

function exactDecimalString(x) {
    const double = new Float64Array(1);
    const raw = new Uint32Array(double.buffer);
    double[0] = x;

    const negative = raw[1] >>> 31;
    let exponent = (raw[1] >>> 20) & 0x7ff;
    const mantissaHi = raw[1] & 0xfffff;
    const mantissaLo = raw[0];

    if (exponent === 2047) {
        return (mantissaHi | mantissaLo) ? "NaN" : negative ? "-Infinity" : "+Infinity";
    }

    let leading = +(exponent !== 0);
    exponent = exponent - 1022 - leading;

    raw[1] = 0x3ff00000 | mantissaHi;
    let mantissa = double[0];
    if (leading === 0) {
        mantissa -= 1;
    }

    let integer = Uint32Array.of(0);
    while (mantissa !== 0 && exponent >= 0) {
        if (mantissa >= 1) {
            integer = addInteger(integer, POSITIVE_POWERS_OF_TWO[exponent]);
            mantissa -= 1;
        }
        --exponent;
        mantissa *= 2;
    }

    let fractional = Uint32Array.of(0);
    while (mantissa !== 0) {
        if (mantissa >= 1) {
            fractional = addFractional(fractional, NEGATIVE_POWERS_OF_TWO[~exponent]);
            mantissa -= 1;
        }
        --exponent;
        mantissa *= 2;
    }

    const a = new Uint8Array((integer.length + fractional.length) * DIGITS + 2);
    let left = generateInteger(integer, a);
    const right = generateFractional(fractional, a);

    a[--left] = negative ? MINUS : PLUS;

    return new TextDecoder().decode(a.slice(left, right + 1));
}

function addFractional(x, y) {
    let i = Math.min(x.length, y.length);
    if (x.length < y.length) {
        const temp = new Uint32Array(y.length);
        temp.set(x);
        for (let j = x.length; j < y.length; ++j) {
            temp[j] = y[j];
        }
        x = temp;
    }
    let negativeCarry = 0; // or -1
    for (--i; i >= 0; --i) {
        let sum = x[i] + y[i] - negativeCarry;
        negativeCarry = (sum + HEADROOM) >> 31;
        x[i] = sum - (negativeCarry & THRESHOLD);
    }
    return x;
}

function generateInteger(x, a) {
    let left = x.length * DIGITS + 1;

    let i;
    for (i = 0; i < x.length - 1; ++i) {
        let segment = x[i];
        for (let j = 0; j < DIGITS; ++j) {
            a[--left] = (segment % 10) | ZERO;
            segment = (segment / 10) | 0;
        }
    }

    let segment = x[i];
    do {
        a[--left] = (segment % 10) | ZERO;
        segment = (segment / 10) | 0;
    } while (segment !== 0);

    return left;
}

function generateFractional(x, a) {
    let right = a.length - x.length * DIGITS - 1;
    a[right] = DOT;

    for (let segment of x) {
        right += DIGITS;
        for (let i = 0; i < DIGITS; ++i) {
            a[right - i] = (segment % 10) | ZERO;
            segment = (segment / 10) | 0;
        }
    }

    while (a[right] === ZERO) --right;
    if (a[right] === DOT) ++right;

    return right;
}
