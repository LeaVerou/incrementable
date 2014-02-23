/**
 * Script for making multiple numbers in a textfield incrementable/decrementable (like Firebug's CSS values)
 * @author Lea Verou
 * @version 1.1
 */

(function(){

/**
 * Constructor
 * @param textField {HTMLElement} An input or textarea element
 * @param multiplier {Function} A function that accepts the event object and returns the multiplier or 0 for nothing to happen.
 */
var _ = window.Incrementable = function(textField, multiplier, units) {
	var me = this;

	this.textField = textField;
	
	this.step = +textField.getAttribute('step') || 
				+textField.getAttribute('data-step') || 1;

	this.multiplier = multiplier || function(evt) {
		if (evt.shiftKey) { return 10; }
		
		if (evt.ctrlKey) { return 0.1; }
		
		return 1;
	};

	if (units) {
		this.units = units;
	}
	
	this.changed = false;

	this.textField.addEventListener('keydown', function(evt) {
		var multiplier = me.multiplier(evt);
		
		if (multiplier && (evt.keyCode == 38 || evt.keyCode == 40)) {
			me.changed = false;
			
			// Up or down arrow pressed, check if there's something
			// increment/decrement-able where the caret is
			var caret = this.selectionStart,
				text = this.value,
				regex = new RegExp('^([\\s\\S]{0,' + caret + '}[^-0-9\\.])?(-?[0-9]*(?:\\.?[0-9]+)(?:' + me.units + '))\\b', 'i'),
				property = 'value' in this? 'value' : 'textContent',
				decrement = evt.keyCode == 40;

			var temp = incrementColor(this[property], caret, decrement, multiplier);
			me.changed = temp.changed;
			this[property] = temp.text;

			if (!me.changed) {
				this[property] = this[property].replace(regex, function($0, $1, $2) {
					$1 = $1 || '';
					if ($1.length <= caret && $1.length + $2.length >= caret) {

						var stepValue = me.stepValue($2, decrement, multiplier);
						caret = caret + (stepValue.length - $2.length);

						me.changed = {
							add: stepValue,
							del: $2,
							start: $1.length
						};

						return $1 + stepValue;
					}
					else {
						return $1 + $2;
					}
				});
			}

			if (me.changed) {
				this.setSelectionRange(caret, caret);
				
				evt.preventDefault();
				evt.stopPropagation();
				
				// Fire input event
				var dispatchedEvent = document.createEvent("HTMLEvents");
				
				dispatchedEvent.initEvent('input', true, true );
				
				dispatchedEvent.add = me.changed.add;
				dispatchedEvent.del = me.changed.del;
				dispatchedEvent.start = me.changed.start;
				dispatchedEvent.incrementable = true;
		
				this.dispatchEvent(dispatchedEvent);
			}
		}
	}, false);

	this.textField.addEventListener('keypress', function(evt) {
		if (me.changed && (evt.keyCode == 38 || evt.keyCode == 40)) {
			evt.preventDefault();
			evt.stopPropagation();
			me.changed = false;
		}
	}, false);
};

_.prototype = {
	/**
	 * Gets a <length> and increments or decrements it
	 */
	stepValue: function(length, decrement, multiplier) {
		var val = parseFloat(length),
			offset = (decrement? -1 : 1) * (multiplier || 1) * this.step,
			valPrecision = precision(val),
			offsetPrecision = precision(offset);
		
		// Prevent rounding errors
		var newVal = (parseFloat((val + offset).toPrecision(
			Math.max(valPrecision.integer, offsetPrecision.integer) +
			Math.max(valPrecision.decimals, offsetPrecision.decimals)
		)));
		
		return newVal + length.replace(/^-|[0-9]+|\./g, '');
	},

	units: '|%|deg|px|r?em|ex|ch|in|cm|mm|pt|pc|vmin|vmax|vw|vh|gd|m?s'
};

function precision(number) {
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

function Color(s) {
	this._length = s.length;
	if (this._length === 3) {
		this._parts = [
			parseInt(s.charAt(0), 16) * 17,
			parseInt(s.charAt(1), 16) * 17,
			parseInt(s.charAt(2), 16) * 17
		];
	}
	else {
		this._parts = [
			parseInt(s.substring(0, 2), 16),
			parseInt(s.substring(2, 4), 16),
			parseInt(s.substring(4, 6), 16)
		];
	}
}
Color.prototype = {
	incrementAt: function(position, decrement) {
		var increment = 1,
			newValue;
		if (this._length === 3) {
			increment = 17;
			position = position * 2;
		}
		if (decrement) {
			increment *= -1;
		}
		position = [0, 0, 0, 1, 1, 2, 2][position];
		newValue = (this._parts[position] + increment) % 0x100;
		if (newValue < 0) {
			newValue += 0x100;
		}
		this._parts[position] = newValue;
		return this;
	},
	toString: function() {
		var r = this._parts[0],
			g = this._parts[1],
			b = this._parts[2];
		if (this._length === 3) {
			return (r % 16).toString(16) +
				(g % 16).toString(16) +
				(b % 16).toString(16);
		}
		return (r < 16 ? '0' : '') + r.toString(16) +
			(g < 16 ? '0' : '') + g.toString(16) +
			(b < 16 ? '0' : '') + b.toString(16);
	}
};

function incrementColor(originalText, caret, decrement, multiplier) {
	var text,
		changed = null,
		regex = new RegExp('^([\\s\\S]{0,' + caret + '}#)([0-9A-F]{3}(?:[0-9A-Z]{3})?)\\b', 'i');
	text = originalText.replace(regex, function ($0, $1, $2) {
		
		if ($1.length <= caret && $1.length + $2.length >= caret) {
			var stepValue = new Color($2)
					.incrementAt(caret - $1.length, decrement)
					.toString();
			changed = {
				add: stepValue,
				del: $2,
				start: $1.length
			};
			
			return $1 + stepValue;
		}
		else {
			return $1 + $2;
		}
	});
	return {
		text: text,
		changed: changed
	};
}

})();