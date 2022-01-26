/**
 * Copyright (c) 2020 Oleg Sergeev (sergoleg@gmail.com)
 */

"use strict";

// Контроллер магистрали данных WDPF
var SHC = { _reserve: {} };

// Каталог имен параметров контроллера магистрали данных WDPF
var SPD = [];

// общая информация о графическом изображении
var DIAGRAM = new Object();

// Разрешить простые подсказки
var ToolTipEnable = true;

// Игнорировать вызов видеограмма с номерами:
var DiagIgnore = new Array(1001, 3714, 5000);

var DEF_QUAL = {
	'G_fgcolor': 0x00FF00,
	'G_bgcolor': 0x000000,
	'G_blink': 0,
	'G_string': 'G',
	'F_fgcolor': 0x00FFFF,
	'F_bgcolor': 0x000000,
	'F_blink': 0,
	'F_string': 'F',
	'P_fgcolor': 0xFFFF00,
	'P_bgcolor': 0x000000,
	'P_blink': 0,
	'P_string': 'P',
	'B_fgcolor': 0xFF00FF,
	'B_bgcolor': 0x000000,
	'B_blink': 0,
	'B_string': 'B',
	'T_fgcolor': 0xFF0000,
	'T_bgcolor': 0x000000,
	'T_blink': 0,
	'T_string': 'T',
};

var COLOR = {
	"fg": 0x000000,
	"bg": 0xFF0000,
	"er": 0xFFD700,
	"ol": 0
};

// OPEN LOOK Color (gray80, gray70, LightCyan4, PaleTurquoise4, gray55)
var OLCOLOR = [0xCCCCCC, 0xB3B3B3, 0x7A8B8B, 0x668B8B, 0x8C8C8C];

// Blink (Мигание)
var BLINK = {
	"fg": 0,
	"bg": 0
};

// Line Widths (Толщина линий)
var LINEWIDTHS_v1 = [16, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 480];
var LINEWIDTHS_v2 = [18, 18, 36, 72, 108, 144, 180, 216, 252, 288, 324, 360, 396, 432, 468, 504, 540];
var LINEWIDTHS_v3 = [16, 40, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600];

var LINEWIDTHS = [];

LINEWIDTHS = LINEWIDTHS_v1;

// Line Patterns (Типы линий)
var LINEPATTERNS = {
	// ASTERISKS BLOCKS HORZ_SLASH VERT_SLASH WEST_LOGO BACK_SLASH SLASH
	// SOLID OUTLINE ALUMINUM UNFILLED
	'SOLID': [],
	'BIG_DOTS': [30, 60],
	'DASH_DOT': [100, 100, 20, 100],
	'DASHED': [100, 100],
	'DOT_DASH': [20, 100, 100, 100],
	'DOTTED': [20, 20],
	'NEAR_SOLID': [100, 50],
	'SM_DASH': [60, 60],
	'SPARSE': [100, 250]
};

// Имя и стиль шрифта всех последующих команд на основе векторного текста
var FONT = {
	'family': 'Lucida_Sans_Typewriter_REGULAR'
};

var FM = new Object();

// Панель управления или pop-up окно
var CNTRL_PANEL = {
	'SetPointName': 'point1',	// SETPOINT — set point for a algorithm
	'OutPointName': 'point2'	// OUTPUT — output point for a algorithm
};

// Глобальная Установочная переменная.
// SET1 в главном экране совпадает с SET1 в производном окне.
var SET = [];
var $SET = [];

// Указатели $W (указатели окна) - Локальный аргумент вызова
// производного окна из главного экрана
var $W = [];
var flag_init_PopUp = false;	// флаг открытия pop-pup окна
var update_counter_PopUp = 0;	// счетчик обновлений текущего pop-pup окна





var EntryFieldData = CreateArray(255, "      ");	// 1 - 254
//var EntryFieldFlag = CreateArray(255, false);		// 1 - 254
//var EntryFieldKeyDownHandler;
var EntryFieldKeyUpHandler;





var f_trig_on = Create_trig_on_array(256);

// Указатели $P (указатели сверхоперативной памяти) - Глобальный
var $P$A = Create2DArray(100);
var $P$B = Create2DArray(100);
var $P$I = Create2DArray(100);
var $P$R = Create2DArray(100);
var $P$S = Create2DArray(100);

// Указатели $G (групповые указатели) - Глобальный
var $G = [];

// Указатели $H (магистральные указатели) - Глобальный
var $H = [];





/*******************************************************************************
 */
function CreateArray(rows, init) {
	let arr = [];
	for (let i = 0; i < rows; i++) {
		arr[i] = init;
	}
	return arr;
};

/*******************************************************************************
 */
function Create_trig_on_array(rows) {
	let arr = [];
	for (let i = 0; i < rows; i++) {
		arr[i] = false;
	}
	return arr;
};

/*******************************************************************************
 */
function Create2DArray(rows) {
	let arr = [];
	for (let i = 0; i < rows; i++) {
		arr[i] = [];
	}
	return arr;
};

/*******************************************************************************
 */
/*
function makeid(length) {
	let result           = '';
	const characters     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for ( let i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
*/

/*******************************************************************************
 * https://raw.githubusercontent.com/alexei/sprintf.js/master/src/sprintf.js
 */
/* global window, exports, define */
/*
!function() {
    'use strict'

	var re = {
        not_string: /[^s]/,
        not_bool: /[^t]/,
        not_type: /[^T]/,
        not_primitive: /[^v]/,
        number: /[diefg]/,
        numeric_arg: /[bcdiefguxX]/,
        json: /[j]/,
        not_json: /[^j]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        key_access: /^\.([a-z_][a-z_\d]*)/i,
        index_access: /^\[(\d+)\]/,
        sign: /^[+-]/
    }

    function sprintf(key) {
        // `arguments` is not an array, but should be fine for this call
        return sprintf_format(sprintf_parse(key), arguments)
    }

    function vsprintf(fmt, argv) {
        return sprintf.apply(null, [fmt].concat(argv || []))
    }

    function sprintf_format(parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, arg, output = '', i, k, ph, pad, pad_character, pad_length, is_positive, sign
        for (i = 0; i < tree_length; i++) {
            if (typeof parse_tree[i] === 'string') {
                output += parse_tree[i]
            }
            else if (typeof parse_tree[i] === 'object') {
                ph = parse_tree[i] // convenience purposes only
                if (ph.keys) { // keyword argument
                    arg = argv[cursor]
                    for (k = 0; k < ph.keys.length; k++) {
                        if (arg == undefined) {
                            throw new Error(sprintf('[sprintf] Cannot access property "%s" of undefined value "%s"', ph.keys[k], ph.keys[k-1]))
                        }
                        arg = arg[ph.keys[k]]
                    }
                }
                else if (ph.param_no) { // positional argument (explicit)
                    arg = argv[ph.param_no]
                }
                else { // positional argument (implicit)
                    arg = argv[cursor++]
                }

                if (re.not_type.test(ph.type) && re.not_primitive.test(ph.type) && arg instanceof Function) {
                    arg = arg()
                }

                if (re.numeric_arg.test(ph.type) && (typeof arg !== 'number' && isNaN(arg))) {
                    throw new TypeError(sprintf('[sprintf] expecting number but found %T', arg))
                }

                if (re.number.test(ph.type)) {
                    is_positive = arg >= 0
                }

                switch (ph.type) {
                    case 'b':
                        arg = parseInt(arg, 10).toString(2)
                        break
                    case 'c':
                        arg = String.fromCharCode(parseInt(arg, 10))
                        break
                    case 'd':
                    case 'i':
                        arg = parseInt(arg, 10)
                        break
                    case 'j':
                        arg = JSON.stringify(arg, null, ph.width ? parseInt(ph.width) : 0)
                        break
                    case 'e':
                        arg = ph.precision ? parseFloat(arg).toExponential(ph.precision) : parseFloat(arg).toExponential()
                        break
                    case 'f':
                        arg = ph.precision ? parseFloat(arg).toFixed(ph.precision) : parseFloat(arg)
                        break
                    case 'g':
                        arg = ph.precision ? String(Number(arg.toPrecision(ph.precision))) : parseFloat(arg)
                        break
                    case 'o':
                        arg = (parseInt(arg, 10) >>> 0).toString(8)
                        break
                    case 's':
                        arg = String(arg)
                        arg = (ph.precision ? arg.substring(0, ph.precision) : arg)
                        break
                    case 't':
                        arg = String(!!arg)
                        arg = (ph.precision ? arg.substring(0, ph.precision) : arg)
                        break
                    case 'T':
                        arg = Object.prototype.toString.call(arg).slice(8, -1).toLowerCase()
                        arg = (ph.precision ? arg.substring(0, ph.precision) : arg)
                        break
                    case 'u':
                        arg = parseInt(arg, 10) >>> 0
                        break
                    case 'v':
                        arg = arg.valueOf()
                        arg = (ph.precision ? arg.substring(0, ph.precision) : arg)
                        break
                    case 'x':
                        arg = (parseInt(arg, 10) >>> 0).toString(16)
                        break
                    case 'X':
                        arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase()
                        break
                }
                if (re.json.test(ph.type)) {
                    output += arg
                }
                else {
                    if (re.number.test(ph.type) && (!is_positive || ph.sign)) {
                        sign = is_positive ? '+' : '-'
                        arg = arg.toString().replace(re.sign, '')
                    }
                    else {
                        sign = ''
                    }
                    pad_character = ph.pad_char ? ph.pad_char === '0' ? '0' : ph.pad_char.charAt(1) : ' '
                    pad_length = ph.width - (sign + arg).length
                    pad = ph.width ? (pad_length > 0 ? pad_character.repeat(pad_length) : '') : ''
                    output += ph.align ? sign + arg + pad : (pad_character === '0' ? sign + pad + arg : pad + sign + arg)
                }
            }
        }
        return output
    }

    var sprintf_cache = Object.create(null)

    function sprintf_parse(fmt) {
        if (sprintf_cache[fmt]) {
            return sprintf_cache[fmt]
        }

        var _fmt = fmt, match, parse_tree = [], arg_names = 0
        while (_fmt) {
            if ((match = re.text.exec(_fmt)) !== null) {
                parse_tree.push(match[0])
            }
            else if ((match = re.modulo.exec(_fmt)) !== null) {
                parse_tree.push('%')
            }
            else if ((match = re.placeholder.exec(_fmt)) !== null) {
                if (match[2]) {
                    arg_names |= 1
                    var field_list = [], replacement_field = match[2], field_match = []
                    if ((field_match = re.key.exec(replacement_field)) !== null) {
                        field_list.push(field_match[1])
                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1])
                            }
                            else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1])
                            }
                            else {
                                throw new SyntaxError('[sprintf] failed to parse named argument key')
                            }
                        }
                    }
                    else {
                        throw new SyntaxError('[sprintf] failed to parse named argument key')
                    }
                    match[2] = field_list
                }
                else {
                    arg_names |= 2
                }
                if (arg_names === 3) {
                    throw new Error('[sprintf] mixing positional and named placeholders is not (yet) supported')
                }

                parse_tree.push(
                    {
                        placeholder: match[0],
                        param_no:    match[1],
                        keys:        match[2],
                        sign:        match[3],
                        pad_char:    match[4],
                        align:       match[5],
                        width:       match[6],
                        precision:   match[7],
                        type:        match[8]
                    }
                )
            }
            else {
                throw new SyntaxError('[sprintf] unexpected placeholder')
            }
            _fmt = _fmt.substring(match[0].length)
        }
        return sprintf_cache[fmt] = parse_tree
    }

    // export to either browser or node.js
    // eslint-disable quote-props
    if (typeof exports !== 'undefined') {
        exports['sprintf'] = sprintf
        exports['vsprintf'] = vsprintf
    }
    if (typeof window !== 'undefined') {
        window['sprintf'] = sprintf
        window['vsprintf'] = vsprintf

        if (typeof define === 'function' && define['amd']) {
            define(function() {
                return {
                    'sprintf': sprintf,
                    'vsprintf': vsprintf
                }
            })
        }
    }
    // eslint-enable quote-props
}(); // eslint-disable-line
*/

/**
 * Copyright (c) 2010 Jakob Westhoff
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function (window) {
	var sprintf = function (format) {
		// Check for format definition
		if (typeof format != 'string') {
			throw "sprintf: The first arguments need to be a valid format string.";
		}

		//
		// Define the regex to match a formating string
		// The regex consists of the following parts:
		// percent sign to indicate the start
		// (optional) sign specifier
		// (optional) padding specifier
		// (optional) alignment specifier
		// (optional) width specifier
		// (optional) precision specifier
		// type specifier:
		//  % - literal percent sign
		//  b - binary number
		//  c - ASCII character represented by the given value
		//  d - signed decimal number
		//  f - floating point value
		//  o - octal number
		//  s - string
		//  x - hexadecimal number (lowercase characters)
		//  X - hexadecimal number (uppercase characters)
		//
		var r = new RegExp(/%(\+)?([0 ]|'(.))?(-)?([0-9]+)?(\.([0-9]+))?([%bcdfosxXeE])/g);

		//
		// Each format string is splitted into the following parts:
		// 0: Full format string
		// 1: sign specifier (+)
		// 2: padding specifier (0/<space>/'<any char>)
		// 3: if the padding character starts with a ' this will be the real
		//    padding character
		// 4: alignment specifier
		// 5: width specifier
		// 6: precision specifier including the dot
		// 7: precision specifier without the dot
		// 8: type specifier
		//
		var parts = [],
			paramIndex = 1,
			part;

		while (part = r.exec(format)) {
			// Check if an input value has been provided, for the current
			// format string
			if (paramIndex >= arguments.length) {
				throw "sprintf: At least one argument was missing.";
			}

			parts[parts.length] = {
				// beginning of the part in the string
				begin: part.index,
				// end of the part in the string
				end: part.index + part[0].length,
				// force sign
				sign: (part[1] == '+'),
				// is the given data negative
				// negative: ( parseInt( arguments[paramIndex] ) < 0 ) ? true : false,
				negative: (arguments[paramIndex] < 0) ? true : false,
				// padding character (default: <space>)
				padding: (part[2] === undefined)
					? (' ') // default
					: ((part[2].substring(0, 1) == "'")
						? (part[3]) // use special char
						: (part[2]) // use normal <space> or zero
					),
				// should the output be aligned left?
				alignLeft: (part[4] == '-'),
				// width specifier (number or false)
				width: (part[5] !== undefined) ? part[5] : false,
				// precision specifier (number or false)
				precision: (part[7] !== undefined) ? part[7] : false,
				// type specifier
				type: part[8],
				// the given data associated with this part converted to a string
				data: (part[8] != '%') ? String(arguments[paramIndex++]) : false
			};
		}

		var newString = "";
		var start = 0;
		// Generate our new formated string
		for (var i = 0; i < parts.length; ++i) {
			// Add first unformated string part
			newString += format.substring(start, parts[i].begin);

			// Mark the new string start
			start = parts[i].end;

			// Create the appropriate preformat substitution
			// This substitution is only the correct type conversion. All the
			// different options and flags haven't been applied to it at this
			// point
			var preSubstitution = "";
			switch (parts[i].type) {
				case '%':
					preSubstitution = "%";
					break;
				case 'b':
					preSubstitution = Math.abs(parseInt(parts[i].data)).toString(2);
					break;
				case 'c':
					preSubstitution = String.fromCharCode(Math.abs(parseInt(parts[i].data)));
					break;
				case 'd':
					preSubstitution = String(Math.abs(parseInt(parts[i].data)));
					break;
				case 'f':
					preSubstitution = Math.abs(parseFloat(parts[i].data)).toFixed(parts[i].precision);
					break;
				case 'o':
					preSubstitution = Math.abs(parseInt(parts[i].data)).toString(8);
					break;
				case 's':
					preSubstitution = parts[i].data.substring(0, parts[i].precision ? parts[i].precision : parts[i].data.length); /* Cut if precision is defined */
					break;
				case 'x':
					preSubstitution = Math.abs(parseInt(parts[i].data)).toString(16).toLowerCase();
					break;
				case 'X':
					preSubstitution = Math.abs(parseInt(parts[i].data)).toString(16).toUpperCase();
					break;
				case 'e':
					preSubstitution = String(parseFloat(parts[i].data).toExponential(parts[i].precision));
					break;
				case 'E':
					preSubstitution = String(parseFloat(parts[i].data).toExponential(parts[i].precision)).toUpperCase();
					break;
				default:
					throw 'sprintf: Unknown type "' + parts[i].type + '" detected. This should never happen. Maybe the regex is wrong.';
			}

			// The % character is a special type and does not need further processing
			if (parts[i].type == "%") {
				newString += preSubstitution;
				continue;
			}

			// Modify the preSubstitution by taking sign, padding and width
			// into account

			// Add a sign symbol if neccessary or enforced, but only if we are
			// not handling a string

			if (parts[i].type == 'b'
				|| parts[i].type == 'd'
				|| parts[i].type == 'o'
				|| parts[i].type == 'f'
				|| parts[i].type == 'x'
				|| parts[i].type == 'X') {
				if (parts[i].negative == true) {
					preSubstitution = "-" + preSubstitution;
				}
				else if (parts[i].sign == true) {
					preSubstitution = "+" + preSubstitution;
				}
			}


			// Pad the string based on the given width
			if (parts[i].width !== false) {
				// Padding needed?
				if (parts[i].width > preSubstitution.length) {
					var origLength = preSubstitution.length;
					for (var j = 0; j < parts[i].width - origLength; ++j) {
						preSubstitution = (parts[i].alignLeft === true)
							? (preSubstitution + parts[i].padding)
							: (parts[i].padding + preSubstitution);
					}
				}
			}

			// Add the substitution to the new string
			newString += preSubstitution;
		}

		// Add the last part of the given format string, which may still be there
		newString += format.substring(start, format.length);

		return newString;
	};

	window.sprintf = sprintf;
	String.prototype.printf = function () {
		var args = arguments;
		if ((args.length == 1) && Array.isArray(args[0])) {
			args = args[0];
		}
		var newArgs = Array.prototype.slice.call(args);
		newArgs.unshift(String(this));
		return sprintf.apply(undefined, newArgs);
	};
})(window);

