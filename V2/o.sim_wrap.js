"use strict";

/** !!! Не забыть убрать при интеграции с SIM !!!
 * ********************************************************* */
var debugValStat = false;
//var debugValStat = true;

/** L.A. Communication API globals
* ********************************************************** */
var simServer = null;
var subscription = null;

/** Иммитация динамических полей
 * ********************************************************* */
function getRandomFloat(min, max) { return Math.random() * (max - min) + min; }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min)) + min; }

/** Приостановить прием динамических полей параметров от симулятора
 * ********************************************************* */
function termDynamicSHC() {
}

/** Инициализировать прием динамических полей параметров от симулятора
 * ********************************************************* */
function initDynamicSHC() {
	var varList = [];	// список подписываемых SIM параметров

	// Первая инициализация динамических полей и создание списка подписываемых SIM параметров
	for (name in SHC) {
		let point = SHC[name];
		let spd = point._PN;
		let varName = ('w' + spd).toString().replace(/-OUT$/gi, ".o_OUT");
		let RT = getRT(spd);
		switch (RT) {
			case 91:	// Аналоговый параметр (RT=91)
				setAV(spd, 0);								// AV	R32	Analog Value Word
				set1W(spd, STATUSWORD['HDWRFAIL'].PATTERN);	// 1W	I32	First Analog Status
				set2W(spd, 0);								// 2W	I32	Second Analog Status
				set3W(spd, 0);								// 3W	I32	Third Analog Status			
				varList.push(varName);
				break;
			case 141:	// Дискретный параметр (RT=141)
				set1W(spd, 0 +								// Current digital value
					STATUSWORD['HDWRFAIL'].PATTERN);	// 1W	I32	First Digital Status
				set2W(spd, 0);								// 2W	I32	Second Digital Status
				set3W(spd, 0);								// 3W	I32	Third Digital Status
				varList.push(varName);
				break;
			case 226:	// Упакованный параметр (RT=226)
				setA2(spd, 0);								// A2	I16 Текущие разряды с дискретным значением
				setA3(spd, 0);								// A3	I16 Разряды недействительности
				set1W(spd, STATUSWORD['HDWRFAIL'].PATTERN);	// 1W	I32	Первое упакованное состояние
				set2W(spd, 0);								// 2W	I32	Второе упакованное состояние
				set3W(spd, 0);								// 3W	I32	Третье упакованное состояние
				varList.push(varName);
				break;
			case 6:	// Параметр устройства системы Ovation (RT=6)
				setFA(spd, 0);								// FA	I16 Слово состояния 1 функционального процессора
				varList.push(varName);
				break;
			case 191:	// Параметр алгоритма (RT=191)
				varList.push(varName);
				break;
		} // switch

	} // for

	/** L.A. Communication API initialization data
	* ********************************************************** */
	/** Error handler
	 * @param {string} data - A string param
	 */
	var onError = function (data) {
//		alert(data.error);
		console.error(data.error);
	}.bind(this);

	/**
	 * Server subscription data handler 
	 * @param {object} subscriptionConfig - object returned from subscribe
	 * @param {object} responseToSubscribe - data for subscription variables
	 * */
	var onServerData = function (subscriptionConfig, responseToSubscribe) {
		for (let i in subscriptionConfig.var_list) {
			let varName = subscriptionConfig.var_list[i].slice(1);
			let spd = varName.replace(/.o_OUT$/gi, "-OUT");
			let value = responseToSubscribe[i];
			const bad_bit = STATUSWORD['HDWRFAIL'].PATTERN;
			let word = get1W(spd) & !bad_bit;
			let RT = getRT(spd);
			if (value === null) {
				// 1W	I32	First Analog Status
				word |= bad_bit;
				//console.log('Point[' + RT + '](' + varName + ') is bad');
			}
			else {
				word = word | STATUSWORD['GOOD'].PATTERN;
				switch (RT) {
					case 91:	// Аналоговый параметр (RT=91)
						var analogVal = Number(value);
						setAV(spd, analogVal);  // AV	R32	Analog Value Word
						//console.log('Analog(' + spd + ') <=' + analogVal);
						break;
					case 141:	// Дискретный параметр (RT=141)
						if (value)
							word |= STATUSWORD['ON0'].PATTERN;
						else
							word |= STATUSWORD['OFF0'].PATTERN;
						//console.log('Logic(' + spd + ') <=' + ((value)?"true":"false").toString());
						break;
					case 226:    	// Упакованный параметр (RT=226)						
						var pkgVal = Number(value);
						setA2(spd, pkgVal);	// A2	I16 Текущие разряды с дискретным значением
						//console.log('Integer(' + spd + ') <=' + pkgVal);
						break;
					case 6: 	// Параметр устройства системы Ovation (RT=6)
						//console.log('Устройство(' + spd + ') <= '+ value);
						break;
					case 191: 	// Параметр алгоритма (RT=191)
						//console.log('Алгоритм(' + spd + ') <= ' + value);
						break;
					default:
						//console.log('Unknown(' + spd + ') <= '+ value);
						break;
				}
			}
			set1W(spd, word);
		}

		// перерисовка видеокадра после получения Асинхронных данных сервера
		/*
				if (!this.redrawBuisy) {
					this.redrawBuisy = true;
					this.t0 = this.t0 || performance.now();
					setTimeout(function () {
						redraw_Main();
						var t1 = performance.now();
						var delta = t1 - this.t0;
						console.log("redraw_Main() " + (delta).toFixed(1) + " (ms)");
						this.redrawBuisy = false;
						this.t0 = t1;
					}.bind(this), 10);
				}
		 */
		// перерисовка видеокадра выполняется независимо от получения данных от сервера в игровом цикле mainLoop

	}.bind(this);

	/**
	* Server Action data handler
	* @param {object} action - action string 
	* @param {object} desktopKey - ref to simProtocol.js function SimProtocol._handleServerAction
	* */
	var onServerAction = function (action, desktopKey) {
		// ref to // L.A. (01_29_2020)
		// file Communication2\ui\o.primitives.js
		console.log("Ovation onServerAction(" + action + ")");

		// 1 - получить объект параметров приложения Ovation из URL
		QueryArgs = getUrlQueryArgs();

		var lower = action.toLowerCase();
		if (lower.indexOf("open ") === 0) {
			let _group_num = 0;				 // server action don't know PDSGroup 
			let _diag_num = action.slice(5); // page name is NO MORE case sensitive

			// navigates in ovation
			/*
						setTimeout(function () {
							let curURL = window.location.href.toString();
							let newURL = curURL.replace(/\d+\.html/i, '' + _diag_num + '.html');
							let n = newURL.indexOf('?') + 1;
							newURL = newURL.replace(/(\?|&)PDSGroup=\d+&?/ig, '?');
							window.location.href = newURL.slice(0, n) + 'PDSGroup=' + _group_num + '&' + newURL.slice(n);
						}, 1);
			*/

			_diag_num = +_diag_num;
			_group_num = +_group_num;
			//do not use !==, because of "3020" equals to 3020.
			if (QueryArgs.diag != _diag_num || QueryArgs.group != _group_num) {
				QueryArgs.diag = _diag_num;
				QueryArgs.group = _group_num;

				// Сброс хайлайтера при смене диаграммы по команде сервера
				QueryArgs.htext = '';			// ключевой текст текстовыделителя
				QueryArgs.hnumb = 1;			// требуемый номер вхождения, по умолчанию - первый найденный объект

				setUrlQueryArgs(QueryArgs);
				LoadingBarGraphics.show();

				console.log("navigate(" + _diag_num + ")");
			}
			// Сброс хайлайтера ???
			//			QueryArgs.htext = '';			// ключевой текст текстовыделителя
			//			QueryArgs.hnumb = 1;			// требуемый номер вхождения, по умолчанию - первый найденный объект

			// 2 - обновить URL приложения Ovation из объекта
			//setUrlQueryArgs(QueryArgs);

			//console.log("navigate(" + _diag_num + ")");
			return true;
		}
		else if (lower.indexOf("object ") === 0) {
			let objectId = action.slice(7);
			//			setHighlight(objectId);

			// После консультаций с А.Левашовым 25.08.2020 ( objectId = htext[:hnumb] )
			let argList = objectId.split(':');

			// Установка хайлайтера
			QueryArgs.htext = argList[0];	// ключевой текст текстовыделителя

			// требуемый номер вхождения, по умолчанию - первый найденный объект
			QueryArgs.hnumb = typeof argList[1] !== 'undefined' ? (argList[1] * 1) : 1;
			QueryArgs.hnumb = isNumber(QueryArgs.hnumb) ? QueryArgs.hnumb : 1;

			// 2 - обновить URL приложения Ovation из объекта
			setUrlQueryArgs(QueryArgs);

			return true;
		}
	}

	/**
	 * callback on server connection
	 * */
	var onConnectedToSimulator = function () {
		subscription = simServer.subscribe(varList, onServerData);
		simClient.simSubscribeManager.onServerAction = onServerAction;
		if (sessionStorage) {
			//check if hightlight object command should be executed.
			let objectId = sessionStorage.getItem('highlight');
			if (objectId) {
				sessionStorage.removeItem('highlight');
				SimProtocol._handleServerAction({
					action: "object " + objectId,
					subscribeManager: simClient.simSubscribeManager
				});
			}
		}
	}.bind(this);

	/**
	 * callback on browser ready to establish simulator connectio
	 * */
	var entryPoint = function () {
		//api function 1: get simulator by something, return object with sim descr
		simServer = new SimServerWebAPI();
		simServer.connect(
			onConnectedToSimulator,
			onError
		);
	}.bind(this);



	if (!debugValStat) {
		//initSimServerWebAPI(entryPoint);
		setTimeout(entryPoint, 1);
		// 		redraw_Main();	// перерисовка секций видеокадра, после ввода параметров от SIM
		//	} else {
		// !!! отладочная ветка !!!
		//		RandomValue( varList );	// Шумим значением параметров
		//		redraw_Main();	// перерисовка секций видеокадра
		// В файле o.html_wrap.js, строка 225-227 уже есть вызов функции перерисовки
		// предлагаю убрать строки 225-227 и ниже приведенный код в строках 230-233
		// рассматривать как отладочный (т.е не нужный в рабочей выпуске сайта)
		//		window.setInterval(function() {
		//			RandomValue( varList );	// Шумим значением параметров
		//			redraw_Main();			// перерисовка секций видеокадра
		//		}, UpdateCircle);			// var UpdateCircle = 5000; // цикл перерисовки секций видеокадра
	}

} // initDynamicSHC

