/**
 * Script for making multiple numbers in a textfield incrementable/decrementable (like Firebug's CSS values)
 * @author Lea Verou
 * @version 1.0
 */
 
 /**
 * Modified to fix Opera bug and allow for decimals.
 * @author Graham Bradley
 */

/**
 * Constructor
 * @param textField {HTMLElement} An input or textarea element
 * @param modifiers {Object} An object with params ctrlKey, altKey and/or shiftKey. The key combination must have a sum of >= 3.
 * 							For example, {altKey: 1, ctrlKey: 3, shiftKey: 2} means that either Ctrl has to be pressed with the arrows, or alt+shift, or alt+ctrl, or all three.
 *							The default is 0, which means no modifiers needed.
 */
function Incrementable(textField, modifiers, units) {
	var me = this;
	
	this.textField = textField;
	
	modifiers = modifiers || {};
	this.modifiers = {
		ctrlKey: modifiers.ctrlKey || 0,
		altKey: modifiers.altKey || 0,
		shiftKey: modifiers.shiftKey || 0
	};
	
	if(units) {
		this.units = units;
	}
	
	var cancelPress=false;
	
	// Opera doesn't support preventDefault on keydown, but keypress is OK
	this.textField.addEventListener('keypress', function(evt) {
	
		if(me.checkModifiers(evt) && (evt.keyCode == 38 || evt.keyCode == 40)) {
			// Up or down arrow pressed, check if there's something 
			// increment/decrement-able where the caret is
			var caret = this.selectionStart, text = this.value,
				//regex = new RegExp('^([\\s\\S]{0,' + caret + '}[^-0-9\\.])(-?[0-9]*(?:\\.?[0-9]+)(?:' + me.units + '))\\b', 'i');
				regex = new RegExp('^([\\s\\S]{0,' + caret + '}[^-0-9\\.])(-?[0-9]*(?:\\.?[0-9]+)(?:' + me.units + '))\\b', 'i');
				
			this.value = this.value.replace(regex, function($0, $1, $2) {
				if($1.length <= caret && $1.length + $2.length >= caret) {
					return $1 + Incrementable.step($2, evt.keyCode == 40);
				}
				else {
					return $1 + $2;
				}
			});
			
			
			this.selectionStart = caret;		// Set the caret for Opera...
			this.selectionEnd = 0;
			if (!this.selectionStart){			// then reest for others
				this.selectionStart = this.selectionEnd = caret;
				}
			
			evt.preventDefault();
			evt.stopPropagation();
		}
	}, false);
}

Incrementable.prototype = {
	checkModifiers: function(evt) {
		var m = this.modifiers;
		
		return m.ctrlKey * evt.ctrlKey + m.altKey * evt.altKey + m.shiftKey * evt.shiftKey >= 3
				|| (m.ctrlKey + m.altKey + m.shiftKey == 0);
	},
	
	units: '|%|deg|px|r?em|ex|ch|in|cm|mm|pt|pc|vm|vw|vh|gd|m?s'
};

/**
 * Gets a <length> and increments or decrements it
 */
Incrementable.step = function(length, decrement) {

	var num = length.match(/-?\d+(\.\d+)?/);	// split into int / float parts
	var i = parseInt(num[0]),
		dp = num[1] ? num[1].length-1 : 0;		// determine number of decimal points
		
	var val = (parseFloat(num[0]) + (decrement ? -1 : 1)/Math.pow(10, dp)).toFixed(dp); // keep dp
	
	return val + length.replace(/^-|[0-9]+|\./g, '');
};