/**
 * Рисование простых элементов для shspelib: Линия, Многоугольник, Дуга, Точка, Эллипс,
 * Прямоугольник
 */

/** simple LINE + */
function sLINE(t, n, xn, yn, lw, lp) {
	t.lineStyle(LINEWIDTHS[lw], COLOR.fg, 1);
	t.moveTo(xn[0], yn[0]);
	for (var i = 1, ii = n; i < ii; i++) {
		t.lineTo(xn[i], yn[i]);
	}
};

/** simple POLYGON + */
function sPOLYGON(t, n, xn, yn, lw, lp, fp) {
	let points = [xn[0], yn[0]];

	for (let i = 1, ii = n; i < ii; i++) {
		points = points.concat([xn[i], yn[i]]);
	}

	//if (fp != 'UNFILLED') { t.beginTextureFill({texture: fp2texture(fp)}); }
	switch (fp) {
		case 'UNFILLED': break;
		case 'SOLID': t.beginFill(COLOR.fg, 1); break;
		case 'OUTLINE': t.beginFill(COLOR.bg, 1); break;
		default: t.beginTextureFill({ texture: fp2texture(fp), matrix: FILLPATTERNSMATRIX }); break;
	}

	t.lineStyle(LINEWIDTHS[lw], COLOR.fg);
	t.drawPolygon(points);

	if (fp != 'UNFILLED') { t.endFill(); }
};

/** simple ARC + */
// https://developer.mozilla.org/ru/docs/Web/API/Canvas_API/Tutorial/%D0%A0%D0%B8%D1%81%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5_%D1%84%D0%B8%D0%B3%D1%83%D1%80
function sARC(t, a_x, a_y, a_w, a_h, a_angle1, a_angle2, lw, lp, fp) {
	//if (fp != 'UNFILLED') { t.beginTextureFill({texture: fp2texture(fp)}); }
	switch (fp) {
		case 'UNFILLED': break;
		case 'SOLID': t.beginFill(COLOR.fg, 1); break;
		case 'OUTLINE': t.beginFill(COLOR.bg, 1); break;
		default: t.beginTextureFill({ texture: fp2texture(fp), matrix: FILLPATTERNSMATRIX }); break;
	}

	t.lineStyle(LINEWIDTHS[lw], COLOR.fg);

	let x = a_x + (a_w / 2),
		y = a_y + (a_h / 2),
		startAngle = a_angle1,
		arc = a_angle2,
		radius = a_w / 2,
		yRadius = a_h / 2;
	let segAngle, theta, angle, angleMid, segs, ax, ay, bx, by, cx, cy;

	if (Math.abs(arc) > 360) arc = 360;
	segs = Math.ceil(Math.abs(arc) / 6);
	segAngle = arc / segs;
	theta = -(segAngle / 180) * Math.PI;
	angle = -(startAngle / 180) * Math.PI;
	if (segs > 0) {
		ax = x + Math.cos(startAngle / 180 * Math.PI) * radius;
		ay = y + Math.sin(-startAngle / 180 * Math.PI) * yRadius;
		// sb.append("M "+Math.round(ax)+" "+Math.round(ay));
		t.moveTo(Math.round(ax), Math.round(ay));
		for (let i = 0; i < segs; i++) {
			angle += theta;
			angleMid = angle - (theta / 2);
			bx = x + Math.cos(angle) * radius;
			by = y + Math.sin(angle) * yRadius;
			cx = x + Math.cos(angleMid) * (radius / Math.cos(theta / 2));
			cy = y + Math.sin(angleMid) * (yRadius / Math.cos(theta / 2));
			// sb.append(" Q "+Math.round(cx)+" "+Math.round(cy)+"
			// "+Math.round(bx)+" "+Math.round(by));
			t.quadraticCurveTo(Math.round(cx), Math.round(cy), Math.round(bx), Math.round(by));
		}
	}

	if (fp != 'UNFILLED') t.endFill();
};

/** simple DOT + */
function sDOT(t, x, y, s) {
	const radius = {
		"SMALL": 33,
		"MEDIUM": 66,
		"LARGE": 99
	};

	t.beginFill(COLOR.fg, 1);

	t.lineStyle(LINEWIDTHS[0], COLOR.fg);
	t.drawCircle(x, y, radius[s]);

	t.endFill();
};

/** simple ELLIPSE + */
function sELLIPSE(t, x, y, hr, vr, lw, lp, fp) {
	//if (fp != 'UNFILLED') { t.beginTextureFill({texture: fp2texture(fp)}); }
	switch (fp) {
		case 'UNFILLED': break;
		case 'SOLID': t.beginFill(COLOR.fg, 1); break;
		case 'OUTLINE': t.beginFill(COLOR.bg, 1); break;
		default: t.beginTextureFill({ texture: fp2texture(fp), matrix: FILLPATTERNSMATRIX }); break;
	}

	t.lineStyle(LINEWIDTHS[lw], COLOR.fg);
	t.drawEllipse(x, y, hr, vr);

	if (fp != 'UNFILLED') t.endFill();
};

/** simple RECTANGLE + */
function sRECTANGLE(t, x, y, w, h, lw, lp, fp) {
	//if (fp != 'UNFILLED') { t.beginTextureFill({texture: fp2texture(fp)}); }
	switch (fp) {
		case 'UNFILLED': break;
		case 'SOLID': t.beginFill(COLOR.fg, 1); break;
		case 'OUTLINE': t.beginFill(COLOR.bg, 1); break;
		default: t.beginTextureFill({ texture: fp2texture(fp), matrix: FILLPATTERNSMATRIX }); break;
	}

	t.lineStyle(LINEWIDTHS[lw], COLOR.fg);
	t.drawRect(x, y, w, h);

	if (fp != 'UNFILLED') t.endFill();
};

/**
 * Graphics Language Commands
 */

/** ARC + */
function Garc(x, y, w, h, a1, a2, lw, lp, fp) {
	let arc = new PIXI.Graphics();
	sARC(arc, x, y, w, h, a1, a2, lw, lp, fp);
	paper.push(arc);
};

/** CIRCLE + */
function Gcircle(cx, cy, r, lw, lp, fp) {
	let circle = new PIXI.Graphics();
	sELLIPSE(circle, cx, cy, r, r, lw, lp, fp);
	paper.push(circle);
};

/** DOT + */
function Gdot(x, y, s) {
	let dot = new PIXI.Graphics();
	sDOT(dot, x, y, s);
	paper.push(dot);
}

/** ELLIPSE + */
function Gellipse(cx, cy, hr, vr, lw, lp, fp) {
	let ellipse = new PIXI.Graphics();
	sELLIPSE(ellipse, cx, cy, hr, vr, lw, lp, fp);
	paper.push(ellipse);
};

/** ARCPOLYGON */
function Garcpolygon() { console.info('ARCPOLYGON not implemented') };

/** BACKGROUND */
function Gbackground() { console.info('BACKGROUND not implemented') };

/** Для команд BAR и OL_GAUGE (заполняемый прямоугольник) */
var getProportion = function (vl, ll, hl) {
	var p = (vl - ll) / (hl - ll);

	if (isNaN(p)) {
		p = ll;
	}

	if (p < 0.0) p = 0.0;
	if (p > 1.0) p = 1.0;
	return Number(p);
};

/** BAR */
/**
 * Команда BAR (заполняемый прямоугольник)
 * 
 * w - Ширина прямоугольника (размер прямоугольника в направлении,
 * перпендикулярном направлению заполнения).
 * 
 * h - Высота прямоугольника (максимально допустимый размер прямоугольника в
 * направлении его заполнения).
 * 
 * оттестированы "UP" и "RIGHT" и "BIAS"
 * 
 * Исходной точкой может являться: - Верхний левый угол прямоугольника (с
 * заполнением down или right или bias). - Нижний левый угол прямоугольника (с
 * заполнением up). - Верхний правый угол прямоугольника (с заполнением left.
 */
function Gbar(_x, _y, _w, _h, _direction, _val, _low_limit, _high_limit) {

	if ((_val === undefined) || (_low_limit === undefined) || (_high_limit === undefined)) return;
	if (isNaN(_low_limit) || isNaN(_high_limit)) return;

	let X1, Y1, W1, H1;
	let st2;

	let vl = +_val;
	let ll = +_low_limit;
	let hl = +_high_limit;

	switch (_direction) {
		case 'UP': // = Bottom to top
			/**
			 * (1) w (2) |------| | | |######| |######| h |######| |######| *------|
			 * (0) (3) (x,y)
			 */
			X1 = _x; Y1 = _y - _h; W1 = _w; H1 = _h;

			st2 = [
				_x, _y,
				_x, _y + parseInt(-_h * getProportion(vl, ll, hl)),
				_x + _w, _y + parseInt(-_h * getProportion(vl, ll, hl)),
				_x + _w, _y,
				_x, _y
			];

			break;
		case 'RIGHT': // = Left to right
			/**
			 * (x,y) (0) (1) *------------ |####### | |####### | w |####### |
			 * ------------- (3) h (2)
			 */
			X1 = _x; Y1 = _y; W1 = _h; H1 = _w;

			st2 = [
				_x, _y,
				_x + parseInt(_h * getProportion(vl, ll, hl)), _y,
				_x + parseInt(_h * getProportion(vl, ll, hl)), _y + _w,
				_x, _y + _w,
				_x, _y];

			break;
		case 'BIAS': // = Up or down from the 0 value position
			/**
			 * (x,y) (0) (1) *---------- | | (0)#######(1)ybegin |#########|
			 * |#########| h |#########| (3)#######(2)yend | | ----------- (3) w (2)
			 */
			X1 = _x; Y1 = _y; W1 = _w; H1 = _h;

			var p = getProportion(vl, ll, hl);
			var ybegin = parseInt(_y + (_h / 2) - (_h * p / 2));

			st2 = [
				_x, ybegin,
				_x + _w, ybegin,
				_x + _w, ybegin + _h * p,
				_x, ybegin + _h * p,
				_x, ybegin];

			break;
		case 'LEFT': // = Right to left
			/**
			 * (x,y) (3) (0) ------------* | #######| | #######| w | #######|
			 * ------------- (2) h (1)
			 */
			X1 = _x - _h; Y1 = _y; W1 = _h; H1 = _w;

			st2 = [
				_x, _y,
				_x, _y + _w,
				_x - _h * getProportion(vl, ll, hl), _y + _w,
				_x - _h * getProportion(vl, ll, hl), _y,
				_x, _y];

			break;
		case 'DOWN': // = Top to bottom
			/**
			 * (x,y) (0) w (1) *-------| |#######| |#######| |#######| h | | | |
			 * |-------| (3) (2)
			 */
			X1 = _x; Y1 = _y; W1 = _w; H1 = _h;

			st2 = [
				_x, _y,
				_x + _w, _y,
				_x + _w, _y + _h * getProportion(vl, ll, hl),
				_x, _y + _h * getProportion(vl, ll, hl),
				_x, _y];

			break;
	}

	let bar = new PIXI.Graphics();

	// отрисовка незаполненной части цветом er_color
	bar.lineStyle(0);
	bar.beginFill(COLOR.er, 1);
	bar.drawRoundedRect(X1, Y1, W1, H1);
	bar.endFill();

	// отрисовка заполненной части цветом fg_color
	bar.lineStyle(0);
	bar.beginFill(COLOR.fg, 1);
	bar.drawPolygon(st2);
	bar.endFill();

	// var info = Snap.parse('<title>value='+_val.toFixed(1)+',
	// low_limit='+_low_limit.toFixed(1)+',
	// high_limit='+_high_limit.toFixed(1)+'</title>');

	paper.push(bar);
}; // Gbar

/** OL_GAUGE */
/*******************************************************************************
 * Команда OL_GAUGE (заполняемый прямоугольник)
 * 
 * Правила
 * 
 * 1. Исходной точкой шаблона является верхний левый угол контурного
 * прямоугольника шаблона (отличие от команды BAR).
 * 
 * 2. Фон эллиптического шаблона вычерчивается в цвете OL. Столбиковая часть
 * шаблона вычерчивается в цвете FG.
 * 
 * 3. На конце нижнего предела столбиковой части шаблона для всех направлений
 * (кроме шаблона BIAS) вычерчивается закругленный оконечный элемент.
 * 
 * оттестированы "UP" и "BIAS"
 */