/** Запрос динамических данных
 * ********************************************************* */
/*
function getDynamicSHC() {
}
*/

/** Передача команды
 * 
 * @param {string} cmd - text of SS command to send
 * 
 * Например:
 * 
 * cmd = 'set wOCB1L2420X.u_Status=256'
 * cmd = 'set wOCB1T2533S.u_ValueB=999'
 * cmd = 'set wOCB1T2533O.u_ValueO=0'
 * 
 * ********************************************************* */
function SendSignalSim(cmd) {
	console.log(cmd);
	if (!debugValStat) {
		simServer.send(cmd);
	}
};

var CODE_RAISEOUT = 1;	// OutPointName — (up triangle) Raises the process outputs or the process set points
var CODE_LOWEROUT = 2;	// OutPointName — (down triangle) Lowers the process outputs or the process set points

var CODE_UPSET = 4;	// SetPointName — (up arrow) Raises the set point
var CODE_DOWNSET = 8;	// SetPointName — (down arrow) Lowers the set point

var CODE_AUTO = 16;	// OutPointName — enables the automatic control mode; that is, the process will now be controlled by the algorithms in the Controller
var CODE_MANUAL = 32;	// OutPointName — enables the manual control mode; that is, the user (not the Controller algorithms) controls the process

var CODE_DIGITON = 64;	// SetPointName — (start/open/trip) Starts a pump or motor, opens a valve, or trips a breaker
var CODE_DIGITOFF = 128;	// SetPointName — (stop/close/reset) Stops a pump or motor, closes a valve, or resets a breaker

