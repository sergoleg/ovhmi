"use strict";

/** !!! Не забыть убрать при интеграции с SIM !!!
 * ********************************************************* */
//var debugValStat = false;
var debugValStat = true;

/** Иммитация динамических полей
 * ********************************************************* */
function getRandomFloat(min, max) { return Math.random() * (max - min) + min; }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min)) + min; }

/** S.O. Communication API globals
* ********************************************************** */
var OvationVarList = [];	// список подписываемых SIM параметров (имена Ovation)
var simServerVarList = [];	// список подписываемых SIM параметров (имена SimServer.exe)
var counter_onServerData = null;
var AckAlarmQueue = [];		// FIFO with acknowledge alarm point name

//var simServer = null;
//var subscription = null;

/**
 * Подписываемся на получение динамических данных от SimServer.exe
 * Инициализировать прием динамических полей параметров от симулятора
 *
 * вызывается из модуля o.main_ssw.js из функции DrawDiag()
 *
 * ********************************************************* */
function subscribeSimServer(page) {
	OvationVarList = [];
	simServerVarList = [];

	// Первая инициализация динамических полей и создание списка подписываемых SIM параметров
	for (name in SHC) {
		let point = SHC[name];
		let spd = point._PN;
		let varName = ('w' + spd).toString().replace(/-OUT$/gi, ".o_OUT");
		let RT = getRT(spd);
		switch (RT) {
			case 91:	// Аналоговый параметр (RT=91)
				setAV(spd, 0);	// AV - Analog Value Word

				set1W(spd, _1W_TIMED_OUT);	// 1W - Первое упакованное состояние

				set2W(spd, 0);	// 2W - Второе упакованное состояние
				set3W(spd, 0);	// 3W - Третье упакованное состояние
				opp_analog_inject(spd, counter_onServerData++, NaN, NaN);
				simServerVarList.push(varName);	OvationVarList.push(spd);
				break;
			case 141:	// Дискретный параметр (RT=141)
				set1W(spd, _1W_TIMED_OUT);	// 1W - Первое упакованное состояние

				set2W(spd, 0);	// 2W - Второе упакованное состояние
				set3W(spd, 0);	// 3W - Третье упакованное состояние
				opp_digital_inject(spd, counter_onServerData++, NaN, NaN);
				simServerVarList.push(varName);	OvationVarList.push(spd);
				break;
			case 226:	// Упакованный параметр (RT=226)
				set1W(spd, _1W_TIMED_OUT);	// 1W - Первое упакованное состояние

				set2W(spd, 0);	// 2W - Второе упакованное состояние
				set3W(spd, 0);	// 3W - Третье упакованное состояние
				setA2(spd, 0);																						// A2 - Текущие разряды с дискретным значением
				setA3(spd, 0);																						// A3 - Разряды недействительности
				set1W(spd, opp_modify_bit_values(0, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN));	// 1W - Первое упакованное состояние
				simServerVarList.push(varName);	OvationVarList.push(spd);
				break;
			case 6:		// Параметр устройства системы Ovation (RT=6)
				setFA(spd, _1W_TIMED_OUT);	// FA - Слово состояния 1 функционального процессора

				simServerVarList.push(varName);	OvationVarList.push(spd);
				break;
			case 191:	// Параметр алгоритма (RT=191)
				simServerVarList.push(varName);	OvationVarList.push(spd);
				break;
			case 0:		// Параметр не описананный в базе точек Ovation
				setAV(spd, 0);	// AV - Analog Value Word

				set1W(spd, _1W_BAD_QUALITY + _1W_TIMED_OUT);	// 1W - Первое упакованное состояние

				set2W(spd, 0);		// 2W - Второе упакованное состояние
				set3W(spd, 0);		// 3W - Третье упакованное состояние

				setA2(spd, 0);	// A2 - Текущие разряды с дискретным значением
				setA3(spd, 0);	// A3 - Разряды недействительности

				setFA(spd, 0);	// FA - Слово состояния 1 функционального процессора

				simServerVarList.push(varName);	OvationVarList.push(spd);
				break;
		} // switch

	} // for

	SimServerWS.subscribe( { pageId: page, varList: simServerVarList } );
} // subscribeSimServer

/**
 * Отписываемся от получение динамических данных от SimServer.exe
 *
 * вызывается из модуля o.main_ssw.js из функции DrawDiag()
 *
 * ********************************************************* */
function unsubscribeSimServer(page) {
	SimServerWS.unsubscribe(page);
};

/**
 * Принять динамические поля параметров от симулятора
 *
 * вызывается из модуля o.main_ssw.js из функции DrawDiag()
 *
 * ********************************************************* */