function Gol_gauge(_x, _y, _w, _h, _direction, _val, _low_limit, _high_limit) {

	if ((_val === undefined) || (_low_limit === undefined) || (_high_limit === undefined)) return;
	if (isNaN(_low_limit) || isNaN(_high_limit)) return;

	let st2;
	let X2, Y2, W2, H2;

	let vl = +_val;
	let ll = +_low_limit;
	let hl = +_high_limit;

	let tw = _w, th = _h;

	switch (_direction) {
		case 'UP': // = Bottom to top
			/**
			 * (x,y) w *------| | | |######| |######| h |######| |######| |------|
			 */
			X2 = _x;
			Y2 = _y + _h - _h * getProportion(vl, ll, hl);
			W2 = _w;
			H2 = _h * getProportion(vl, ll, hl);

			break;
		case 'RIGHT': // = Left to right
			/**
			 * (x,y) h *------------ |####### | |####### | w |####### |
			 * -------------
			 */
			X2 = _x;
			Y2 = _y;
			W2 = _h * getProportion(vl, ll, hl);
			H2 = _w;

			_w = th, _h = tw;

			break;
		case 'BIAS': // = Up or down from the 0 value position
			/**
			 * (x,y) w *---------- | | |#########| ybegin |#########| |#########| h
			 * |#########| |#########| | | -----------
			 */
			var p = getProportion(vl, ll, hl);
			var ybegin = _y + (_h / 2) - (_h * p / 2);

			X2 = _x;
			Y2 = ybegin;
			W2 = _w;
			H2 = _h * p;

			break;
		case 'LEFT': // = Right to left
			/**
			 * (x,y) h *------------ | #######| | #######| w | #######|
			 * -------------
			 */
			X2 = _x + _h - _h * getProportion(vl, ll, hl);
			Y2 = _y;
			W2 = _h * getProportion(vl, ll, hl);
			H2 = _w;

			_w = th, _h = tw;

			break;
		case 'DOWN': // = Top to bottom
			/**
			 * (x,y) w |------| |######| |######| |######| h | | | | |-- ---|
			 */
			X2 = _x;
			Y2 = _y;
			W2 = _w;
			H2 = _h * getProportion(vl, ll, hl);

			break;
	}

	let ol_gauge = new PIXI.Graphics();

	// Фон эллиптического шаблона вычерчивается в цвете OL
	ol_gauge.lineStyle(0);
	ol_gauge.beginFill(OLCOLOR[COLOR.ol], 1);
	ol_gauge.drawRoundedRect(_x, _y, _w, _h, (Math.min.apply(null, [_w, _h]) * 0.25));
	ol_gauge.endFill();

	// Столбиковая часть шаблона вычерчивается в цвете FG
	ol_gauge.lineStyle(0);
	ol_gauge.beginFill(COLOR.fg, 1);
	ol_gauge.drawRoundedRect(X2, Y2, W2, H2, (Math.min.apply(null, [W2, H2]) * 0.25));
	ol_gauge.endFill();

	// var info = Snap.parse('<title>value='+_val.toFixed(1)+',
	// low_limit='+_low_limit.toFixed(1)+',
	// high_limit='+_high_limit.toFixed(1)+'</title>');

	paper.push(ol_gauge);
}; // Gol_gauge

/** BMP_IMAGE */
function Gbmp_image() { console.info('BMP_IMAGE not implemented') };

/** COLOR */
function Gcolor(fg, bg, er, ol) {
	COLOR = {
		"fg": fg,
		"bg": bg,
		"er": er,
		"ol": ol
	};
};
function Gblink(fg, bg) {
	BLINK = {
		"fg": fg,
		"bg": bg
	};
};

/** CURSOR */
function Gcursor() { console.info('CURSOR not implemented') };

function paddle_left(dd) {
	if (dd < 10) dd = '0' + dd;
	return dd;
};

/** DATE + */
function Gdate(x, y, format, font_type, font_num, char_w, char_h, lw) {
	let d = new Date(),
		mm = paddle_left(d.getMonth() + 1),
		dd = paddle_left(d.getDate()),
		yy = paddle_left(d.getYear() - 100),
		yyyy = d.getFullYear(),
		month_names = new Array(
			"JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JLY", "AUG", "SEP",
			"OCT", "NOV", "DEC"),
		mmm = month_names[mm], frm = "";

	switch (format) {
		case 0:	// = 0 - mm/dd/yy
			frm = mm + "/" + dd + "/" + yy;
			break;
		case 1:	// = 1 - mmm dd,yyyy
			frm = mmm + " " + dd + ", " + yyyy;
			break;
		case 2:	// = 2 - mm/dd
			frm = mm + "/" + dd;
			break;
		case 3:	// = 3 - mm-dd-yy
			frm = mm + "-" + dd + "-" + yy;
			break;
		case 4:	// = 4 - dd/mmm/yy
			frm = dd + "/" + mmm + "/" + yy;
			break;
		default:	// = 0 - mm/dd/yy
			frm = mm + "/" + dd + "/" + yy;
			break;
	}

	Gtext(x, y, frm, "HORZ", font_type, font_num, char_w, char_h, lw);
};

/** TIME + */
function Gtime(x, y, format, font_type, font_num, char_w, char_h, lw) {
	let d = new Date(),
		hh = paddle_left(d.getHours()),
		mm = paddle_left(d.getMinutes()),
		ss = paddle_left(d.getSeconds()),
		t = d.getMilliseconds(),
		frm = "";

	switch (format) {
		case 0: // 0 - hh:mm:ss
			frm = hh + ":" + mm + ":" + ss;
			break;
		case 1: // 1 - hh:mm:ss:t
			frm = hh + ":" + mm + ":" + ss + ":" + t;
			break;
		case 2: // 2 - hh:mm
			frm = hh + ":" + mm;
			break;
		default: // 0 - hh:mm:ss
			frm = hh + ":" + mm + ":" + ss;
			break;
	}

	if (OvVerbose) {
		frm = hh + ":" + mm + ":" + ss + ":" + t;
	}

	Gtext(x, y, frm, "HORZ", font_type, font_num, char_w, char_h, lw);
};

/** DEF_FKEY_GROUP */
function Gdef_fkey_group() { console.info('DEF_FKEY_GROUP not implemented') };

/** DEF_MACRO_PARAMS */
/**
 * Команда DEF_MACRO_PARAMS позволяет пользователю создавать/редактировать
 * метки описания параметров макроса, а также примечания к макросам и комментарии
 */
function Gdef_macro_params() {
	//console.info('DEF_MACRO_PARAMS not implemented')
};

/** DEF_QUAL */
function Gdef_qual(
	_G_fgcolor, _G_bgcolor, _G_blink, _G_string,
	_F_fgcolor, _F_bgcolor, _F_blink, _F_string,
	_P_fgcolor, _P_bgcolor, _P_blink, _P_string,
	_B_fgcolor, _B_bgcolor, _B_blink, _B_string,
	_T_fgcolor, _T_bgcolor, _T_blink, _T_string) {
	DEF_QUAL.G_fgcolor = _G_fgcolor; DEF_QUAL.G_bgcolor = _G_bgcolor; DEF_QUAL.G_blink = _G_blink; DEF_QUAL.G_string = _G_string;
	DEF_QUAL.F_fgcolor = _F_fgcolor; DEF_QUAL.F_bgcolor = _F_bgcolor; DEF_QUAL.F_blink = _F_blink; DEF_QUAL.F_string = _F_string;
	DEF_QUAL.P_fgcolor = _P_fgcolor; DEF_QUAL.P_bgcolor = _P_bgcolor; DEF_QUAL.P_blink = _P_blink; DEF_QUAL.P_string = _P_string;
	DEF_QUAL.B_fgcolor = _B_fgcolor; DEF_QUAL.B_bgcolor = _B_bgcolor; DEF_QUAL.B_blink = _B_blink; DEF_QUAL.B_string = _B_string;
	DEF_QUAL.T_fgcolor = _T_fgcolor; DEF_QUAL.T_bgcolor = _T_bgcolor; DEF_QUAL.T_blink = _T_blink; DEF_QUAL.T_string = _T_string;
};

/** DIAG_DISP */
/*******************************************************************************
 * Команда DIAG_DISP (замена текущего видеокадра на новый видеокадр) - не
 * реализовано - используется на видеокадрах 7041, 7043, 7044, 7285
 */
function Gdiag_disp() { console.info('Gdiag_disp not implemented') };

/** DIAGRAM */
function Gdiagram(_diag_type, _icon_num, _x, _y, _w, _h, _background,
	_zoom_flag, _revision_num, _x_extents, _y_extents, _w_extents,
	_h_extents, _update_rate, _positioning, _sizing, _subscreen_num, _diag_title) {
	DIAGRAM.diag_type = _diag_type;
	DIAGRAM.icon_num = _icon_num;
	DIAGRAM.x = _x;
	DIAGRAM.y = _y;
	DIAGRAM.w = _w;
	DIAGRAM.h = _h;
	DIAGRAM.background = _background;
	DIAGRAM.zoom_flag = _zoom_flag;
	DIAGRAM.revision_num = _revision_num;
	DIAGRAM.x_extents = _x_extents;
	DIAGRAM.y_extents = _y_extents;
	DIAGRAM.w_extents = _w_extents;
	DIAGRAM.h_extents = _h_extents;
	DIAGRAM.update_rate = _update_rate;
	DIAGRAM.positioning = _positioning;
	DIAGRAM.sizing = _sizing;
	DIAGRAM.subscreen_num = _subscreen_num;
	DIAGRAM.diag_title = _diag_title;

	/*
	 * var _Gdiagram = paper.rect(_x_extents, _y_extents, _w_extents, _h_extents);
	 * _Gdiagram.attr("stroke", _background); _Gdiagram.attr("fill", _background);
	 * _Gdiagram.attr("opacity", .99) _Gdiagram.attr("stroke-width", 16); var rect =
	 * paper.rect(0, 0, 16384, 16384).attr({ fill : "none", stroke : "#000",
	 * strokeWidth : 20 });
	 */

	/**
	 * NT_0091 Ovation NT Graphics Language Manual.pdf
	 * 
	 * Default values are defined for quality if the user does not specify this
	 * command in a graphic. The default quality values are:
	 * 
	 * Quality FG Color BG Color Blink Character
	 * 
	 * good green black OFF ‘G’ fair cyan black OFF ‘F’ poor yellow black OFF
	 * ‘P’ bad magenta black OFF ‘B’ timed-out red black OFF ‘T’
	 */

	Gdef_qual(
		0x00FF00, 0x000000, 0, "G",
		0x00FFFF, 0x000000, 0, "F",
		0xFFFF00, 0x000000, 0, "P",
		0xFF00FF, 0x000000, 0, "B",
		0xFF0000, 0x000000, 0, "T"
	);

	// Активная прямоугольная область
	// ==============================
	let rect = new PIXI.Sprite(PIXI.Texture.EMPTY);
	//rect.anchor.x = 0; можно не указывать
	//rect.anchor.y = 0;
	rect.x = 0;
	rect.y = 0;
	rect.width = 16384;
	rect.height = 16384;
	rect.interactive = true;
	rect.buttonMode = true;
	rect.cursor = 'default';

	// курсор над элементом
	rect.mouseover = function(ev) {
		//if (ToolTipEnable) ToolTipContainer.show((rect.x + rect.width - rect.width / 4), (rect.y + rect.height), "DIAGRAM over");
		ToolTipContainer.hide();
	}
	// курсор уходит с элемента
	rect.mouseout = function(ev) {
		ToolTipContainer.hide();
	}

	// кнопка нажата
	rect.mousedown = function(ev) {
		HighLighterGraphics.blink_off();
	}
	// кнопка отпущена
	rect.mouseup = function (ev) {
		HighLighterGraphics.blink_off();
	}

	paper.push(rect);

};

/** DYNAMIC_LINE */
function Gdynamic_line() { console.info('DYNAMIC_LINE not implemented') };

/** DYNAMIC_POLYGON */
function Gdynamic_polygon() { console.info('DYNAMIC_POLYGON not implemented') };

/** EF_STATE */
function Gef_state() { console.info('EF_STATE not implemented') };

/** ELLIPSEPOLYGON */
function Gellipsepolygon() { console.info('ELLIPSEPOLYGON not implemented') };

/** ENTRY_FLD */
/** Команда ENTRY_FLD (область ввода дополнительной информации)
 * 
 * Команда ENTRY_FLD определяет область видеограммы для добавления информации,
 * вводимой оператором и/или получаемой из прикладной программы графического
 * отображения
 * 
 * на 7227
 * 
 * Gtext(2595,358,$T[1],"HORZ","VECTOR", null, 1127, 464, 1);
 * Gtext(2595,867,$T[2],"HORZ","VECTOR", null, 1127, 464, 1);
 * Gtext(2595,1377,$T[3],"HORZ","VECTOR", null, 1127, 464, 1);
 * 
 * Gentry_fld(2616,365,12,1,"PROGRAM","ASCII",1,"VECTOR", null, 927, 580, 1);
 * Gentry_fld(2616,810,12,2,"PROGRAM","ASCII",1,"VECTOR", null, 927, 580, 1);
 * Gentry_fld(2616,1255,12,3,"PROGRAM","ASCII",1,"VECTOR", null, 927, 580, 1);
 * 
 */
function Gentry_fld(
	_x, _y,
	_max_chars,
	_entry_fld_num,
	_type,					// PROGRAM / OPERATOR / BOTH
	_format,				// ASCII / INT / REAL / BYTE / HEX / EXPONENTIAL
	_state,					// Состояние: 1-активно, 0-не активно
	_font_type,				// BITMAP / BITMAP_OVER / VECTOR / VECTOR_OVER
	_bitmap_font_num, _vector_char_w, _vector_char_h, _line_width) {

	//	console.info('ENTRY_FLD not implemented')

	if (_state == 1) {

		switch (_type) {

			// запись данных в поле ввода разрешается прикладной программе, но не оператору
			case 'PROGRAM':

				//Gdot(_x, _y, 'LARGE');

				var str = EntryFieldData[_entry_fld_num] + '                        ';
				if (str.length > _max_chars) str = EntryFieldData[_entry_fld_num].substring(0, _max_chars);

				var xr = _x - _vector_char_w * 0.2;
				var yr = _y;
				var wr = _vector_char_w * _max_chars + _vector_char_w * 0.2;
				var hr = _vector_char_h * 0.92;

				let cl_rect = new PIXI.Graphics();
				cl_rect.beginFill(OLCOLOR[COLOR.ol], 1);
				cl_rect.lineStyle(0, OLCOLOR[COLOR.ol]);
				//cl_rect.drawRoundedRect(xr, yr, wr, hr, /* radius: */ (Math.min.apply(null, [ wr, hr ]) * 0.25));
				cl_rect.drawRect(xr, yr, wr, hr);
				cl_rect.endFill();
				paper.push(cl_rect);

				Gtext(_x, _y, str, "HORZ", _font_type, _bitmap_font_num, _vector_char_w, _vector_char_h * 0.9, _line_width);

				break;

			// OPERATOR = запись данных в поле ввода разрешается оператору, но не прикладной программе
			// BOTH = запись данных в поле ввода разрешается и оператору, и прикладной программе
			case 'OPERATOR':
			case 'BOTH':

				//			console.log('Счетчик обновлений текущего pop-pup окна', update_counter_PopUp);

				// очищать требуемый EntryFieldData при update_counter_PopUp === 0
				if (update_counter_PopUp == 0) {
					//				console.log('Очистить поле ввода', _entry_fld_num);
					EntryFieldData[_entry_fld_num] = '';	// Очистить поле ввода
				}

				//Gdot(_x, _y, 'LARGE');

				var fld = new Number_Fld(_x, _y, _max_chars, _entry_fld_num,
					_type, _format, _state,
					_font_type, _bitmap_font_num, _vector_char_w, _vector_char_h, _line_width);

				fld.input();

				paper.push(fld.background);
				paper.push(fld.backgroundFocused);
				paper.push(fld.inputfield);
				paper.push(fld.hitRect);

				//			var fobjectSVG = Snap.format('<foreignObject x="{x_r}" y="{y_r}" width="{w_r}" height="{h_r}" focusable = "true">' +
				//					'<input id="Gentry_fld{e_f_num}" class="entry-fld" type="number" step="any" ' +
				//					'maxlength="{max_c}" style=" font-size:{fs}pt " ' +
				//					'value="{val}" />' +
				//					'</foreignObject>',
				//			{
				//				x_r: (xr), y_r: (yr), w_r: (wr), h_r: (hr),
				//				e_f_num: (_entry_fld_num),
				//				max_c: (_max_chars),
				//				fs: (hr*0.9),
				//				val: (str)//''
				//			});
				//			paper.append(Snap.parse(fobjectSVG));

				break;
		} // switch

	} // if _state
};