var CODE_CNTRLBITS = [128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];

var MA_COMCAS = 65536;
var MA_COMSUP = 131072;

/**  RAISEOUT повышает выходное значение конкретного алгоритма
 * (up triangle) Raises the process outputs or the process set points
 */
function RAISEOUT(btn_up) {
	var sendMsg = "set w" + CNTRL_PANEL.OutPointName + '.u_Status=' + CODE_RAISEOUT;

	// btn_up = false - Нажатие кнопки
	if (!btn_up) { SendSignalSim(sendMsg); if (debugValStat) console.log("RAISEOUT> " + sendMsg); }

	// btn_up = true  - Отпускание кнопки
	if (btn_up) {
		sendMsg = "set w" + CNTRL_PANEL.OutPointName + '.u_Status=0';
		SendSignalSim(sendMsg); if (debugValStat) console.log("RAISEOUT> " + sendMsg);
	}
};

/** LOWEROUT понижает выходное значение конкретного алгоритма
 * (down triangle) Lowers the process outputs or the process set points
 */
function LOWEROUT(btn_up) {
	var sendMsg = "set w" + CNTRL_PANEL.OutPointName + '.u_Status=' + CODE_LOWEROUT;

	// btn_up = false - Нажатие кнопки
	if (!btn_up) { SendSignalSim(sendMsg); if (debugValStat) console.log("LOWEROUT> " + sendMsg); }

	// btn_up = true  - Отпускание кнопки
	if (btn_up) {
		sendMsg = "set w" + CNTRL_PANEL.OutPointName + '.u_Status=0';
		SendSignalSim(sendMsg); if (debugValStat) console.log("LOWEROUT> " + sendMsg);
	}
};

