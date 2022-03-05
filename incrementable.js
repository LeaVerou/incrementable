/**
 * Make numbers in a textfield incrementable/decrementable (like in dev tools)
 * @author Lea Verou
 * @license MIT
 * @version 2.0.0
 */

const NUMBER = /-?(\d*\.?\d+)/;
const PREFIX_SUFFIX = /[%\w.-]/;
const PARTIAL_TOKEN = RegExp(`^${PREFIX_SUFFIX.source}*${NUMBER.source}?${PREFIX_SUFFIX.source}*$`);

export default class Incrementable {
	constructor (target, options = {}) {
		this.target = target;
		this.options = Object.assign({}, options, Incrementable.defaultOptions);

		this.step = +target.getAttribute('step') ||
					+target.getAttribute('data-step') || 1;

		this.multiplier = this.options.multiplier;
		this.prefixes = this.options.prefixes;
		this.suffixes = this.options.units;

		let value = 'value' in target? 'value' : 'textContent';

		this.target.addEventListener('keydown', evt => {
			let target = this.target;
			let multiplier = this.multiplier(evt);

			if (multiplier && (evt.key == "ArrowUp" || evt.key == "ArrowDown")) {
				let content = target[value];
				let caretStart = target.selectionStart;
				let caretEnd = target.selectionEnd;
				let selection = content.substring(caretStart, caretEnd);

				if (!PARTIAL_TOKEN.test(selection)) {
					return;
				}

				let i;

				// Find potential beginning and end

				for (i = caretStart - 1; i > 0; i--) {
					let char = content[i];

					if (!PREFIX_SUFFIX.test(char)) {
						i++;
						break;
					}
				}

				let start = i;

				for (i = caretEnd; i < content.length; i++) {
					let char = content[i];

					if (!PREFIX_SUFFIX.test(char)) {
						break;
					}
				}

				let end = i;

				let token = content.substring(start, end);

				if (!NUMBER.test(token)) {
					// There is no number to increment here
					return;
				}

				target.focus();
				target.selectionStart = start;
				target.selectionEnd = end;

				let adjusted = Incrementable.value(token, {
					decrement: evt.key == "ArrowDown",
					multiplier,
					step: this.step
				});

				if (adjusted !== token) {
					evt.preventDefault();
					evt.stopPropagation();
				}

				document.execCommand("insertText", false, adjusted);

				target.selectionStart = start;
				target.selectionEnd = start + adjusted.length;
			}
		});
	}

	static value(token, {decrement = false, multiplier = 1, step = 1} = {}) {
		// Extract number
		let number = token.match(NUMBER);
		let index = number.index;
		let before = token.substring(0, index);
		let after = token.substring(index + number[0].length);
		let val = +number[0];
		let offset = (decrement? -1 : 1) * (multiplier || 1) * step;
		let valPrecision = precision(val);
		let offsetPrecision = precision(offset);

		// Prevent rounding errors
		let newVal = (parseFloat((val + offset).toPrecision(
			Math.max(valPrecision.integer, offsetPrecision.integer) +
			Math.max(valPrecision.decimals, offsetPrecision.decimals)
		)));

		return before + newVal + after;
	}

	static defaultOptions = {
		multiplier: evt => evt.shiftKey? 10 : (evt.ctrlKey? .1 : 1)
	}
}

function precision (number) {
	number = (number + '').replace(/^0+/, '');

	var dot = number.indexOf('.');

	if (dot === -1) {
		return {
			integer: number.length,
			decimals: 0
		};
	}

	return {
		integer: dot,
		decimals: number.length - 1 - dot
	};
}

window.Incrementable = Incrementable;