/** FKEY_STATE */
function Gfkey_state() { console.info('FKEY_STATE not implemented') };

/** FONT */
function Gfont(_name, _style) {
	FONT.name = _name;
	FONT.style = _style;

	var family = _name + '_' + _style;
	family = family.replace(/\s+/g, '_');

	FONT.family = family;
};

/** FORCE_UPDATE */
/**
 * Команда FORCE_UPDATE используется в разделе видеограммы foreground ("передний
 * план") для определения того, требуется ли повторное вычерчивание отображаемых
 * элементов, если их текущие значения/атрибуты не изменились со времени последнего
 * обновления
 */
function Gforce_update(_state) {
	//console.info('FORCE_UPDATE not implemented')
	//	if (_state) {
	//		// с этого момента заново вычерчиваются все элементы
	//	} else {
	//		// с этого момента заново вычерчиваются только элементы с измененными значениями/атрибутами
	//	}
};

/** FOREGROUND */
function Gforeground() { console.info('FOREGROUND not implemented') };

/** FUNC_KEY */
function Gfunc_key() { console.info('FUNC_KEY not implemented') };

/** GCODE */
function Gcode() { console.info('GCODE not implemented') };

/** GTEXT */
function Ggtext() { console.info('GTEXT not implemented') };

/** IF_CHANGED/ENDIF */

/** IF/ENDIF */

/** KEYBOARD */
function Gkeyboard() { console.info('KEYBOARD not implemented') };

/** LINE */
function Gline(n, xn, yn, lw, lp) {
	let line = new PIXI.Graphics();
	sLINE(line, n, xn, yn, lw, lp);
	paper.push(line);
};

/** LOAD_FKEY_GROUP */
function Gload_fkey_group() { console.info('LOAD_FKEY_GROUP not implemented') };

/** IFELSE/ELSE/ENDIF */

/** LOOP/ENDLOOP */

/** MACRO */
function Gmacro() { console.info('MACRO not implemented') };

/** MATH */
function Gmath() { console.info('MATH not implemented') };

// Calculating Color Contrast
//============================
function getContrastYIQ(tint) {
	let R = ((tint >> 16) & 0xFF);
	let G = ((tint >> 8) & 0xFF);
	let B = (tint & 0xFF);
	let yiq = ((R * 299) + (G * 587) + (B * 114)) / 1000;
	return (yiq >= 128) ? 0x000000 : 0xffffff;
} // getContrastYIQ

//Кнопка в стиле OPEN LOOK
//=========================
function ol_rect(x, y, w, h, endcap, state) {
	let ol_rect = new PIXI.Graphics();

	ol_rect.beginFill(OLCOLOR[COLOR.ol], 0.33);
	ol_rect.lineStyle(LINEWIDTHS[2], OLCOLOR[COLOR.ol]);
	switch (endcap) {
		case 'ROUNDED':	// закругленные углы
			ol_rect.drawRoundedRect(x, y, w, h, (Math.min.apply(w, [w, h]) * 0.25));
			break;
		case 'SQUARED':	// прямоугольные углы
			ol_rect.drawRect(x, y, w, h);
			break;
	}
	ol_rect.endFill();

	let dropShadowFilter = new PIXI.filters.DropShadowFilter();
	dropShadowFilter.alpha = 1.0;
	dropShadowFilter.blur = 1;

	if (state) {
		dropShadowFilter.distance = 2; // прямоугольник в виде нажатого графического элемента
	} else {
		dropShadowFilter.distance = 4; // прямоугольник в виде отжатого графического элемента
	}

	ol_rect.filters = [dropShadowFilter];

	paper.push(ol_rect);
} // rect

// Реакция на кнопку в стиле OPEN LOOK
//=====================================
function ol_interact(_ol_button_down, _func_type, _func, _a1, _a2, _a3) {

	var btn_up = !_ol_button_down;	// Отжатие кнопки ?

	/*
		if (_ol_button_down) {
			// прямоугольник в виде нажатого графического элемента
			console.log('ol_interact mouseDown');
		} else {
			// прямоугольник в виде отжатого графического элемента
			console.log('ol_interact mouseUp');
		}
	*/

	switch (_func_type) {
		case 'EXEC_TRIG':
			//console.log('ol_interact EXEC_TRIGGER');
			Grun_programs([{ "prog": 122, "diag": 0, "arg": [1, _func] }], btn_up);
			break;
		case 'EXEC_POKE':
			//if (_func == 0) {
			//	//console.log('ol_interact EXEC_POKE - Process point');
			//}
			if (_func == 2) {
				// кнопка отпущена
				if (!_ol_button_down) {
					let _diag_num = _a1 * 1;
					let _group_num = _a2 * 1;

					//console.log("ol_interact EXEC_POKE - diag_num=", _diag_num, ", group_num=", _group_num);
					if (DiagIgnore.indexOf(_diag_num) != -1) {
						// Если значение _diag_num соответствует какому-либо из списка значений DiagIgnore - игнорировать вызов видеограммы
						//break;
					} else {
						QueryArgs.diag = _diag_num;
						QueryArgs.group = _group_num;
						QueryArgs.htext = '';			QueryArgs.hnumb = 1;
						setUrlQueryArgs(QueryArgs);
						LoadingBarGraphics.show();
					}
				}
			}
			if (_func == 3) {
				//console.log('ol_interact EXEC_POKE - Run 1 Application program');
				Grun_programs([{ "prog": _a1, "diag": 0, "arg": [] }], btn_up);
			}
			//if (_func == 9) {
			//	//console.log('ol_interact EXEC_POKE - Operating system command');
			//}
			if (_func == 23) {
				//console.log('ol_interact EXEC_POKE - Control');
				Gsetval(_a1, _a2);
				Grun_programs(_a3, btn_up);
			}
			if (_func == 7) {
				//console.log('ol_interact EXEC_POKE - Run 1 or more Application programs');
				Grun_programs(_a3, btn_up);
			}
			break;
	} // switch _func_type

} // ol_interact

/** OL_BUTTON */
/**
 * Команда OL_BUTTON (кнопка в стиле OPEN LOOK)
 * 
 * Команда OL_BUTTON определяет кнопку в видеограмме процесса, активизируемую
 * при выборе с помощью мыши.
 * 
 * Кнопка OL_BUTTON может иметь метку формы формы или текстовую, может быть
 * ориентирована по горизонтали или по вертикали, может иметь закругленную или
 * прямоугольную форму, и может быть связана с poke-функциями или триггерными
 * функциями.
 * 
 * Связь с триггерными функциями означает, что при нажатии и отпускании кнопки
 * OL_BUTTON выполняются триггерные функции, определяемые пользователем.
 * 
 * Связь с poke-функциями указывает на то, что при нажатии и отпускании кнопки
 * OL_BUTTON выполняется какая-либо из стандартных poke-функций.
 * 
 * С кнопкой OL_BUTTON связаны либо триггерные, либо poke-функции, но не те и
 * другие.
 * 
 * После нажатия кнопки OL_BUTTON нажатое состояние сохраняется до момента,
 * когда кнопка освобождается (при отпускании кнопки мыши) либо когда мышь
 * перемещается с кнопки OL_BUTTON на другую позицию.
 * 
 * Клик кнопкой мыши вызывает сначала mousedown при нажатии, а затем mouseup и
 * click при отпускании кнопки.
 */
function Gol_button(_x, _y, _orientation, _endcap, _label_type, _lable, _func_type, _func, _a1, _a2, _a3) {

	var w, h;
	var OL_BUTTON_DOWN = false;	// кнопка нажата ?

	var oldCOLORfg = COLOR.fg;
	var newCOLORfg = getContrastYIQ(OLCOLOR[COLOR.ol]);

	switch (_label_type) {
		case 'SHAPE_LABEL':	// В проекте не встречается
			break;
		case 'TEXT_LABEL':
			switch (_orientation) {
				case 'HORZ':
					w = _lable.vector_char_w * (_lable.txt.length + 1);
					h = _lable.vector_char_h * 1.08;
					ol_rect(_x, _y, w, h, _endcap, OL_BUTTON_DOWN);
					COLOR.fg = newCOLORfg;
					Gtext(_x + _lable.vector_char_w / 2, _y, _lable.txt, _orientation, _lable.font_type, null, _lable.vector_char_w, _lable.vector_char_h, _lable.line_width);
					COLOR.fg = oldCOLORfg;
					break;
				case 'VERT':		// В проекте не встречается
					break;
			} // switch _orientation

			// Активная прямоугольная область
			// ==============================
			var rect = new PIXI.Sprite(PIXI.Texture.EMPTY);
			rect.x = _x;
			rect.y = _y;
			rect.width = w;
			rect.height = h;
			rect.interactive = true;
			rect.buttonMode = true;
			rect.cursor = 'pointer';
			// курсор над элементом
			rect.mouseover = function(ev) {
				if (ToolTipEnable) {
					switch (_func_type) {
						case 'EXEC_TRIG':
							ToolTipContainer.show((_x+w-w/4), (_y+h), get_program_desc([{ "prog": 122, "diag": 0, "arg": [1, _func] }]));
							break;
						case 'EXEC_POKE':
							if (_func == 2) {
								ToolTipContainer.show((_x+w-w/4), (_y+h), " -> " + _a1 + " ");
							}
							if (_func == 3) {
								ToolTipContainer.show((_x+w-w/4), (_y+h), get_program_desc([{ "prog": _a1, "diag": 0, "arg": [] }]));
							}
							if (_func == 23) {
								ToolTipContainer.show((_x+w-w/4), (_y+h), get_program_desc(_a3));
							}
							if (_func == 7) {
								ToolTipContainer.show((_x+w-w/4), (_y+h), get_program_desc(_a3));
							}
							break;
					}
				}
			}
			// курсор уходит с элемента
			rect.mouseout = function(ev) {
				//console.log("POKE_FLD out, func_type=" + _func_type + ", func=" + _func + ", a1=" + _a1 + ", a2=" + _a2 + ", a3=" + _a3);
				ToolTipContainer.hide();
			}
			// кнопка нажата
			rect.mousedown = function (ev) {
				//console.log("POKE_FLD down, func_type=" + _func_type + ", func=" + _func + ", a1=" + _a1 + ", a2=" + _a2 + ", a3=" + _a3);
				HighLighterGraphics.blink_off();
				OL_BUTTON_DOWN = true;
				ol_interact(true, _func_type, _func, _a1, _a2, _a3);
			}
			// кнопка отпущена
			rect.mouseup = function (ev) {
				//console.log("POKE_FLD up, func_type=" + _func_type + ", func=" + _func + ", a1=" + _a1 + ", a2=" + _a2 + ", a3=" + _a3);
				HighLighterGraphics.blink_off();
				OL_BUTTON_DOWN = false;
				ol_interact(false, _func_type, _func, _a1, _a2, _a3);
			}

			paper.push(rect);

			break;
	} // switch _label_type
};






/** OL_CHECKBOX */
function Gol_checkbox() { console.info('OL_CHECKBOX not implemented') };

/** OL_CHOICE */
function Gol_choice() { console.info('OL_CHOICE not implemented') };

/** OL_CYLINDER */
function Gol_cylinder() { console.info('OL_CYLINDER not implemented') };

/** OL_EVENT_MENU */
function Gol_event_menu() { console.info('OL_EVENT_MENU not implemented') };

/** OL_RECTPOLYGON */
function Gol_rectpolygon() { console.info('OL_RECTPOLYGON not implemented') };

/** OL_SLIDER */
function Gol_slider() { console.info('OL_SLIDER not implemented') };

/** PAGE */
/**
 * Команда PAGE определяет видеограммы, для доступа к которым требуется нажатие
 * кнопок листания на клавиатуре, либо кнопок листания в окне видеограммы.
 */
function Gpage() {
	//console.info('PAGE not implemented')
};

/** PLOT */
function Gplot() { console.info('PLOT not implemented') };

/** POINTER */
function Gpointer() { console.info('POINTER not implemented') };

/** POKE_FLD */
function Gpoke_fld() { console.info('POKE_FLD not implemented') };

/** POKE_FLD */
function get_program_desc(_progs_json) {

	let num_of_progs = _progs_json.length;

	if (num_of_progs != 0) {

		let prog = _progs_json[0].prog;
		let diag = _progs_json[0].diag;
		let arg = _progs_json[0].arg;

		switch (prog) {
			case   6: return " CNTRL_POKE ";           break;
			case  28: return " DIGITON ";              break;
			case  29: return " DIGITOFF ";             break;
			case  30: return " UPSET ";                break;
			case  31: return " DOWNSET ";              break;
			case  32: return " MANUAL ";               break;
			case  33: return " AUTO ";                 break;
			case  34: return " RAISEOUT ";             break;
			case  35: return " LOWEROUT ";             break;
			case  66: return " DISP_EFDATA66 ";        break;
			case  80: return " SEND_CA ";              break;
			case 117: return " WINDOW_FUNC_KEY -> " + diag; break;
			case 119: return " DISP_EFDATA119 ";       break;

			case 121: return " XPID_DIGITAL ";         break;

			case 122: return " EXEC_TRIGGER ";         break;
			case 124: return " CNTRLBITS ";            break;
			case 125: return " WINDOW_DELETE ";        break;
			case 202: return " EXECUTE_PROCESS ";      break;
			case 203: return " CLEAR_CONTROL ";        break;
			case 210: return " ACK_DROP_ALARM ";       break;
			case 211: return " REENABLE_HWY ";         break;
			case 212: return " CLEAR_DROP_FAULT ";     break;
			case 213: return " REVOTE_BUSLIST ";       break;
			case 214: return " ALARM_ACKNOWLEDGE ";    break;
			case 221: return " XPID_DIGITAL_CTL_LOCK"; break;
			default:  return "Unknown Program ";       break;
		}
	}
};

/*******************************************************************************
 * Активная прямоугольная область Точка процесса - Process point
 * 
 * POKE_FLD x y w h state 0 pt_name
 */
function Gpoke_fld_pp0(_x, _y, _w, _h, _state, _pt_name) {
	if (_state === 1) {

		// Активная прямоугольная область
		// ==============================
		var rect = new PIXI.Sprite(PIXI.Texture.EMPTY);
		rect.x = _x;
		rect.y = _y;
		rect.width = _w;
		rect.height = _h;
		rect.interactive = true;
		rect.buttonMode = true;
		rect.cursor = 'help';
		// курсор над элементом
		rect.mouseover = function(ev) {
			if (ToolTipEnable) ToolTipContainer.show((_x + _w - _w / 4), (_y + _h), " " + _pt_name + " ");
		}
		// курсор уходит с элемента
		rect.mouseout = function(ev) {
			ToolTipContainer.hide();
		}
		// кнопка нажата
		rect.mousedown = function(ev) {
			HighLighterGraphics.blink_off();
		}
		// кнопка отпущена
		rect.mouseup = function (ev) {
			HighLighterGraphics.blink_off();
		}

		paper.push(rect);
	}
};