/** UPSET повышает уровень установочной точки переменной процесса конкретного алгоритмом управления
 * (up arrow) Raises the set point
 */
function UPSET(btn_up) {
	var sendMsg = "set w" + CNTRL_PANEL.SetPointName + '.u_Status=' + CODE_UPSET;

	// btn_up = false - Нажатие кнопки
	if (!btn_up) { SendSignalSim(sendMsg); if (debugValStat) console.log("UPSET> " + sendMsg); }

	// btn_up = true  - Отпускание кнопки
	if (btn_up) {
		sendMsg = "set w" + CNTRL_PANEL.SetPointName + '.u_Status=0';
		SendSignalSim(sendMsg); if (debugValStat) console.log("UPSET> " + sendMsg);
	}
};

/** DOWNSET понижает уровень установочной точки переменной процесса конкретного алгоритмом управления
 * (down arrow) Lowers the set point
 */
function DOWNSET(btn_up) {
	var sendMsg = "set w" + CNTRL_PANEL.SetPointName + '.u_Status=' + CODE_DOWNSET;

	// btn_up = false - Нажатие кнопки
	if (!btn_up) SendSignalSim(sendMsg); { if (debugValStat) console.log("DOWNSET> " + sendMsg); }

	// btn_up = true  - Отпускание кнопки
	if (btn_up) {
		sendMsg = "set w" + CNTRL_PANEL.SetPointName + '.u_Status=0';
		SendSignalSim(sendMsg); if (debugValStat) console.log("DOWNSET> " + sendMsg);
	}
};

/** AUTO вызывает перевод конкретного алгоритма управления в режим AUTO (автоматический)
 * Enables the automatic control mode; that is, the process will now be controlled by the algorithms in the Controller
 */
function AUTO() {
	var sendMsg = "set w" + CNTRL_PANEL.OutPointName + '.u_Status=' + CODE_AUTO;
	SendSignalSim(sendMsg); if (debugValStat) console.log("AUTO> " + sendMsg);
};

/** MANUAL вызывает перевод конкретного алгоритма управления в режим MANUAL (ручной)
 * Enables the manual control mode; that is, the user (not the Controller algorithms) controls the process
 */