function get_subscribeSimServer(page) {

	let counter = counter_onServerData++;

	// Выполнить запланированное квитирование (подтверждение) сигнализации
//	pred_perform_schedule_acknowledge_alarm(counter);

	var dynamic = SimServerWS.getSubscribe();

	for (let i in dynamic.varValue) {
		let pt_name = OvationVarList[i];

		let value = dynamic.varValue[i];

		let status = get1W(pt_name);

		let RecordTypeNumber = getRT(pt_name);

		if (value === null) {
			switch (RecordTypeNumber) {
				// Параметр не описананный в базе точек Ovation
				case   0:
					set1W(pt_name, _1W_BAD_QUALITY + _1W_TIMED_OUT);	// 1W - Первое упакованное состояние
					break;
				// Аналоговый параметр
				case 91:	opp_analog_inject(pt_name, counter, NaN, false);	break;
				// Дискретный параметр
				case 141:	opp_digital_inject(pt_name, counter, NaN, false);	break;
				// Упакованный параметр
				case 226:
					//setA2(spd, 0);																						// A2 - Текущие разряды с дискретным значением
					//setA3(spd, 0);																						// A3 - Разряды недействительности
					set1W(pt_name, opp_modify_bit_values(0, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['HDWRFAIL'].PATTERN));	// 1W - Первое упакованное состояние
					//set2W(spd, 0);																						// 2W - Второе упакованное состояние
					//set3W(spd, 0);																						// 3W - Третье упакованное состояние
																				break;
				// Параметр устройства системы Ovation
				case 6:															break;
				// Параметр алгоритма
				case 191:														break;
				default:														break;
			}
		} else {
			//status = status | STATUSWORD['GOOD'].PATTERN;
			//set1W(pt_name, status);
			switch (RecordTypeNumber) {
				// Параметр не описананный в базе точек Ovation
				case   0:
					set1W(pt_name, _1W_BAD_QUALITY + _1W_TIMED_OUT);	// 1W - Первое упакованное состояние
					break;
				// Аналоговый параметр
				case 91:	opp_analog_inject(pt_name, counter, Number(value), true);	break;
				// Дискретный параметр
				case 141:	opp_digital_inject(pt_name, counter, Number(value), true);	break;
				// Упакованный параметр
				case 226:
					setA2(pt_name, Number(value));																			// A2 - Текущие разряды с дискретным значением
					//setA3(spd, 0);																						// A3 - Разряды недействительности
					set1W(pt_name, opp_modify_bit_values(0, STATUSWORD['HDWRFAIL'].MASK, STATUSWORD['NORMAL'].PATTERN));	// 1W - Первое упакованное состояние
					//set2W(spd, 0);																						// 2W - Второе упакованное состояние
					//set3W(spd, 0);																						// 3W - Третье упакованное состояние
																						break;
				// Параметр устройства системы Ovation
				case 6:																	break;
				// Параметр алгоритма
				case 191:																break;
				default:																break;
			}
		}
	} // for

	// Выполнить запланированное квитирование (подтверждение) сигнализации
	perform_schedule_acknowledge_alarm(counter);

}; // get_subscribeSimServer

/**
 * Запланировать квитирование (подтверждение) сигнализации
 *
 * вызывается из модуля o.commands.js из функции ALARM_ACKNOWLEDGE()
 *
 * ********************************************************* */
function schedule_acknowledge_alarm(pnt_name) {
	AckAlarmQueue.push(pnt_name);		// add pnt_name to acknowledge alarm queue
};

/**
 * Выполнить запланированное квитирование (подтверждение) сигнализации
 *
 * вызывается из функции get_subscribeSimServer()
 *
 * ********************************************************* */
function perform_schedule_acknowledge_alarm(counter) {
	while (AckAlarmQueue.length) {
		let pnt_name = AckAlarmQueue.shift();
		opp_acknowledge_alarm(pnt_name);	// Квитировать (подтвердить) сигнализацию
	}
};

function pred_perform_schedule_acknowledge_alarm(counter) {
	for (let i = 0; i < AckAlarmQueue.length; i++) {
		let pnt_name = AckAlarmQueue[i];
		opp_acknowledge_alarm(pnt_name);	// Квитировать (подтвердить) сигнализацию
	}
};

//---------------------------------------------------------------------------------- 
// 
// Example:
// 
// Command>client all object qwerty:15
//    hilight object by text: qwerty:15
// 
// Command>client all page 3060
//    navigate to page:3060
// 
function handleServerAction(args) {

	// Получить объект параметров приложения Ovation из URL
	QueryArgs = getUrlQueryArgs();

	if (args.action.lastIndexOf('page') == 0) {

		let _diag_num = args.action.slice(5).replace(/\x00/, '');
		let _group_num = 0;				// server action don't know PDSGroup 

		_diag_num = +_diag_num;
		_group_num = +_group_num;
		if (QueryArgs.diag != _diag_num || QueryArgs.group != _group_num) {	// do not use !==, because of "3020" equals to 3020
			QueryArgs.diag = _diag_num;
			QueryArgs.group = _group_num;

			// Сброс хайлайтера при смене диаграммы по команде сервера
			QueryArgs.htext = '';		// ключевой текст текстовыделителя
			QueryArgs.hnumb = 1;		// требуемый номер вхождения, по умолчанию - первый найденный объект

			// Обновить URL приложения Ovation из объекта
			setUrlQueryArgs(QueryArgs);
			LoadingBarGraphics.show();

			console.log('navigate to page: [' + _diag_num + ']');
		}

	} else if (args.action.lastIndexOf('object') == 0) {

		let objectId = args.action.slice(7).replace(/\x00/, '');

		// objectId = htext[:hnumb]
		let argList = objectId.split(':');

		// Установка хайлайтера
		QueryArgs.htext = argList[0];	// ключевой текст текстовыделителя

		// Требуемый номер вхождения, по умолчанию - первый найденный объект
		QueryArgs.hnumb = typeof argList[1] !== 'undefined' ? (argList[1] * 1) : 1;
		QueryArgs.hnumb = isNumber(QueryArgs.hnumb) ? QueryArgs.hnumb : 1;

		// Обновить URL приложения Ovation из объекта
		setUrlQueryArgs(QueryArgs);

		console.log('hilight object by text: [' + QueryArgs.htext + ']:[' + QueryArgs.hnumb + ']');

	} else {

		console.log('future action: [' + args.action.replace(/\x00/, '') + ']');

	}
};

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
		SimServerWS.send(cmd);
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