/*******************************************************************************
 * Видеограмма и группа - Diagram and group
 * 
 * POKE_FLD x y w h state 2 diag_num group_num
 */
function Gpoke_fld_dg2(_x, _y, _w, _h, _state, _diag_num, _group_num) {
	if (_state === 1) {

		// Активная прямоугольная область
		// ==============================
		let rect = new PIXI.Sprite(PIXI.Texture.EMPTY);
		rect.x = _x;
		rect.y = _y;
		rect.width = _w;
		rect.height = _h;
		rect.interactive = true;
		rect.buttonMode = true;
		rect.cursor = 'pointer';
		// курсор над элементом
		rect.mouseover = function(ev) {
			if (ToolTipEnable) ToolTipContainer.show((_x + _w - _w / 4), (_y + _h), " -> " + _diag_num + " ");
		}
		// курсор уходит с элемента
		rect.mouseout = function(ev) {
			ToolTipContainer.hide();
		}
		// кнопка нажата
		rect.mousedown = function(ev) {
			HighLighterGraphics.blink_off();
		}
		// кнопка отпущена
		rect.mouseup = function (ev) {
			if (DiagIgnore.indexOf(_diag_num * 1) != -1) {
				// Если значение _diag_num соответствует какому-либо из списка значений DiagIgnore - игнорировать вызов видеограммы
				return;
			}
			HighLighterGraphics.blink_off();
			QueryArgs.diag = _diag_num * 1;
			QueryArgs.group = _group_num * 1;
			QueryArgs.htext = '';
			QueryArgs.hnumb = 1;
			setUrlQueryArgs(QueryArgs);
			LoadingBarGraphics.show();
		}

		paper.push(rect);
	}
};

/*******************************************************************************
 * Выполнение одной прикладной программы (без возможности передачи программе
 * аргументов) - Run 1 Application program (no arguments can be passed to it)
 * 
 * POKE_FLD x y w h state 3 prog_num
 * 
 * Применяется на diag 1801 и 1802 (номера программ 210, 211, 212 и 213)
 */
function Gpoke_fld_ap3(_x, _y, _w, _h, _state, _prog_num) {
	if (_state === 1) {

		// Активная прямоугольная область
		// ==============================
		let rect = new PIXI.Sprite(PIXI.Texture.EMPTY);
		rect.x = _x;
		rect.y = _y;
		rect.width = _w;
		rect.height = _h;
		rect.interactive = true;
		rect.buttonMode = true;
		rect.cursor = 'pointer';
		// курсор над элементом
		rect.mouseover = function(ev) {
			if (ToolTipEnable) ToolTipContainer.show((_x + _w - _w / 4), (_y + _h), get_program_desc([{ "prog": _prog_num, "diag": 0, "arg": [] }]));
		}
		// курсор уходит с элемента
		rect.mouseout = function(ev) {
			ToolTipContainer.hide();
		}
		// кнопка нажата
		rect.mousedown = function (ev) {
			HighLighterGraphics.blink_off();
			Grun_programs([{ "prog": _prog_num, "diag": 0, "arg": [] }], false);
		};
		// кнопка отпущена
		rect.mouseup = function (ev) {
			HighLighterGraphics.blink_off();
			Grun_programs([{ "prog": _prog_num, "diag": 0, "arg": [] }], true);
		};

		paper.push(rect);
	}
};

/*******************************************************************************
 * Управление - Control
 * 
 * POKE_FLD x y w h state 23 set_num set_val num_of_progs prog_num1 diag_num1
 * num_of_args1 arg_list1 ... prog_numN diag_numN num_of_argsN arg_listN
 * 
 * Gpoke_fld_ap23( 11742, x 749, y 1546, w 1352, h 1, state $SET[1], set_num -
 * Номер установочной переменной от 1 до 255, или $SETn. Следует заметить, что
 * для текущей основной видеограммы и видеограмм окон установки носят глобальный
 * характер. Set1 в главном окне совпадает с set1 в окне 11, set_val - Целое
 * число для назначения переменной. Действительными значениями являются: 0 ...
 * 32767 [ {"prog":111,"diag":0,"arg":[$CONST[2],27]} ] );
 * 
 * Представлены на diag 7000, 7001, 7041, 7043, 7044, 7285
 */
function Gpoke_fld_ap23(_x, _y, _w, _h, _state, _set_num, _set_val, _progs) {
	if (_state === 1) {

		// Активная прямоугольная область
		// ==============================
		let rect = new PIXI.Sprite(PIXI.Texture.EMPTY);
		rect.x = _x;
		rect.y = _y;
		rect.width = _w;
		rect.height = _h;
		rect.interactive = true;
		rect.buttonMode = true;
		rect.cursor = 'pointer';
		// курсор над элементом
		rect.mouseover = function(ev) {
			if (ToolTipEnable) ToolTipContainer.show((_x + _w - _w / 4), (_y + _h), get_program_desc(_progs));
		}
		// курсор уходит с элемента
		rect.mouseout = function(ev) {
			ToolTipContainer.hide();
		}
		// кнопка нажата
		rect.mousedown = function (ev) {
			HighLighterGraphics.blink_off();
			Grun_programs(_progs, false);
		};
		// кнопка отпущена
		rect.mouseup = function (ev) {
			HighLighterGraphics.blink_off();

			// Что-то надо делать с $SET, а вот что - $SET[nnn] = vvv;
			// Номер установочной переменной = Целое число для назначения переменной
			var str = _set_num + '=' + _set_val + ';';
			try {
				eval(str);	// выполнить строку кода - возможна ошибка
			} catch (e) {
				if (e instanceof TypeError) {
					printError(e, true);
				} else {
					printError(e, false);
				}
			}
			Grun_programs(_progs, true);
		};

		paper.push(rect);
	}
};

/*******************************************************************************
 * Выполнение одной или нескольких прикладных программ (с возможностью передачи
 * аргументов) Run 1 or more Application programs (arguments can be passed)
 * 
 * POKE_FLD x y w h state 7 num_of_progs prog_num1 diag_num1 num_of_args1
 * arg_list1 ... prog_numN diag_numN num_of_argsN arg_listN
 * 
 * Gpoke_fld_ap7(9869,6135,3124,1529,1,[ {"prog":125,"diag":0,"arg":[]},
 * {"prog":6,"diag":0,"arg":["OCB1J1002K","OCB1J1002K",11,11,2]} ]);
 * 
 * Gpoke_fld_ap7(13492,15671,2831,683,1,[
 * {"prog":214,"diag":0,"arg":["1HRBE2502","1HRBE2502A_F","1HRBE2502B_F","1HRXA2546_2"]}
 * ]);
 */
function Gpoke_fld_ap7(_x, _y, _w, _h, _state, _progs) {
	if (_state === 1) {

		// Активная прямоугольная область
		// ==============================
		let rect = new PIXI.Sprite(PIXI.Texture.EMPTY);
		rect.x = _x;
		rect.y = _y;
		rect.width = _w;
		rect.height = _h;
		rect.interactive = true;
		rect.buttonMode = true;
		rect.cursor = 'pointer';
		// курсор над элементом
		rect.mouseover = function(ev) {
			if (ToolTipEnable) ToolTipContainer.show((_x + _w - _w / 4), (_y + _h), get_program_desc(_progs));
		}
		// курсор уходит с элемента
		rect.mouseout = function(ev) {
			ToolTipContainer.hide();
		}
		// кнопка нажата
		rect.mousedown = function (ev) { HighLighterGraphics.blink_off();
			HighLighterGraphics.blink_off();
			Grun_programs(_progs, false);
		}
		// кнопка отпущена
		rect.mouseup = function (ev) {
			HighLighterGraphics.blink_off();
			Grun_programs(_progs, true);
		}

		paper.push(rect);
	}
};

/** POKE_STATE */
function Gpoke_state() { console.info('POKE_STATE not implemented') };

/** POLYGON + */
function Gpolygon(n, xn, yn, lw, lp, fp) {
	let poly = new PIXI.Graphics();
	sPOLYGON(poly, n, xn, yn, lw, lp, fp);
	paper.push(poly);
};

/** Returns if a value is a string */
function isString(value) {
	return typeof value === 'string' || value instanceof String;
};

/** Returns if a value is really a number */
function isNumber(value) {
	//	return !isNaN(parseFloat(value)) && isFinite(value);
	return typeof value === 'number' && isFinite(value);
};

/** PROCESS_PT */
function Gprocess_pt(
	_x, _y, _num_of_chars, _decimal_places,
	_format, _quality, _orientation,
	_font_type, _bitmap_font_num, _vector_char_w, _vector_char_h, _line_width,
	_str_cur_value, _cur_value) {

	if (_cur_value === undefined)
		return;

	/* start string mode */
	/* ================= */
	if (isString(_cur_value)) {

		if (_cur_value.localeCompare('undefined') == 0)	// 0, если строки равны
			return;

		let hl = HighLighterGraphics.search(_cur_value);	// хайлайтер

		let out_put = _cur_value;

		let justification = 2;	/*
								 * 2 - по центру, 1 - по правому, 0 - по левому
								 * краю
								 */
		let justify_chars = _num_of_chars - _quality;

		switch (_format) {
			case 'RIGHT':
				justification = 1;
				break;
			case 'LEFT':
				justification = 0;
				break;
			case 'RIGHT0':
			case 'HEX':
			case 'HEX_H':
			case 'BINARY':
			case 'EXPONENTIAL':
			case 'TECHNICAL':
				justification = 0;
				break;
		}

		/*
		 * indexOf() возвращает если не найдено -1, если найдено - позицию
		 * вхождения.
		 * 
		 * В js 0==false, любое др. число даёт true;
		 */
		if ((_quality == 1)
			&&
			(
				/* Плохое */
				(vStatus(FM.status, "=", "BAD"))
				||
				/* Ошибка связи */
				(vStatus(FM.status, "=", "HDWRFAIL"))
			)
			&&
			(
				/* Set State Description */
				(_str_cur_value.indexOf('getST(') + 1)
				||
				/* Reset State Description */
				(_str_cur_value.indexOf('getRS(') + 1)
			)
		) {
			out_put = out_put.replace(/\w|\W/g, "X");
		}

		switch (_orientation) {

			case 'HORZ':
				{

					/* Собственно текст */
					let PText = smpl_text(_x, _y, 'HORZ', justification, justify_chars, out_put,
						_font_type, _bitmap_font_num, _vector_char_w, _vector_char_h, _line_width, hl);	// хайлайтер
					if (BLINK.fg || BLINK.bg) blink_paper.push(PText); else paper.push(PText);

					/* Символ качества */
					if (_quality == 1) {
						let status = FM.status;
						let quality_char = ' ';

						let copy_fg_color = COLOR.fg;
						let copy_bg_color = COLOR.bg;
						/* блинкеры откинем, т.к. они всегда OFF в проекте */

						if (vStatus(status, "=", "GOOD")) { quality_char = DEF_QUAL.G_string; COLOR.fg = DEF_QUAL.G_fgcolor; COLOR.bg = DEF_QUAL.G_bgcolor; }
						if (vStatus(status, "=", "FAIR")) { quality_char = DEF_QUAL.F_string; COLOR.fg = DEF_QUAL.F_fgcolor; COLOR.bg = DEF_QUAL.F_bgcolor; }
						if (vStatus(status, "=", "POOR")) { quality_char = DEF_QUAL.P_string; COLOR.fg = DEF_QUAL.P_fgcolor; COLOR.bg = DEF_QUAL.P_bgcolor; }
						if (vStatus(status, "=", "BAD")) { quality_char = DEF_QUAL.B_string; COLOR.fg = DEF_QUAL.B_fgcolor; COLOR.bg = DEF_QUAL.B_bgcolor; }
						if (vStatus(status, "=", "HDWRFAIL")) { quality_char = DEF_QUAL.T_string; COLOR.fg = DEF_QUAL.T_fgcolor; COLOR.bg = DEF_QUAL.T_bgcolor; }

						let BB = PText.getBounds();
						let QText = smpl_text((BB.x + BB.width), _y, 'HORZ', 2, 1, quality_char,
							_font_type, _bitmap_font_num, _vector_char_w, _vector_char_h, _line_width, hl);	// хайлайтер
						if (BLINK.fg || BLINK.bg) blink_paper.push(QText); else paper.push(QText);

						COLOR.fg = copy_fg_color;
						COLOR.bg = copy_bg_color;
					} // _quality == 1
				}
				break;

			case 'VERT':
				{
					/* Собственно текст */
					let PText = smpl_text(_x, _y, 'VERT', justification, justify_chars, out_put,
						_font_type, _bitmap_font_num, _vector_char_w, _vector_char_h, _line_width, hl);	// хайлайтер
					if (BLINK.fg || BLINK.bg) blink_paper.push(PText); else paper.push(PText);
				}
				break;
			default:
				break;
		} // switch

		return;

	} /* stop string mode */

	/* start number mode */
	/* ================= */
	if (isNumber(_cur_value)) {



		// _quality = 0; // Отказ от символа качества - cимвол качества с Blinker работает



		/* Количество десятичных позиций для отображения */
		let dcml_plcs = _decimal_places;
		if (_decimal_places == -1) {
			let fm_type = FM.type;
			let fm_digits = FM.digits;

			if (fm_type === undefined) fm_type = 'S';
			if (fm_digits === undefined) fm_digits = 3;

			dcml_plcs = fm_digits;

			switch (fm_type) {
				case 'S': dcml_plcs = fm_digits; break;
				case 'E': dcml_plcs = 2; break;
				case 'T': dcml_plcs = 2; break;
			}
		} // -1

		let out_put;
		let nchar = _num_of_chars - _quality;

		switch (_format) {
			case 'RIGHT': out_put = sprintf(("%" + nchar + "." + dcml_plcs + "f"), _cur_value); break;
			case 'LEFT': out_put = sprintf(("%-" + nchar + "." + dcml_plcs + "f"), _cur_value); break;
			case 'RIGHT0': out_put = sprintf(("%0" + nchar + "." + dcml_plcs + "f"), _cur_value); break;
			case 'HEX': out_put = sprintf(("%x"), _cur_value); break;
			case 'HEX_H': out_put = sprintf(("0x%x"), _cur_value); break;
			case 'BINARY': out_put = sprintf(("%b"), _cur_value); break;
			case 'EXPONENTIAL': out_put = sprintf(("%" + nchar + "." + dcml_plcs + "E"), _cur_value); break;
			case 'TECHNICAL': out_put = sprintf(("%" + nchar + "." + dcml_plcs + "e"), _cur_value); break;
		}

		if ((_quality == 1)
			&&
			(
				/* Плохое */
				(vStatus(FM.status, "=", "BAD"))
				||
				/* Ошибка связи */
				(vStatus(FM.status, "=", "HDWRFAIL"))
			)
			&&
			/* Analog value */
			(_str_cur_value.indexOf('getAV(') + 1)

		) {
			out_put = out_put.replace(/\w|\W/g, "X");
		}

		switch (_orientation) {

			case 'HORZ':
				{

					/* Собственно текст */
					let PText = smpl_text(_x, _y, 'HORZ', 0, nchar, out_put,
						_font_type, _bitmap_font_num, _vector_char_w, _vector_char_h, _line_width);
					//paper.push(PText);
					if (BLINK.fg || BLINK.bg) blink_paper.push(PText); else paper.push(PText);

					/* Символ качества */
					if (_quality == 1) {
						let status = FM.status;
						let quality_char = ' ';

						let copy_fg_color = COLOR.fg;
						let copy_bg_color = COLOR.bg;
						/* блинкеры откинем, т.к. они всегда OFF в проекте - ложное утверждение - есть и ON */

						if (vStatus(status, "=", "GOOD")) { quality_char = DEF_QUAL.G_string; COLOR.fg = DEF_QUAL.G_fgcolor; COLOR.bg = DEF_QUAL.G_bgcolor; }
						if (vStatus(status, "=", "FAIR")) { quality_char = DEF_QUAL.F_string; COLOR.fg = DEF_QUAL.F_fgcolor; COLOR.bg = DEF_QUAL.F_bgcolor; }
						if (vStatus(status, "=", "POOR")) { quality_char = DEF_QUAL.P_string; COLOR.fg = DEF_QUAL.P_fgcolor; COLOR.bg = DEF_QUAL.P_bgcolor; }
						if (vStatus(status, "=", "BAD")) { quality_char = DEF_QUAL.B_string; COLOR.fg = DEF_QUAL.B_fgcolor; COLOR.bg = DEF_QUAL.B_bgcolor; }
						if (vStatus(status, "=", "HDWRFAIL")) { quality_char = DEF_QUAL.T_string; COLOR.fg = DEF_QUAL.T_fgcolor; COLOR.bg = DEF_QUAL.T_bgcolor; }

						let BB = PText.getBounds();
						let QText = smpl_text((BB.x + BB.width), _y, 'HORZ', 0, 1, quality_char,
							_font_type, _bitmap_font_num, _vector_char_w, _vector_char_h, _line_width);
						//paper.push(QText);
						if (BLINK.fg || BLINK.bg) blink_paper.push(QText); else paper.push(QText);

						COLOR.fg = copy_fg_color;
						COLOR.bg = copy_bg_color;
					} // _quality == 1
				}
				break;

			case 'VERT':
				{
					/* Собственно текст */
					let PText = smpl_text(_x, _y, 'HORZ', 0, nchar, out_put,
						_font_type, _bitmap_font_num, _vector_char_w, _vector_char_h, _line_width);
					//paper.push(PText);
					if (BLINK.fg || BLINK.bg) blink_paper.push(PText); else paper.push(PText);
				}
				break;
			default:
				break;
		} // switch

		return;

	} /* stop number mode */

}; // PROCESS_PT