function MANUAL() {
	var sendMsg = "set w" + CNTRL_PANEL.OutPointName + '.u_Status=' + CODE_MANUAL;
	SendSignalSim(sendMsg); if (debugValStat) console.log("MANUAL> " + sendMsg);
};

/** DIGITON активизирует функцию START/OPEN/TRIP (запускать/открывать/обходить)
 * (start/open/trip) Starts a pump or motor, opens a valve, or trips a breaker
 */
function DIGITON() {
	var sendMsg = "set w" + CNTRL_PANEL.SetPointName + '.u_Status=' + CODE_DIGITON;
	SendSignalSim(sendMsg); if (debugValStat) console.log("DIGITON> " + sendMsg);
};

/** DIGITOFF активизирует функцию STOP/CLOSE/RESET (запускать/закрывать/переустанавливать)
 * (stop/close/reset) Stops a pump or motor, closes a valve, or resets a breaker
 */
function DIGITOFF() {
	var sendMsg = "set w" + CNTRL_PANEL.SetPointName + '.u_Status=' + CODE_DIGITOFF;
	SendSignalSim(sendMsg); if (debugValStat) console.log("DIGITOFF> " + sendMsg);
};

/** CNTRLBITS активизирует функции P-кнопки операторской станции для сопряжения с определенными алгоритмами управления
 * Activates the Operator Station P-Key functions to interface with certain control algorithms.
 */
function CNTRLBITS(_arg) {
	var num_of_args = _arg.length;
	for (let i = 0; i < num_of_args; i++) {
		var sendMsg = "set w" + CNTRL_PANEL.SetPointName + '.u_Status=' + CODE_CNTRLBITS[_arg[i]];
		SendSignalSim(sendMsg); if (debugValStat) console.log("CNTRLBITS> " + sendMsg);
	}
};

/**
* Параметры TPSC и BTSC используются для ограничения выходного значения алгоритма
* Установленные пределы шкалы (TPSC и BTSC) отражают приемлемый диапазон сигналов
*/
function ValidateSignalRange(signal, value) {
	if (isNumber(value)) {
		if (getRT(signal) == 191) {	// RT = LC = 191

			//
			// (OS) 01.06.2021
			//
			// В функции getAN (файл o.commands.js)
			// строка
			//    String(SHC["_" + pt_name]._AN).padEnd(16); - именно эти пробелы и приводили к ошибке
			// заменена на строку
			//    String(SHC["_" + pt_name]._AN);
			//

			var alg_name = getAN(signal);
			var TPSC = 100.0;	// max значение параметра
			var BTSC = 0.0;	// min значение параметра
/*
			if (alg_name.indexOf('FUNCTION') >= 0)
				TPSC = getT9(signal), BTSC = getU1(signal);
			else if (alg_name.indexOf('MASTATION') >= 0)
				TPSC = getR7(signal), BTSC = getR8(signal); 
			else if (alg_name.indexOf('SETPOINT') >= 0)
				TPSC = getR2(signal), BTSC = getR3(signal);
			else if (alg_name.indexOf('TRANSFER') >= 0)
				TPSC = getR5(signal), BTSC = getR6(signal);
*/			

			switch (alg_name) {
				case 'FUNCTION': TPSC = getT9(signal); BTSC = getU1(signal); break;
				case 'MASTATION': TPSC = getR7(signal); BTSC = getR8(signal); break;
				case 'SETPOINT': TPSC = getR2(signal); BTSC = getR3(signal); break;
				case 'TRANSFER': TPSC = getR5(signal); BTSC = getR6(signal); break;
			}

			// Если границы равны или верхняя (TPSC) меньше чем нижняя (BTSC),
			// то обходим проверку данных
			if ((TPSC - BTSC) <= 0)
				return true;

			// Проверка, являются ли данные допустимыми,
			// прежде чем использовать их в приложении
			if ((value >= BTSC) && (value <= TPSC))
				return true;
			else {
				// Необходимо реализовать "свой" alert !!!???
//				alert('Enter value = ' + value + '. Scale limits for signal range = ' + BTSC + ' (min) ... ' + TPSC + ' (max)');
//				console.error("Enter value = " + value + ". Scale limits for signal range = " + BTSC + " (min) ... " + TPSC + " (max)");
				AlertWinContainer.Open(value, BTSC, TPSC);
				return false;
			}

		}
	}
	return false;
};

