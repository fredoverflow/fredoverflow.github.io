////////////////////////////////////// ui //////////////////////////////////////

window.onload = function () {
	document.getElementById("formula").oninput = function () {
		try {
			removeHighlight();
			const fingerprint = parse(this.value);
			const style = document.getElementById(fingerprint).style;
			style.visibility = "visible";
			style.backgroundColor = "palegreen";
			document.getElementById("tooltip").title = "";
		} catch (errorMessage) {
			document.getElementById("tooltip").title = errorMessage;
		}
	}
}

function removeHighlight() {
	changeTableHeaderStyle("backgroundColor", "");
}

function hideAll() {
	changeTableHeaderStyle("visibility", "");
}

function revealAll() {
	changeTableHeaderStyle("visibility", "visible");
}

function changeTableHeaderStyle(key, value) {
	const headers = document.getElementsByTagName("th");
	Array.prototype.forEach.call(headers, element => element.style[key] = value);
}

////////////////////////////////// initialize //////////////////////////////////

const table = {};

const missing = {
	nud: () => { throw "missing input"; },
	led: () => { throw "missing operator"; }
};

function token(symbol, precedence) {
	const tok = Object.create(missing);
	tok.symbol = symbol;
	tok.precedence = precedence || 0;
	table[symbol] = tok;
	return tok;
}

function constant(symbol, value) {
	token(symbol).nud = () => value;
}

function prefix(symbol, operation) {
	token(symbol).nud = () => operation(expr(99));
}

function infix(symbol, precedence, operation) {
	token(symbol, precedence).led = function (left) {
		return operation(left, expr(this.precedence));
	};
}

constant("a", 0b0011);
constant("b", 0b0101);
constant("false", 0b0000);
constant("true", 0b1111);

prefix("!", operand => operand ^ 0b1111);
token("(").nud = () => expr(0, ")");
token(")");

infix("==", 50, (left, right) => left ^ right ^ 0b1111);
infix("!=", 50, (left, right) => left ^ right);
infix("^", 40, (left, right) => left ^ right);
infix("&&", 30, (left, right) => left & right);
infix("!&", 30, (left, right) => (left & right) ^ 0b1111);
infix("||", 20, (left, right) => left | right);
infix("!|", 20, (left, right) => (left | right) ^ 0b1111);
infix("->", 15, (left, right) => (left ^ 0b1111) | right);
infix("<-", 15, (left, right) => left | (right ^ 0b1111));
token("?", 10).led = (cond) => (cond & expr(0, ":")) | (~cond & expr(0));
token(":");

const END = token("(end)");

const regex = /a|b|false|true|\(|\)|==|!=|\^|&&|!&|\|\||!\||->|<-|\?|:|!|[^ ]+/g;

///////////////////////////////////// parse ////////////////////////////////////

let tokens;
let index;

function parse(formula) {
	const lexemes = formula.match(regex) || [];
	tokens = lexemes.map(lexeme => table[lexeme]);
	tokens.push(END);
	index = 0;
	return expr(0, "(end)");
}

function expect(expected) {
	if (tokens[index++].symbol !== expected) throw `expected ${expected}`;
}

function expr(precedence, terminator) {
	let temp = tokens[index++].nud();
	while (tokens[index].precedence > precedence) {
		temp = tokens[index++].led(temp);
	}
	if (terminator) {
		expect(terminator);
	}
	return temp;
}