/** PTR_EQUAL */
function Gptr_equal() { console.info('PTR_EQUAL not implemented') };

/** PTR_LOOP/P_ENDLP */

/** PTR_MOVE */
function Gptr_move() { console.info('PTR_MOVE not implemented') };

/** PTR_VALUE */
function Gptr_value() { console.info('PTR_VALUE not implemented') };

/** RECTANGLE + */
function Grectangle(x, y, w, h, lw, lp, fp) {
	let rect = new PIXI.Graphics();
	sRECTANGLE(rect, x, y, w, h, lw, lp, fp);
	//paper.push(rect);
	if (BLINK.fg || BLINK.bg) blink_paper.push(rect); else paper.push(rect);
};

/** OL_RECTANGLE (OPEN LOOK) + */
function Gol_rectangle(x, y, w, h, state) {
	let olrect = new PIXI.Graphics();
	olrect.beginFill(OLCOLOR[COLOR.ol], 0.88);
	olrect.lineStyle(LINEWIDTHS[1], OLCOLOR[COLOR.ol]);

	olrect.drawRoundedRect(x, y, w, h, (Math.min.apply(null, [w, h]) * 0.05));

	olrect.endFill();

	var dropShadowFilter = new PIXI.filters.DropShadowFilter();
	// dropShadowFilter.color = 0x000000;
	dropShadowFilter.alpha = 1.0;
	dropShadowFilter.blur = 1;

	switch (state) { // Состояние прямоугольника
		case 'INVOKED':
			dropShadowFilter.distance = 2; // прямоугольник в виде нажатого графического элемента
			break;
		case 'OLNORMAL':
			dropShadowFilter.distance = 4; // прямоугольник в виде отжатого графического элемента
			break;
	}

	olrect.filters = [dropShadowFilter];

	paper.push(olrect);
};

/** RECTPOLYGON */
function Grecnpolygon() { console.info('RECTPOLYGON not implemented') };

/** RUN_PROGRAMS */
/**
 * Команда RUN_PROGRAMS (выполнение прикладной программы)
 * 
 * Команда RUN_PROGRAMS используется для выполнения poke-функции типа 7 внутри
 * разделов фона, переднего плана и/или триггера видеограммы без необходимости
 * вручную вызывать что-либо в графическом изображении.
 * 
 * С данной командой никакое отображение не связано. Эта команда используется
 * для выполнения одной или нескольких прикладных программ при выполнении задачи
 * графического отображения без использования интерфейса пользователя.
 * 
 * Синтаксис
 * 
 * RUN_PROGRAMS programs prog_1 diag_1 #args_1 arg1 ... arguments_1 prog_2
 * diag_2 #args_2 arg2 ... arguments_2 . prog_n diag_n #args_n argn ...
 * arguments_n
 * 
 * Grun_programs([{"prog":80,"diag":0,"arg":[1,1,1,0,2,0,0,0,$D[1],2,0,$O[1],13]}],
 * true);
 */
function Grun_programs(_progs_json, btn_up) {
	// console.info('RUN_PROGRAMS not implemented')

	// btn_up = true - Отпускание кнопки
	// btn_up = false - Нажатие кнопки

	var num_of_progs = _progs_json.length;

	if (num_of_progs != 0) {
		for (let i = 0; i < num_of_progs; i++) {

			var prog = _progs_json[i].prog;
			var diag = _progs_json[i].diag;
			var arg = _progs_json[i].arg;

			switch (prog) {
				case 6: if (btn_up) CNTRL_POKE(arg); break;
				case 28: if (btn_up) DIGITON(); break;
				case 29: if (btn_up) DIGITOFF(); break;
				case 30: UPSET(btn_up); break;
				case 31: DOWNSET(btn_up); break;
				case 32: if (btn_up) MANUAL(); break;
				case 33: if (btn_up) AUTO(); break;
				case 34: RAISEOUT(btn_up); break;
				case 35: LOWEROUT(btn_up); break;
				case 66: if (btn_up) DISP_EFDATA66(arg); break;
				case 80: if (btn_up) SEND_CA(arg); break;
				case 117: if (btn_up) WINDOW_FUNC_KEY(diag, arg); break;
				case 119: if (btn_up) DISP_EFDATA119(arg); break;

				case 121: if (btn_up) XPID_DIGITAL(arg); break;

				case 122: if (btn_up) EXEC_TRIGGER(arg); break;
				case 124: if (btn_up) CNTRLBITS(arg); break;
				case 125: if (btn_up) WINDOW_DELETE(); break;
				case 202: if (btn_up) EXECUTE_PROCESS(arg); break;
				case 203: if (btn_up) CLEAR_CONTROL(arg); break;
				case 210: if (btn_up) ACK_DROP_ALARM(); break;
				case 211: if (btn_up) REENABLE_HWY(); break;
				case 212: if (btn_up) CLEAR_DROP_FAULT(); break;
				case 213: if (btn_up) REVOTE_BUSLIST(); break;
				case 214: if (btn_up) ALARM_ACKNOWLEDGE(arg); break;
				case 221: if (btn_up) XPID_DIGITAL_CTL_LOCK(arg); break;

				default:
					console.log("ERROR - unknown program number - ( " + prog + " )");
					break;
			}
		}
	}
};

/** SETVAL */
/** Команда SETVAL (установка значений глобальных переменных уставок) */
function Gsetval(_variable, _value) {
	$SET[_variable] = _value;
};

/** SHAPE */
/*******************************************************************************
 * Команда SHAPE (графическое изображение из Библиотеки Форм)
 * 
 * Масштабировать или изменять размеры форм можно при добавлении их к графике.
 * 
 * Формы можно перевертывать относительно вертикальной оси, горизонтальной оси
 * или относительно одной и другой оси при отображении их на графике.
 * 
 * Кроме того, при отображении формы можно поворачивать приращениями по 90
 * градусов по часовой или против часовой стрелки.
 * 
 * Поворачивание и перевёртывание форм осуществляется вокруг их точки начала
 * координат (исходной точки).
 * 
 * <pre>
 * ВАЖНО !!!
 * ============================================================
 * Форма поворачивается или перевёртывается согласно заданным
 * параметрам до приведения его к масштабу для вписывания
 * внутрь указанного прямоугольника.
 * ============================================================
 * </pre>
 */
function Gshape(_x, _y, _w, _h, _shape_name, _rotation, _inversion) {
	// В современной разработке на JavaScript eval используется весьма редко.
	// Есть даже известное выражение – «eval is evil» («eval – это зло»).
	// А посему избавимся от eval - он не совместим с минимизатором кода.
	//	var trgt = new PIXI.Graphics();
	//	eval(shapelib[_shape_name].make);

	var trgt = shapelib[_shape_name].make();

	var shape_x0 = shapelib[_shape_name].x0;
	var shape_y0 = shapelib[_shape_name].y0;

	// контурный прямоугольник
	// ==================================================
	var BB = trgt.getBounds();
	var bbw = 0 + BB.width;
	var bbh = 0 + BB.height;

	var x = 0 + _x;
	var y = 0 + _y;
	var width = 0 + _w;
	var height = 0 + _h;
	var angle = -1 * _rotation;

	var sX = width / bbw;
	var sY = height / bbh;

	// Коррекция некоторых фигур
	// ==================================================
	if (typeof MAIN_diag != "undefined") {
		switch (_shape_name) {
			case 'DFDBKR':
				if ((MAIN_diag.diag_num == 2065) && ((_y == 9108) || (_y == 9117))) break;
				if ((MAIN_diag.diag_num == 3540) && ((_y == 9108) || (_y == 9117))) break;
				if ((MAIN_diag.diag_num == 3550) && ((_y == 9108) || (_y == 9117))) break;
				if ((MAIN_diag.diag_num == 5540) && ((_y == 9108) || (_y == 9117))) break;
				if ((MAIN_diag.diag_num == 5550) && ((_y == 9108) || (_y == 9117))) break;
				shape_x0 = shape_y0 = 0; break;
			case 'pumpfill3':
				if ((MAIN_diag.diag_num == 2030) && (_rotation == 0) && (_inversion == 'RTL')) { shape_x0 = 508/* (202+306) */; shape_y0 = 0; break; }
				if ((MAIN_diag.diag_num == 2114) && ((_y == 6441) || (_y == 6498))) break;
				if ((MAIN_diag.diag_num == 2060) && ((_y == 5563) || (_y == 5623))) break;
				shape_x0 = shape_y0 = 0; break;
			case 'fwpmp': shape_x0 = shape_y0 = 0; break;
			case 'pmpmtr':
				if ((_rotation == (-180)) && (_inversion == 'NONE')) { shape_x0 = 331; shape_y0 = 848; }
				if ((_rotation == (- 90)) && (_inversion == 'NONE')) { shape_x0 = 0; shape_y0 = 848; }
				break;
			case 'valve5':
				if ((_rotation == (90)) && (_inversion == 'NONE')) { shape_x0 = 276; shape_y0 = 0; }
				if ((_rotation == (- 90)) && (_inversion == 'NONE')) { shape_x0 = 0; shape_y0 = 635; }
				break;
		} // switch
	}
	// Коррекция некоторых фигур
	// ==================================================

	var shapeMatrix = Wdpf_matrix();

	// перенос
	// ==================================================
	shapeMatrix.translate((x - shape_x0), (y - shape_y0));

	// перевёртывание (отражение изображение
	// по горизонтали или вертикали)
	// ==================================================
	switch (_inversion) {
		case 'NONE':
			break;
		case 'RTL':
			shapeMatrix.scale(-1, +1, shape_x0, shape_y0);
			break;
		case 'TTB':
			shapeMatrix.scale(+1, -1, shape_x0, shape_y0);
			break;
		case 'BOTH':
			shapeMatrix.scale(-1, -1, shape_x0, shape_y0);
			break;
	}

	// поворачивание
	// ==================================================
	switch (_rotation) {
		case 0:
			break;
		case -270:
		case -180:
		case -90:
		case 90:
		case 180:
		case 270:
			shapeMatrix.rotate((angle), shape_x0, shape_y0);
			break;
	}

	// свернуть до единичного размера
	// ==================================================
	// развернуть до нужного размера
	// ==================================================
	shapeMatrix.scale(sX, sY, shape_x0, shape_y0);

	//console.log(shapeMatrix);

	var pixiShapeMatrix = new PIXI.Matrix(shapeMatrix.a, shapeMatrix.b,
		shapeMatrix.c, shapeMatrix.d, shapeMatrix.e, shapeMatrix.f);

	trgt.transform.setFromMatrix(pixiShapeMatrix);

	//trgt.cacheAsBitmap = true;

	//paper.push(trgt);
	if (BLINK.fg || BLINK.bg) blink_paper.push(trgt); else paper.push(trgt);

}; // Gshape

/** WDPF Matrix */
function Matrix(a, b, c, d, e, f) {
	if (a != null) {
		this.a = +a;
		this.b = +b;
		this.c = +c;
		this.d = +d;
		this.e = +e;
		this.f = +f;
	} else {
		this.a = 1;
		this.b = 0;
		this.c = 0;
		this.d = 1;
		this.e = 0;
		this.f = 0;
	}
}
(function (matrixproto) {
	/** Matrix.add */
	matrixproto.add = function (a, b, c, d, e, f) {
		if (a && a instanceof Matrix) {
			return this.add(a.a, a.b, a.c, a.d, a.e, a.f);
		}
		var aNew = a * this.a + b * this.c, bNew = a * this.b + b * this.d;
		this.e += e * this.a + f * this.c;
		this.f += e * this.b + f * this.d;
		this.c = c * this.a + d * this.c;
		this.d = c * this.b + d * this.d;

		this.a = aNew;
		this.b = bNew;
		return this;
	};

	/** Matrix.translate */
	matrixproto.translate = function (x, y) {
		this.e += x * this.a + y * this.c;
		this.f += x * this.b + y * this.d;
		return this;
	};

	/** Matrix.scale */
	matrixproto.scale = function (x, y, cx, cy) {
		y == null && (y = x);
		(cx || cy) && this.translate(cx, cy);
		this.a *= x;
		this.b *= x;
		this.c *= y;
		this.d *= y;
		(cx || cy) && this.translate(-cx, -cy);
		return this;
	};

	/** Matrix.rotate */
	matrixproto.rotate = function (a, x, y) {
		// a = a * (Math.PI / 180);
		a = rad(a);
		x = x || 0;
		y = y || 0;
		var cos = +Math.cos(a).toFixed(9), sin = +Math.sin(a).toFixed(9);
		this.add(cos, sin, -sin, cos, x, y);
		return this.add(1, 0, 0, 1, -x, -y);
	};
})(Matrix.prototype);

function Wdpf_matrix(a, b, c, d, e, f) {
	return new Matrix(a, b, c, d, e, f);
};

/** deg --> rad */
function rad(deg) {
	return deg % 360 * Math.PI / 180;
};

/** rad --> deg */
function deg(rad) {
	return rad * 180 / Math.PI % 360;
};