/** XPID_DIGITAL_CTL_LOCK позволяет изменять значение установочной точки
 * и содержимое выходных полей алгоритма типа XPID
 * 
 * Для данной программы разрешены два формата. Простой формат требует одного
 * аргумента и позволяет переключать установочную точку/выход на заранее
 * определенное значение немедленно или с растяжением во времени на 20 секунд.
 * 
 * Если требуется изменение установочной точки, новое значение считывается из поля
 * ввода 1 в текущем отображаемом окне. Если требуется изменение выходного
 * значения, новое значение считывается из поля ввода 2 в текущем отображаемом окне.
 */
function XPID_DIGITAL_CTL_LOCK(_arg) {

	//	if (debugValStat) console.log("XPID_DIGITAL_CTL_LOCK(" + JSON.stringify(_arg) + ")");

	var num_of_args = _arg.length;

	switch (num_of_args) {
		case 1:		// Если num_of_args = 1, действительными значениями являются:
			switch (_arg[0]) {
				case 1: // изменение установочной точки без растяжения во времени (считывание значения из поля ввода 1 в окне).
					break;
				case 2: // изменение значения на выходе без растяжения во времени (считывание значения из поля ввода 2 в окне).
					break;
				case 3: // изменение установочной точки с 20-секундным растяжением во времени (считывание значения из поля ввода 1 в окне).
					break;
				case 4: // изменение значения на выходе с 20-секундным растяжением во времени (считывание значения из поля ввода 2 в окне).
					break;
			}
			break;
		case 5:
			switch (_arg[0]) {
				case 1: // изменение установочной точки (SetPointName)
					var ef_value = _arg[1];	// Номер поля ввода для значения SetPointName
					var si_value = _arg[2]; // всегда = 7 - Экранный индекс поля ввода для значения
					var ef_slew = _arg[3]; // всегда = 0 - Номер поля ввода для коэффициента растяжения во времени
					var si_slew = _arg[4]; // всегда = 1 - Экранный индекс поля ввода для коэффициента растяжения во времени

					var SetPointVal = EntryFieldData[ef_value] * 1;

					var sendMsg = "set w" + CNTRL_PANEL.SetPointName + '.u_ValueB = ' + SetPointVal;

					if (ValidateSignalRange(CNTRL_PANEL.SetPointName, Number(SetPointVal))) {
						SendSignalSim(sendMsg);	//if (debugValStat) console.log("XPID_DIGITAL_CTL> " + sendMsg);
						EntryFieldData[ef_value] = '';	// Очистить поле ввода
					} else {
						EntryFieldData[ef_value] = '';	// Очистить поле ввода
					}
					break;
				case 2: // изменение выходного значения (OutPointName)
					var ef_value = _arg[1];	// Номер поля ввода для значения OutPointName
					var si_value = _arg[2]; // всегда = 7 - Экранный индекс поля ввода для значения
					var ef_slew = _arg[3]; // всегда = 0 - Номер поля ввода для коэффициента растяжения во времени
					var si_slew = _arg[4]; // всегда = 1 - Экранный индекс поля ввода для коэффициента растяжения во времени

					var OutPointVal = EntryFieldData[ef_value] * 1;

					var sendMsg = "set w" + CNTRL_PANEL.OutPointName + '.u_ValueO = ' + OutPointVal;

					if (ValidateSignalRange(CNTRL_PANEL.OutPointName, Number(OutPointVal))) {
						SendSignalSim(sendMsg);	//if (debugValStat) console.log("XPID_DIGITAL_CTL> " + sendMsg);
						EntryFieldData[ef_value] = '';	// Очистить поле ввода
					} else {
						EntryFieldData[ef_value] = '';	// Очистить поле ввода
					}
					break;
			}
			break;
	} // switch
}; // XPID_DIGITAL_CTL_LOCK