/** TEXT + */
function Gtext(_x, _y, _string, _orientation, _font_type, _bitmap_font_num, _vector_char_w, _vector_char_h, _line_width) {

	_string += '';

	var hl = HighLighterGraphics.search(_string);	// хайлайтер

	var gText = smpl_text(_x, _y, _orientation, 9999, 9999, _string, _font_type, _bitmap_font_num, _vector_char_w, _vector_char_h, _line_width, hl);

	//paper.push(gText);
	if (BLINK.fg || BLINK.bg) blink_paper.push(gText); else paper.push(gText);
}; // Gtext

/** MULTI_TEXT */
function Gmulti_text(_x, _y, _justification, _spacing, _num_of_strs, _strings, _font_type, _bitmap_font_num, _vector_char_w, _vector_char_h, _line_width) {
	var a_str_len = [];
	let multi_text_str = '';

	for (var i = 0; i < _num_of_strs; i++) {
		a_str_len.push(_strings[i].length);
		// сложить множество строк в одну сроку
		multi_text_str = multi_text_str + _strings[i] + ' ';
	}

	// удалить двойные пробелы
	multi_text_str = multi_text_str.replace(/ {1,}/g, " ");

	var hl = HighLighterGraphics.search(multi_text_str);	// хайлайтер

	// =================================
	function getMaxOfArray(numArray) {
		return Math.max.apply(null, numArray);
	}
	// =================================
	var hlb = { minX: 16383, minY: 16383, maxX: 0, maxY: 0 };

	function addB(b, bbox) {
		var r = { minX: 16383, minY: 16383, maxX: 0, maxY: 0 };
		r.minX = Math.min(b.minX, bbox.x);
		r.minY = Math.min(b.minY, bbox.y);
		r.maxX = Math.max(b.maxX, bbox.x + bbox.width);
		r.maxY = Math.max(b.maxY, bbox.y + bbox.height);
		return r;
	}
	// =================================

	var max_str_len = getMaxOfArray(a_str_len);

	for (var i = 0; i < _num_of_strs; i++) {
		var gText = smpl_text(_x, _y + ((_vector_char_h + _spacing) * i),
			'HORZ', _justification, max_str_len, _strings[i],
			_font_type, _bitmap_font_num, _vector_char_w, _vector_char_h, _line_width);
		paper.push(gText);
		hlb = addB(hlb, gText.getBounds());
	} // for

	// где хайлайтер ???
	if (hl) { HighLighterGraphics.show(hlb.minX, hlb.minY, (hlb.maxX - hlb.minX), (hlb.maxY - hlb.minY)); }

}; // Gmulti_text

/** TREND */
function Gtrend() { console.info('TREND not implemented') };

/** TRIGGER */
function Gtrigger() { console.info('TRIGGER not implemented') };

/** TRIG_ON */
/** Команда TRIG_ON (активизация (запуска) зоны "trigger") */
function Gtrig_on(_n) {
	f_trig_on[_n] = true;
};

/** Активирована (запущена) зона trigger ??? */
function trig_on(_n) {
	return f_trig_on[_n];
};

/** XY_PLOT */
function Gxy_plot() { console.info('XY_PLOT not implemented') };

/** ********************************************************* */
function set$P$A(pointer_index, offset_index, value) { $P$A[pointer_index][offset_index] = value; };
function set$P$B(pointer_index, offset_index, value) { $P$B[pointer_index][offset_index] = value; };
function set$P$I(pointer_index, offset_index, value) { $P$I[pointer_index][offset_index] = value; };
function set$P$R(pointer_index, offset_index, value) { $P$R[pointer_index][offset_index] = value; };
function set$P$S(pointer_index, offset_index, value) { $P$S[pointer_index][offset_index] = value; };

/** ********************************************************* */
function get$P$A(pointer_index, offset_index) { return $P$A[pointer_index][offset_index]; };
function get$P$B(pointer_index, offset_index) { return $P$B[pointer_index][offset_index]; };
function get$P$I(pointer_index, offset_index) { return $P$I[pointer_index][offset_index]; };
function get$P$R(pointer_index, offset_index) { return $P$R[pointer_index][offset_index]; };
function get$P$S(pointer_index, offset_index) { return $P$S[pointer_index][offset_index]; };

/** ********************************************************* */
function def$H(index, segment, offset) { };
function def$P(index, segment, offset) { };







/**
*/
var printError = function (error, explicit) {
	console.log(`[${explicit ? 'ERROR' : 'ERROR'}] ${error.name}: ${error.message}`);
}

/**
* CNTRL_POKE (6)
* 
* С помощью программы CNTRL_POKE возможен выбор из одиночной видеограммы,
* отображаемой в основном окне или в окне, до 50 элементов управления.
* 
* При нажатии мышью на poke-поле инициируются действия, определяемые заданным
* триггером (TRIGGER).
* 
* {"prog":6,"diag":0,"arg":["OCB0H015AK","OCB0H015AK",1,10,2]}
* {"prog":6,"diag":0,"arg":["OCB0L0626S","OCB0L0626O",1,11,2]}
* 
* Аргументы:
* 
* Количество аргументов = 5.
* 
* point1 - Имя точки алгоритма и поле записи идентификатора для функций
* программируемых кнопок 1-4: RAISE_SETPOINT, LOWER_SETPOINT, START и STOP.
* 
* point2 - Имя точки алгоритма и поле записи идентификатора для функций
* программируемых кнопок 5-8: AUTO_MODE, MANUAL_MODE, RAISE_OUTPUT и LOWER_OUTPUT.
* 
* trig_num - Номер триггерной функции для выполнения.
* 
* set_num - Номер установочной переменной (используется в триггере).
* 
* setval - Целое число, назначаемое установочной переменной в триггерной функции.
* 
* При выборе значения 2 для предыдущей установочной переменной переустанавливается значение 1.
*/
function CNTRL_POKE(_arg) {

	CNTRL_PANEL.SetPointName = _arg[0];
	CNTRL_PANEL.OutPointName = _arg[1];

	var trig_num = Number(_arg[2]);
	var set_num = Number(_arg[3]);
	var set_val = Number(_arg[4]);

	/* Функции — это не процедуры.
	 * Функция всегда возвращает значение, а процедура может возвращать, а может не возвращать.
	 */

	var functionName = "MAIN_diag.TRIGGER_" + trig_num;

	if (set_val == 2) set_val = 1;
	Gsetval(set_num, set_val);
	try {
		eval(functionName + "();");
	} catch (e) {
		if (e instanceof TypeError) {
			printError(e, true);
		} else {
			printError(e, false);
		}
	}

};

/**
* EXEC_TRIGGER (122)
* 
* Программа EXEC_TRIGGER выполняет триггерную функцию видеограммы из poke-поля.
* 
* {"prog":122,"diag":0,"arg":[$CONST[1],20]}
* 
* {"prog":122,"diag":0,"arg":[7,37]}
* 
* Аргументы: Количество аргументов = 2 или 4
* 
* При вводе значения 4 требуется определение set_num и set_val.
* 
* si - Идентифицируется тип видеограммы, содержащей триггерную функцию.
* Варианты выбора: 1 = Главное окно, 2 = Субокно, 7 = Окно.
* 
* trigger - Номер выполняемой триггерной функции видеограммы. Действительными
* номерами видеограммы являются 1 ... 255.
* 
* set_num - Используется только при значении num_of_args, равном 4. Номер
* установочной переменной. Допустимая область значений = 1 ... 255 или $SET1
* ... $SET255.
* 
* set_val - Используется только при значении num_of_args, равном 4. Целое
* число, назначаемое установочной переменной.
*/
function EXEC_TRIGGER(_arg) {

	var si;			// Тип видеограммы
	var trigger;	// Номер тригерной функции
	var set_num;	// Номер установочной переменной
	var set_val;	// Назначаемое значение установочной переменной

	var num_of_args = _arg.length;

	if (num_of_args == 2) {
		si = Number(_arg[0]);
		trigger = Number(_arg[1]);
	}
	if (num_of_args == 4) {
		si = Number(_arg[0]);
		trigger = Number(_arg[1]);
		set_num = Number(_arg[2]);
		set_val = Number(_arg[3]);
		if (set_val == 2) set_val = 1;
		Gsetval(set_num, set_val);
	}

	var functionName = "";

	if (si == 1)
		functionName = "MAIN_diag.TRIGGER_" + trigger;
	else
		functionName = "WINDOW_diag.TRIGGER_" + trigger;

	try {
		eval(functionName + "();");
	} catch (e) {
		if (e instanceof TypeError) {
			printError(e, true);
		} else {
			printError(e, false);
		}
	}

};

/**
* SEND_CA (80)
* 
* Программа SEND_CA используется для посылки сообщения об изменении атрибута
* для точки из видеограммы.
* 
* {"prog":80,"diag":0,"arg":[1,1,1,0,2,0,0,0,$D[1],2,0,$O[1],12]}
* {"prog":80,"diag":0,"arg":[1,1,1,0,2,0,0,0,$D[1],2,0,$O[1],13]}
*/
function SEND_CA(_arg) {
	//console.log("SEND_CA(" + JSON.stringify(_arg) + ")");
};

/**
* SEND_CA_EV (105)
* 
* SEND_CA_EV используется с целью посылки сообщения об изменении атрибута для
* точки из управляющей видеограммы. Эта программа создает также операторское
* сообщение о событии (Event Message), выводимое на принтер или записываемое в
* журнал регистрации событий.
*/

/**
* WINDOW_FUNC_KEY (117) нужна diag
* 
* Программа WINDOW_FUNC_KEY открывает окно при выборе poke-поля.
* 
* {"prog":117,"diag":7022,"arg":[0,13830,90,0,6,"OCB1L0400X","OCB1L0400X","1CWLI0417","1CWLI0400","OCB1L0400X","1CWLY0400A"]}
* {"prog":117,"diag":7023,"arg":[0,30,90,0,7,"OCB006C004","OCB006C004","0FGPI0815A","0FGPI0816A","0FGPI0817A","OCB006C004_X3","0FGPI0818A"]}
* {"prog":117,"diag":8001,"arg":[0,0,0,0,0]}]
* {"prog":117,"diag":9995,"arg":[0,13830,90,0,3,"OCB007F012","OCB007F012","OCB007F013-OUT"]}
* 
* Аргументы: Количество аргументов = ?.
* 
* group - Группа для отображения.
*         Варианты выбора:
*            0 = Нет группы;
*            -1 = Та же группа, что и в главном окне;
*            1 ... 5000 = группа типа "окно".
* 
* dispx - Координата x верхней левой позиции экрана, на которой начинается
* окно.
* 
* dispy - Координата y верхней левой позиции экрана, на которой начинается
* окно.
* 
* type - 0 (никакие другие типы не поддерживаются).
* 
* num_of_points - Количество параметров указателя $W. Т.е., количество точек,
* передаваемых в окно. Если точки не передаются, вводится 0 (нуль).
* 
* point_list - Список точек для передачи в окно. С каждой точкой необходимо
* передавать содержимое поля идентифицирующей записи. Передача содержимого
* любого другого поля записи приводит к ошибке во время выполнения программы.
* Если никакие точки не передаются, данный аргумент следует оставлять пустым.
* Это применимо к случаям, когда отображается окно, содержащее только текстовую
* информацию, или когда в окне закодированы имена точек, или когда используются
* группы.
*/
function WINDOW_FUNC_KEY(_diag, _arg) {
	var diag = _diag;
	//var group = _arg[0];
	var dispx = _arg[1];
	var dispy = _arg[2];
	//var type = _arg[3];
	var num_of_points = _arg[4];

	var point_name = '';

	var jsonW = [];
	jsonW.push('\"' + '' + '\"');

	if (num_of_points != 0) {
		for (let i = 0; i < num_of_points; i++) {
			var pnt_name = _arg[5 + i];
			jsonW.push('\"' + pnt_name + '\"');
			$W[i + 1] = pnt_name;
			point_name = pnt_name;
		}
	}

	// Создадим объект и не будем заморачиваться с клонированием
	// Фактически повторим кроманду типа
	//    var WINDOW_diag_7225 = new WINDOW_DIAG_7225(fld_WINDOW_DIAG_7225);
	// которую сгенерили ANTLR
	var str = "WINDOW_diag = new WINDOW_DIAG_" + diag + "(fld_WINDOW_DIAG_" + diag + ",[" + jsonW + "]);";

	try {
		eval(str);
	} catch (e) {
		if (e instanceof TypeError) {
			printError(e, true);
		} else {
			printError(e, false);
		}
	}

	flag_init_PopUp = true;		// флаг открытия pop-pup окна

	//	console.log('Обнулить счетчик обновлений текущего pop-pup окна');
	update_counter_PopUp = 0;	// счетчик обновлений текущего pop-pup окна

	//	console.log('dispx, dispy ==', dispx, dispy);

	var disp_y = Math.max(dispy, 1000);

	PopUpWinContainer.setParam(
		diag + ' - ' + point_name,
		dispx,
		disp_y,
		WINDOW_diag.background);

};

/**
* WINDOW_DELETE (125)
* 
* Программа WINDOW_DELETE удаляет с экрана окно управления.
* 
* {"prog":125,"diag":0,"arg":[]}
* 
* Количество аргументов, указанное для данной прикладной программы. Для данной
* прикладной программы в командную строку следует ввести число 0.
*/
function WINDOW_DELETE() {
	if (flag_init_PopUp) {
		PopUpWinContainer.Hide();	// flag_init_PopUp = false;
	}
};

/**
* DISP_EFDATA (66)
* DISP_EFDATA (119)
* 
* DISP_EFDATA отображает данные в полях ввода либо в главном окне, либо в субокне.
* 
* {"prog":66,"diag":0,"arg":[ 1, 0, $CONST[3], " "]}
* {"prog":66,"diag":0,"arg":[ 1, 0,         2, $D[1]]}
* {"prog":66,"diag":0,"arg":[ 1, 0,        24, "      "]}
* 
* {"prog":119,"diag":0,"arg":[ 3, 0, 1, " HP DRUM ",
*                                    2, " 1 OF 3",
*                                    3, " ELEM SELECT"]}
* {"prog":119,"diag":0,"arg":[ 3, 0, 1, "COOLING AIR",
*                                    2, " BLOWER B",
*                                    3, "1HRHS1522"]}
* {"prog":119,"diag":0,"arg":[ 5, 0, 1, "HP DRUM LVL",
*                                    2, "MAIN VALVE",
*                                    3, "1HRFV1420A",
*                                    4, "START VALVE",
*                                    5, "1HRFV1420B"]}
* 
* Аргументы: Количество аргументов = ?.
* 
* win - Количество полей ввода для записи в главном окне
* 
* sub - Количество полей ввода для записи в субокне
* 
* ef - Номер буфера поля ввода - номер буфера поля ввода команды ENTRY_FLD
* 
* data - Данные для отображения в поле ввода
*/
function DISP_EFDATA66(_arg) {
	var win = _arg[0];
	var sub = _arg[1];

	var num_of_args = _arg.length;

	for (let i = 2; i < num_of_args; i += 2) {
		let ef = _arg[i];
		let data = _arg[i + 1];
		EntryFieldData[ef] = data;
	}
};

/** */
function DISP_EFDATA119(_arg) {
	var win = _arg[0];
	var sub = _arg[1];

	var num_of_args = _arg.length;

	for (let i = 2; i < num_of_args; i += 2) {
		let ef = _arg[i];
		let data = _arg[i + 1];
		EntryFieldData[ef] = data;
	}
};

/**
* EXECUTE_PROCESS (202)
* 
* Программа EXECUTE_PROCESS зеркально отражает выводимую командную строку с
* параметрами.
* 
* {"prog":202,"diag":0,"arg":["/usr/wdpf/dpu/bin/dropdiag"]}
*/
function EXECUTE_PROCESS(_arg) {
	//console.log("EXECUTE_PROCESS(" + JSON.stringify(_arg) + ")");
};

/**
* CLEAR_CONTROL (203)
* 
* SYNTAX
* 
* POKE_FLD x y w h state poke_type progs prog_num diag_num args
* 
* OR
* 
* POKE_FLD x y w h state poke_type progs prog_num diag_num num_of_args trig_num
* set_num setval
* 
* {"prog":203,"diag":0,"arg":[]}
*/
function CLEAR_CONTROL(_arg) {
	//console.log("CLEAR_CONTROL(" + JSON.stringify(_arg) + ")");
};

/**
* ACK_DROP_ALARM (210)
* 
* Программа ACK_DROP_ALARM квитирует аварийный сигнал (Drop Alarm) для
* выбранного устройства, выдавая с помощью записи о состояния устройства
* (Drop Status Record) соответствующую команду
*/
function ACK_DROP_ALARM() {
	//console.log("ACK_DROP_ALARM");
};

/**
* REENABLE_HWY (211)
*/
function REENABLE_HWY() {
	//console.log("REENABLE_HWY");
};

/**
* CLEAR_DROP_FAULT (212)
* 
* Программа CLEAR_DROP_FAULT пытается удалить аварийную сигнализацию и
* сигнализацию об отказах устройства для выбранного устройства, выдавая с помощью
* записи о состоянии устройства (Drop Status) соответствующую команду 
*/
function CLEAR_DROP_FAULT() {
	//console.log("CLEAR_DROP_FAULT");
};

/**
* REVOTE_BUSLIST (213)
*/
function REVOTE_BUSLIST() {
	//console.log("REVOTE_BUSLIST");
};

/**
* ALARM_ACKNOWLEDGE (214)
* 
* Функция ALARM_ACKNOWLEDGE подтверждает группу аварийных сигналов,
* определенных с помощью данного poke-поля.
* 
* {"prog":214,"diag":0,"arg":["11TRIP_BFW","1FWPALL1708","1FWFALL1750","1HRLALL1480","1FWXA1750M","1FWTAH1759A","1FWXA1758"]}]
* {"prog":214,"diag":0,"arg":[$D[4],$D[5],$D[6]]}]
* 
* num_pts - Количество точек, для которых подтверждаются аварийные сигналы.
* Допустимая область значений = 1 ... 100. точки - Перечень имен num_pts (с
* обязательными полями записи идентификатора).
*/
function ALARM_ACKNOWLEDGE(_arg) {
	var num_of_args = _arg.length;
	for (let i = 0; i < num_of_args; i++) {
		var pnt_name = _arg[i];						// Имя параметра выделено !!! ???
		if (typeof pnt_name === 'undefined') {
			// pnt_name is undefined
		} else {
//			opp_acknowledge_alarm(pnt_name);		// Квитировать (подтвердить) сигнализацию - первый и не лучший вариант
			schedule_acknowledge_alarm(pnt_name);	// Запланировать квитирование (подтверждение) сигнализации
		}
	}
};

/** ****************************************************************************
 * Динамические данные
 * 
 * Analog Point (LA) Records
 * 1W	First Analog Status
 * 2W	Second Analog Status
 * 3W 	Third Analog Status
 * AV 	Analog Value Word
 * AS
 * 
 * Digital Point (LD) Records
 * 1W	First Digital Status
 * 2W	Second Digital Status
 * 3W 	Third Digital Status
 * DS
 * 
 * Packed Point (LP) Records
 * 1W	First Packed Status
 * 2W	Second Packed Status
 * 3W	Third Packed Status
 * A2	Current Digital Value Bits
 * A3	Invalidity Bits
 * B3	Force Bits
 * C9	Current Bits In Alarm
 * 
 * Drop Point (DU) Records
 * FA	Слово состояния 1 функционального процессора
 * FB	Режим устройства системы Ovation
 * FC	Код отказа устройства системы
 * FK	Код идентификации отказа
 * FS	Параметр отказа 1
 * FO	Параметр отказа 2
 * HC	Слово состояния магистрали
 * TA	Код внимания устройства системы Ovation
 * CT	Зарезервирован
 * LN	Последний номер в последовательности аварийных сигналов
 * E5	Процент обновления распределенной базы данных
 * E6	Несогласованные метки
 * 
 */

/** Общие динамические поля для Analog (LA), Digital (LD) и Packed (LP) Point
 * 
 *   а именно поля:
 * 
 *   1W - First Analog Status  First Digital Status  First Packed Status
 *   2W - Second Analog Status Second Digital Status Second Packed Status
 *   3W - Third Analog Status  Third Digital Status  Third Packed Status
 */
function get1W(pt_name) {
	if (!(SHC["_" + pt_name])) {
		//let first_status = opp_modify_bit_values(0, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN);
		//return first_status;
		return (STATUSWORD['HDWRFAIL'].PATTERN);	// 1W - First Status
	} else {
		/*
		if (debugValStat) {
			let qual = Number(getRandomInt(0, 4));
			let stat = STATUSWORD['GOOD'].PATTERN;
			if (qual == 1)
				stat = STATUSWORD['HDWRFAIL'].PATTERN;
			if (getRT(pt_name) == 141) // Дискретный параметр (RT=141)
				if (qual == 0)
					stat = stat + STATUSWORD['OFF0'].PATTERN;
				else
					stat = stat + STATUSWORD['ON0'].PATTERN;
			return stat;
		}
		*/
		return Number(SHC["_" + pt_name]._1W);
	}
};

function get2W(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._2W); };
function get3W(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._3W); };

function setAV(pt_name, val) { if (SHC["_" + pt_name]) SHC["_" + pt_name]._AV = val + ''; };
function setAS(pt_name, val) { if (SHC["_" + pt_name]) SHC["_" + pt_name]._AS = val + ''; };
function set1W(pt_name, val) { if (SHC["_" + pt_name]) SHC["_" + pt_name]._1W = val + ''; };
function set2W(pt_name, val) { if (SHC["_" + pt_name]) SHC["_" + pt_name]._2W = val + ''; };
function set3W(pt_name, val) { if (SHC["_" + pt_name]) SHC["_" + pt_name]._3W = val + ''; };

function setA2(pt_name, val) { if (SHC["_" + pt_name]) SHC["_" + pt_name]._A2 = val + ''; };
function setA3(pt_name, val) { if (SHC["_" + pt_name]) SHC["_" + pt_name]._A3 = val + ''; };

function setFA(pt_name, val) { if (SHC["_" + pt_name]) SHC["_" + pt_name]._FA = val + ''; };

/** Динамические поля для Analog Point (LA) Records
 *  AV - Analog Value Word
 */
function getAV(pt_name) {

	if ((SHC["_" + pt_name])) {
		if ( ((getRT(pt_name)) == 91) || ((getRT(pt_name)) == 0) ) {

			FM.type = getFMtype(pt_name);
			FM.digits = getFMdigits(pt_name);
			FM.status = get1W(pt_name);
			/*
			if (debugValStat)
				return Number(getRandomFloat(0.21, 21.21));
			*/
			return Number(SHC["_" + pt_name]._AV);

		} else if ( (getRT(pt_name)) == 141 ) {

			FM.type = NaN;
			FM.digits = NaN;
			FM.status = get1W(pt_name);

			if ( vStatus(FM.status, "=",   "SET") ) return getST(pt_name);
			if ( vStatus(FM.status, "=", "RESET") ) return getRS(pt_name);

		} else
			return Number(-99999.99999);

	}
	// return;	// Результат функции с пустым return или без него – undefined
};

/** Результат функции с пустым return или без него – undefined */
function getFMtype(pt_name) {
	if ((SHC["_" + pt_name]))
		if (SHC["_" + pt_name].FM_TYPE)
			return String(SHC["_" + pt_name].FM_TYPE);
};

/** */
function getFMdigits(pt_name) {
	if ((SHC["_" + pt_name]))
		if (SHC["_" + pt_name].FM_DIGITS)
			return Number(SHC["_" + pt_name].FM_DIGITS);
};

/** Динамические поля для Analog Point (LA) Records
 *  AS - First Analog Status - унаследовано от WDPFII
 */
function getAS(pt_name) {
	return get1W(pt_name);
};

/** Динамические поля для Digital Point (LD) Records
 *  DS - First Digital Status - унаследовано от WDPFII
 */
function getDS(pt_name) {
	return get1W(pt_name);
};

/** Динамические поля для Drop Point (DU) Records
 * 
 * FA - Слово состояния 1 функционального процессора
 * FB - Режим устройства системы Ovation
 * FC - Код отказа устройства системы
 * FK - Код идентификации отказа
 * FS - Параметр отказа 1
 * FO - Параметр отказа 2
 * HC - Слово состояния магистрали
 * TA	Код внимания устройства системы Ovation
 * CT	Зарезервирован
 * LN	Последний номер в последовательности аварийных сигналов
 * E5	Процент обновления распределенной базы данных
 * E6 - Несогласованные метки
 */
function getFA(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._FA); };
function getFB(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._FB); };
function getFC(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._FC); };
function getFK(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._FK); };
function getFS(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._FS); };
function getFO(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._FO); };
function getHC(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._HC); };
function getE6(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._E6); };

/** MMI поля для Drop Point (DU) Records
 * 
 * RT - Record Type Number
 * PA - Point Alias
 * 
 * PN - Point Name
 * ED - English Description
 * EU - Engineering Units of Current Value
 * RS - Reset State Description
 * ST - Set State Description
 * 
 */
function getRT(pt_name) {
	if (!(SHC["_" + pt_name])) return -1; else return Number(SHC["_" + pt_name]._RT);
};

function getPA(pt_name) {
	if (!(SHC["_" + pt_name]))
		return "________________";
	else
		return String(SHC["_" + pt_name]._PA).padEnd(16);
};

//
// (OS) 01.06.2021
//
// строка
//    String(SHC["_" + pt_name]._AN).padEnd(16); - именно эти пробелы и приводили к ошибке
// заменена на строку
//    String(SHC["_" + pt_name]._AN);
//
function getAN(pt_name) {
	if (!(SHC["_" + pt_name]))
		return "________________";
	else
		return String(SHC["_" + pt_name]._AN);
};

function getKR(pt_name) {
	if (!(SHC["_" + pt_name]))
		return "________";
	else
		return String(SHC["_" + pt_name]._KR).padEnd(8);
};

/** */
function getPN(pt_name) {
	FM.status = get1W(pt_name);
	if (!(SHC["_" + pt_name]))
		return "________________";
	else
		return String(SHC["_" + pt_name]._PN);
};

/** */
function getED(pt_name) {
	FM.status = get1W(pt_name);
	if (!(SHC["_" + pt_name]))
		return "______________________________";
	else
		return String(SHC["_" + pt_name]._ED).padEnd(30);
};

/** */
function getEU(pt_name) {
	FM.status = get1W(pt_name);
	if (!(SHC["_" + pt_name]))
		return "______";
	else
		return String(SHC["_" + pt_name]._EU).padEnd(6);
};

/** */
function getRS(pt_name) {
	FM.status = get1W(pt_name);
	if (!(SHC["_" + pt_name]))
		return "______";
	else
	return String(SHC["_" + pt_name]._RS).padEnd(6);
};

/** */
function getST(pt_name) {
	FM.status = get1W(pt_name);
	if (!(SHC["_" + pt_name]))
		return "______";
	else
		return String(SHC["_" + pt_name]._ST).padEnd(6);
};

/** AP - Alarm Priority */
function getAP(pt_name) {
	if (!(SHC["_" + pt_name]))
		return 0;
	else {
		let aph = Number(SHC["_" + pt_name].AP_H);	// Первая цифра = Приоритет верхнего аварийного сигнала
		let apl = Number(SHC["_" + pt_name].AP_L);	// Вторая цифра = Приоритет нижнего аварийного сигнала
		return (aph << 4 | apl);
	}
};

/**
 * TV - Maximum Scale Value of Point
 * BV - Minimum Scale Value of Point
 */
function getTV(pt_name) {
	if (!(SHC["_" + pt_name]))
		return 0;
	else {
		//console.log("TV - Maximum Scale Value of Point <" + pt_name + ">=" + SHC["_" + pt_name]._TV);
		return Number(SHC["_" + pt_name]._TV);
	}
};

function getBV(pt_name) {
	if (!(SHC["_" + pt_name]))
		return 0;
	else {
		//console.log("BV - Minimum Scale Value of Point <" + pt_name + ">=" + SHC["_" + pt_name]._BV);
		return Number(SHC["_" + pt_name]._BV);
	}
};

/** DO - Originating Drop Number */
function getOP(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._OP); };

/** A2 - Current Digital Value Bits */
function getA2(pt_name) {
	if (!(SHC["_" + pt_name]))
		return 0;
	else {
		/*
		if (debugValStat)
			return Number(getRandomInt(0, 43690));	// 43690 = AAAA
		*/
		return Number(SHC["_" + pt_name]._A2);
	}
};

//function getA3(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._A3); };

function getB7(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._B7); };
function getBD(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._BD); };
function getBS(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._BS); };
function getD7(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._D7); };

/** DO - Originating Drop Number */
function getDO(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._DO); };

/**
 * X3 - Algorithm Byte Field
 * X4 - Algorithm Byte Field
 */
function getX3(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._X3); };
function getX4(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._X4); };

/** ZY - Command Word */
function getZY(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._ZY); };

/**
 * LC	Flash	REAL_PARAM_1	R1 	R32 	Algorithm 32 Bit Real Number Field
 * LC	Flash	REAL_PARAM_2	R2 	R32 	Algorithm 32 Bit Real Number Field
 * LC	Flash	REAL_PARAM_3	R3 	R32 	Algorithm 32 Bit Real Number Field
 */
function getR1(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._R1); };
function getR2(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._R2); };
function getR3(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._R3); };

/**
 * OE - The number of output packet errors
 * K0 - State of Channel 0 of the Network Interface card
 * K1 - State of Channel 1 of the Dual Attached FDDI card
 * VE - Vendor of the Network Interface Card
 * TR - The Target Token Rotation Time (in milliseconds) requested by this drop
 * TY - Drop Type Code
 * PS - Partner Drop System Identification
 * KM - Type of the Network Interface Card
 * NE - Target Token Rotation Time (in milliseconds) negotiated on this ring
 * F9 - Drop Function Word
 * IE - The number of input packet errors
 * IS - The number of packets received 
 */
function getOE(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._OE); };
function getK0(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._K0); };
function getK1(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._K1); };
function getVE(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._VE); };
function getTR(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._TR); };
function getTY(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._TY); };
function getPS(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._PS); };
function getKM(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._KM); };
function getNE(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._NE); };
function getF9(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._F9); };
function getIE(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._IE); };
function getIS(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._IS); };

/**
 * E0 - Mask for Alarm Grouping
 */
function getE0(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._E0); };

/**
 * ValidateSignalRange
 */
function getT9(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._T9); };
function getU1(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._U1); };
function getR5(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._R5); };
function getR6(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._R6); };
function getR7(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._R7); };
function getR8(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._R8); };

/**
 * Только для тестового видеокадра 99999.src
 */
function getZL(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._ZL); };
function getLL(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._LL); };
function getHL(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._HL); };
function getZH(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._ZH); };
function getLC(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name].LC_FIELD); };
function getDB(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._DB); };
function getDJ(pt_name) { if (!(SHC["_" + pt_name])) return 0; else return Number(SHC["_" + pt_name]._DJ); };