/** XPID_DIGITAL (121) позволяет изменять значение установочной точки
 * и содержимое выходных полей алгоритма типа XPID
 * 
 * Для данной программы разрешены два формата. Простой формат требует одного
 * аргумента и позволяет переключать установочную точку/выход на заранее
 * определенное значение немедленно или с растяжением во времени на 20 секунд.
 * 
 * Если требуется изменение установочной точки, новое значение считывается из поля
 * ввода 1 в текущем отображаемом окне. Если требуется изменение выходного
 * значения, новое значение считывается из поля ввода 2 в текущем отображаемом окне.
 *
 * XPID_DIGITAL          - [{prog:121,diag:0,arg:[1,4,7,0,1]},{prog:122,diag:0,arg:[7,25]}]);
 * XPID_DIGITAL_CTL_LOCK - [{prog:221,diag:0,arg:[2,5,7,0,1]},{prog:122,diag:0,arg:[7,26]}]);
 *
 */
function XPID_DIGITAL(_arg) {

	if (debugValStat) console.log("XPID_DIGITAL(" + JSON.stringify(_arg) + ")");

	var num_of_args = _arg.length;

	switch (num_of_args) {
		case 1:		// Если num_of_args = 1, действительными значениями являются:
			switch (_arg[0]) {
				case 1: // изменение установочной точки без растяжения во времени (считывание значения из поля ввода 1 в окне).
					break;
				case 2: // изменение значения на выходе без растяжения во времени (считывание значения из поля ввода 2 в окне).
					break;
				case 3: // изменение установочной точки с 20-секундным растяжением во времени (считывание значения из поля ввода 1 в окне).
					break;
				case 4: // изменение значения на выходе с 20-секундным растяжением во времени (считывание значения из поля ввода 2 в окне).
					break;
			}
			break;
		case 5:
			switch (_arg[0]) {
				case 1: // изменение установочной точки (SetPointName)
					var ef_value = _arg[1];	// Номер поля ввода для значения SetPointName
					var si_value = _arg[2]; // всегда = 7 - Экранный индекс поля ввода для значения
					var ef_slew = _arg[3]; // всегда = 0 - Номер поля ввода для коэффициента растяжения во времени
					var si_slew = _arg[4]; // всегда = 1 - Экранный индекс поля ввода для коэффициента растяжения во времени

					var SetPointVal = EntryFieldData[ef_value] * 1;

					var sendMsg = "set w" + CNTRL_PANEL.SetPointName + '.u_ValueB = ' + SetPointVal;

					if (ValidateSignalRange(CNTRL_PANEL.SetPointName, Number(SetPointVal))) {
						SendSignalSim(sendMsg);	//if (debugValStat) console.log("XPID_DIGITAL_CTL> " + sendMsg);
						EntryFieldData[ef_value] = '';	// Очистить поле ввода
					} else {
						EntryFieldData[ef_value] = '';	// Очистить поле ввода
					}
					break;
				case 2: // изменение выходного значения (OutPointName)
					var ef_value = _arg[1];	// Номер поля ввода для значения OutPointName
					var si_value = _arg[2]; // всегда = 7 - Экранный индекс поля ввода для значения
					var ef_slew = _arg[3]; // всегда = 0 - Номер поля ввода для коэффициента растяжения во времени
					var si_slew = _arg[4]; // всегда = 1 - Экранный индекс поля ввода для коэффициента растяжения во времени

					var OutPointVal = EntryFieldData[ef_value] * 1;

					var sendMsg = "set w" + CNTRL_PANEL.OutPointName + '.u_ValueO = ' + OutPointVal;

					if (ValidateSignalRange(CNTRL_PANEL.OutPointName, Number(OutPointVal))) {
						SendSignalSim(sendMsg);	//if (debugValStat) console.log("XPID_DIGITAL_CTL> " + sendMsg);
						EntryFieldData[ef_value] = '';	// Очистить поле ввода
					} else {
						EntryFieldData[ef_value] = '';	// Очистить поле ввода
					}
					break;
			}
			break;
	} // switch
}; // XPID_DIGITAL
