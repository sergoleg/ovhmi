// Глобальные переменные
// ==================================================
var app;					// Приложение

var MainContainer;			// Контейнер для всей графики, всплывающих подсказок и текстовыделителя

var ToolTipContainer;		// Контейнер всплывающих подсказок
var HighLighterGraphics;	// Графика текстовыделителя
var BlinkerGraphics;		// Графика аварийных сингалов
var LoadingBarGraphics;		// Графика бара загрузки

//var MainGraphics;			// Графика главного окна диаграммы
var MainWinContainer;

var PopUpWinContainer;		// Графика всплывающего окна диаграммы
var AlertWinContainer;		// Графика alert окна диаграммы

var paper = [];				// Массив графических примитивов для главного и всплывающих окон
var blink_paper = [];		// Массив графических примитивов для главного и всплывающих окон
var WINDOW_diag;			// Перегружаемый функционал видеокадра
var startTime, endTime;		// Временные метки для расчета производительности рендеринга

var OvVerbose = false;		// Используем в GTime и вывода производительности рендеринга

var oldQueryArgs = {		// Предыдущие параметры страницы
	url: '',
	diag: 0,	// номер видеокадра
	group: 0,	// номер группы параметров
	htext: '',	// ключевой текст текстовыделителя
	hnumb: 0		// требуемый номер вхождения, по умолчанию - первый найденный объект
};

var QueryArgs = {			// Текущие параметры страницы
	url: '',
	diag: 0,	// номер видеокадра
	group: 0,	// номер группы параметров
	htext: '',	// ключевой текст текстовыделителя
	hnumb: 0		// требуемый номер вхождения, по умолчанию - первый найденный объект
};

var diagLoad;				// Загрузка функционала видеокадра
var groupLoad;				// Загрузка группы параметров

// Установочные (конфигурационные) переменные для mainLoop
// Вспомагательные переменные для mainLoop
// ==================================================
var maxFPS = 1.1;			// Максимальный FPS, который мы хотим разрешить (1.1 ~~ 909 ms)
var lastFrameTimeMs = 0;	// Последний раз цикл запускался
var delta = 0;				// Дельта времени с последнего кадра
var timestep = 1000 / maxFPS;
var frameID = 0;			// Идентификатор кадра, который мы можем передать функции отмены cancelAnimationFrame()
var running = false;
var started = false;

/**
 * Подробное объяснение игровых циклов JavaScript и времени
 * 
 * https://isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing
 */

/**
 * Запуск игрового цикла
 */
function start_mainLoop() {
	if (!started) { // не запускать если уже запущено
		started = true;
		// aктивная рамка, чтобы получить правильные метки времени и начальный видеокадр
		frameID = requestAnimationFrame(function (timestamp) {
			//InitialDraw(1);	// начальный видеокадр
			running = true;
			// cбросить некоторые переменные отслеживания времени
			lastFrameTimeMs = timestamp;
			lastFpsUpdate = timestamp;
			framesThisSecond = 0;
			// На самом деле начать основной цикл
			frameID = requestAnimationFrame(mainLoop);
		});
	}
}

/**
 * Начальный кадр
 */
//function InitialDraw() {}


/**
 * Остановка (приостановка) игрового цикла
 */
function stop_mainLoop() {
	running = false;
	started = false;
	cancelAnimationFrame(frameID);
}

/**
 * Игровой цикл
 */
function mainLoop(timestamp) {

	LoadingBarGraphics.update();
	HighLighterGraphics.update();
	BlinkerGraphics.update();

	// Дросселируем частоту кадров    
	if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {	// Обновлять каждую секунду (при maxFPS = 1)
		frameID = requestAnimationFrame(mainLoop);
		return;
	}
	delta += timestamp - lastFrameTimeMs; // get the delta time since last frame
	//console.log('delta', delta.toFixed(0), 'ms');

	lastFrameTimeMs = timestamp;
	//console.log('lastFrameTimeMs', lastFrameTimeMs.toFixed(0));

	// Нам нужен путь эвакуации
	// Добавим проверку работоспособности в цикл обновления
	var numUpdateSteps = 0;
	while (delta >= timestep) {
		Update(timestep);	// !!!
		delta -= timestep;
		if (++numUpdateSteps >= 240) {
			Panic();	// Путь эвакуации
			break;
		}
	}

	DrawDiag();	// !!!

	frameID = requestAnimationFrame(mainLoop);
}

/**
 * Анализ ожиданий
 * Перезагрузка скриптов
 * ...
 */
function Update(delta) {
	//console.log('Update delta', delta.toFixed(0));
}

/**
 * Путь эвакуации при не работоспособности
 */
function Panic() {
	//console.log('Panic');
	delta = 0;	// Отбросить неимитированное время
}

/**************************************************
 * Главная процедура игрового цикла
 **************************************************/
function DrawDiag() {
	{	// удалить все графические объекты главного окна диаграммы
		// =======================================================
/*		MainGraphics.children.forEach(function (data) {
			if (data.isSprite) {
				data.destroy({ children: true, texture: true, baseTexture: true });
			} else {
				data.clear();
				data.geometry.dispose();
			}
			data.removeChildren();
			MainGraphics.parent.removeChild(data);
		});
		MainGraphics.removeChildren();
*/	}	// =======================================================

	{	// Анализ Текущих и Предыдущих параметров страницы
		// =======================================================
		QueryArgs = getUrlQueryArgs();

		// Сверим 2 объекта
		if (!deepEqual(oldQueryArgs, QueryArgs)) {

			if (oldQueryArgs.diag != QueryArgs.diag) {

				// Отписываемся от получение динамических данных от SimServer.exe
				unsubscribeSimServer(oldQueryArgs.diag);

				PopUpWinContainer.Hide();	// flag_init_PopUp = false;
				LoadingBarGraphics.show();

				// Загрузка функционала видеокадра
				if (simServer) {
					diagLoad = loadScript('api/mmi/' + projectName + '/ovation/diag/' + QueryArgs.diag + '.min.diag');
				} else {
					diagLoad = loadScript('./diag/' + QueryArgs.diag + '.min.diag');
				}
				diagLoad.then(function (result) {
					// Загрузка выполнена успешно
					console.log('Upload successful:', './diag/' + QueryArgs.diag + '.min.diag');
					page = QueryArgs.diag; /// L.A. (08_28_2020)
				}, function (e) {
					console.log('Error load:', './diag/' + QueryArgs.diag + '.min.diag');
					console.error(e);
				}).then(function () {
					// Загрузка завершена
					console.log('Loading is complete:', './diag/' + QueryArgs.diag + '.min.diag');
					setPDSPoints();
					// Подписываемся на получение динамических данных от SimServer.exe
					// Инициализировать прием динамических полей параметров от симулятора
					if (QueryArgs.group == 0) {
						//initDynamicSHC();
						subscribeSimServer(QueryArgs.diag);
					}
				});
			}

			if ((oldQueryArgs.group != QueryArgs.group) && (QueryArgs.group != 0)) {
				PopUpWinContainer.Hide();	// flag_init_PopUp = false;

				// Загрузка группы параметров
				if (simServer) {
					groupLoad = loadScript('api/mmi/' + projectName + '/ovation/group/' + QueryArgs.group + '.group');
				} else {
					groupLoad = loadScript('./group/' + QueryArgs.group + '.group');
				}
				groupLoad.then(function (result) {
					// Загрузка выполнена успешно
					//console.log('Upload successful:',  './group/' + QueryArgs.group + '.group');
					//setPDSGroup();
				}, function (e) {
					console.log('Error load:', './group/' + QueryArgs.group + '.group');
					console.error(e);
				}).then(function () {
					// Загрузка завершена
					console.log('Loading is complete:', './group/' + QueryArgs.group + '.group');
					setPDSGroup();
					// Подписываемся на получение динамических данных от SimServer.exe
					// Инициализировать прием динамических полей параметров от симулятора
					//initDynamicSHC();
					subscribeSimServer(QueryArgs.diag);
				});
			}

			//if ((oldQueryArgs.htext != QueryArgs.htext) || (oldQueryArgs.hnumb != QueryArgs.hnumb)) {
			//	HighLighterGraphics.set_search(QueryArgs.htext + '', QueryArgs.hnumb * 1);
			//}

			// Поверхностное копирование
			oldQueryArgs = Object.assign({}, QueryArgs);
		}

		// При каждом обновлении вызываем set_search() и сбрасываем порядковый номер (счетчик) вхождения
		HighLighterGraphics.set_search(QueryArgs.htext + '', QueryArgs.hnumb * 1);

	}	// ===============================================

	// начало подготовки контента
	beginLoop();

	// вписать сцену в окно
	AppStageScale();

	// Принять динамические поля параметров от симулятора
	get_subscribeSimServer(QueryArgs.diag);

	// Главное окно
	// ==================================================
	if (typeof MAIN_diag !== 'undefined') {
		clearArray(paper);
		clearArray(blink_paper);
		// подготовить массив дисплейных объектов всех секций главного окона видеокадра
		MAIN_diag.DIAGRAM();
		MAIN_diag.BACKGROUND();
		MAIN_diag.FOREGROUND();
		MAIN_diag.KEYBOARD();

		// добавить массив дисплейных объектов к главному окону
//		for (var el in paper) {
//			MainGraphics.addChild(paper[el]);
//		}

//		MainWinContainer.Delete(); не работает
//		MainWinContainer.Hide();
//		MainWinContainer.setPaper(paper);
		MainWinContainer.setParam(
			fld_MAIN_DIAG.diag_num + ' - "' + fld_MAIN_DIAG.diag_title + '"',
//			fld_MAIN_DIAG.x, fld_MAIN_DIAG.y,
			0, 0,
			fld_MAIN_DIAG.background,
			paper);
		MainWinContainer.Open();

		BlinkerGraphics.clear();
		for (var obj in blink_paper) {
			BlinkerGraphics.push(blink_paper[obj]);
		}
	}

	// PopUp окно
	// ==================================================
	if (flag_init_PopUp) {
		if (typeof WINDOW_diag !== 'undefined') {
			LINEWIDTHS = LINEWIDTHS_v3;
			clearArray(paper);
			clearArray(blink_paper);
			// подготовить массив дисплейных объектов всех секций PopUp окна видеокадра
			//WINDOW_diag.DIAGRAM();
			{	// Отрисовка фона PopUp
				let d = new PIXI.Graphics();
				d.beginFill(WINDOW_diag.background, 1)
				d.lineStyle(1, WINDOW_diag.background);
				d.drawRect(WINDOW_diag.x_extents, WINDOW_diag.y_extents, WINDOW_diag.w_extents, WINDOW_diag.h_extents);
				d.endFill();
				paper.push(d);
			}
			WINDOW_diag.BACKGROUND();
			WINDOW_diag.FOREGROUND();
			WINDOW_diag.KEYBOARD();
			// добавить массив дисплейных объектов к главному окону
			for (var obj in blink_paper) {
				paper.push(blink_paper[obj]);
			}
			PopUpWinContainer.setPaper(paper);
			PopUpWinContainer.Open();
			LINEWIDTHS = LINEWIDTHS_v1;

			update_counter_PopUp = update_counter_PopUp + 1;	// счетчик обновлений текущего pop-pup окна
			//			console.log('Счетчик обновлений текущего pop-pup окна', update_counter_PopUp);

		}
	}

	// вписать сцену в окно
//	AppStageScale();
	if (typeof MAIN_diag !== 'undefined') LoadingBarGraphics.hide();

	// конец подготовки контента
	endLoop();

} /** DrawDiag */











/**
 * Сверить 2 объекта одной строчкой
 * 
 * Поверхностное сравнение
 */
function deepEqual(obj1, obj2) {
	return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Хороший пример, как надо делать
 */
/*
function compareObj (obj1, obj2) {
	// Цикл через свойства объекта obj1
	for (var p in obj1) {
		//Проверка на то, что оба объекта существуют
		if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p))
			return false;

		switch (typeof (obj1[p])) {
		// Глубокое сравнение объектов по ключам и значения:
		case 'object':
			if (!Object.compare(obj1[p], obj2[p])) return false;
			break;
		// Сравнение данных типа function:
		case 'function':
			if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
			break;
		// Сравнение значений:
		default:
			if (obj1[p] != obj2[p]) return false;
		}
	}

	// Проверка объекта obj2 на дополнительные свойства:
	for (var p in obj2) {
		if (typeof (obj1[p]) == 'undefined') return false;
	}
	return true;
}
*/

/**
 * Получить объект параметров приложения HMIOvation из URL
 * 
 * <pre>
 * 
 * 1 - адрес страницы HMIOvation
 * 2 - номер видеокадра,
 *     по умолчанию = 1000 - стартовый видеокадр
 * 3 - номер группы параметров,
 *     по умолчанию = 0 - фиктивная группа
 * 4 - ключевой текст текстовыделителя (хайлайтера),
 *     по умолчанию = "" - текст не задан
 * 5 - требуемый номер вхождения ключевого текста текстовыделителя,
 *     по умолчанию = 1 - первый найденный объект
 * 
 *  file:///Ovation_test.html?diag=7777&group=8888&htext=%22qwerty%22&hnumb=9999
 * +-------------1-----------+----2----+----3-----+---------4--------+-----5----+
 * 
 * </pre>
 */
function getUrlQueryArgs() {

	var params = window.location.search.replace('?', '').split('&').reduce(
		function (p, e) {
			var a = e.split('=');
			p[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
			return p;
		}, {});
	//save V2 parameters that do not related to ovation HMI.
	let webAppParameters = {};
	for (let pName in params) {
		switch (pName) {
			case 'diag':
			case 'group':
			case 'htext':
			case 'hnumb': {
				//ignore, it is ovation parameters.
				break;
			}
			default: {
				webAppParameters[pName] = params[pName];
			}
		}
	}
	var obj = {
		url: window.location.href.toString().split('?')[0],						// адрес страницы HMIOvation
		diag: typeof params['diag'] !== 'undefined' ? params['diag'] :
			(window["welcomeMmiFileName"] ? window["welcomeMmiFileName"] : 1000),// номер видеокадра
		group: typeof params['group'] !== 'undefined' ? params['group'] : 0,	// номер группы параметров
		htext: typeof params['htext'] !== 'undefined' ? params['htext'] : '',	// ключевой текст текстовыделителя
		hnumb: typeof params['hnumb'] !== 'undefined' ? params['hnumb'] : 1,		// требуемый номер вхождения, по умолчанию - первый найденный объект
		webAppParameters: webAppParameters
	};
	return obj;
}



/**
 * Обновить URL приложения HMIOvation из объекта
 */
function setUrlQueryArgs(obj) {
	var new_url = obj.url + '?';

	//add web app parameters that do not related to ovation HMI.
	if (obj.webAppParameters) {
		for (let pName in obj.webAppParameters) {
			new_url += pName + '=' + obj.webAppParameters[pName] + '&';
		}
	}

	new_url += 'diag=' + obj.diag;
	new_url += '&group=' + obj.group;
	new_url += '&htext=' + obj.htext + '';
	new_url += '&hnumb=' + obj.hnumb;

	if (window.history && window.history.pushState) {
		function doNavigate() {
			// Создать новый URL (объект, страницу) и сохранить старый URL в истории браузера
			// (т.е. нажатие кнопки "Назад" вернет старый URL)
			window.history.pushState({ path: new_url }, '', new_url);

			// Изменить текущий URL (объект, страницу) в истории браузера
			// (т.е. нажатие кнопки "Назад" не вернет старый URL)
			//		window.history.replaceState({ path: new_url }, '', new_url);
		}

//		doNavigate();


		{	// LA - добавлено при внедрении SimServerSocketAPI.js
		// unsubscribe before page closed
		if (!simServer)
			doNavigate()
		else 
			simServer.send(
				"CANCEL " + subscription.blockId, 
				function (re) {
					if (re.answer == 'OK') {
						i = this.websocket.Subscriptions.findIndex(_su_ => _su_.blockId === subscription.blockId);
						if (i > 0) this.websocket.Subscriptions.splice(i, 1);
					}
					doNavigate();
				}.bind(simServer)
			);			
		}	// LA - добавлено при внедрении SimServerSocketAPI.js

	}
}













/**
 * Инициализация сцены
 * https://github.com/lmgonzalves/images-gallery/blob/master/js/scripts.js
 */
function initializeStage() {

	app = new PIXI.Application({
		width: window.innerWidth,
		height: window.innerHeight,
		antialias: true,
		clearBeforeRender: true,	/*
									 * очищать холст или нет перед новым
									 * проходом рендеринга
									 */
		resizeTo: window,
		backgroundColor: 0x595959,
		view: document.querySelector('.diagram')
	});
	//document.body.appendChild(app.view);

	// Ограничить события мыши в контейнере
	// https://question-it.com/questions/688962/ogranichit-sobytija-myshi-v-kontejnere-pixijs
//	app.renderer.plugins.interaction.moveWhenInside = true;	мешает ресайзу поп-ап окна

	// Контейнер для всей графики, всплывающих подсказок и текстовыделителя
	MainContainer = new PIXI.Container();

	// Контейнер всплывающих подсказок
	ToolTipContainer = new Tooltip();

	// Контейнер текстовыделителя
	HighLighterGraphics = new Highlighter();

	// Графика бара загрузки
	LoadingBarGraphics = new LoadingBar();
	LoadingBarGraphics.show();

	// Графика главного окна диаграммы
	//MainGraphics = new PIXI.Graphics();
	//MainGraphics = new PIXI.Container();
	MainWinContainer = new Mainwin();

	// Контейнер аварийных сигналов
	BlinkerGraphics = new Blinker();

	// Графика всплывающего окна диаграммы
	PopUpWinContainer = new Modalwin();

	// Графика alert окна диаграммы
	AlertWinContainer = new AlertWin(); 

//	MainContainer.addChild(MainGraphics);
	MainContainer.addChild(MainWinContainer.container);

	MainContainer.addChild(BlinkerGraphics.container);				// BlinkerGraphics - так правильно
	MainContainer.addChild(PopUpWinContainer.container);

	MainContainer.addChild(AlertWinContainer.container);

	app.stage.addChild(MainContainer);

	// ToolTip и HighLighter добавляем в последнюю очередь !!!
	app.stage.addChild(ToolTipContainer.container);
	app.stage.addChild(HighLighterGraphics.graphics);
	//app.stage.addChild(BlinkerGraphics.container);				// BlinkerGraphics - так не правильно
	app.stage.addChild(LoadingBarGraphics.graphics);
}

/**
 * Временная метка начала рендеринга всей графики, всплывающих подсказок и текстовыделителя
 */
function beginLoop() {
	startTime = new Date();
}

/**
 * Временная метка окончания рендеринга всей графики, всплывающих подсказок и текстовыделителя
 */
function endLoop() {
	endTime = new Date();
	if (OvVerbose) {
		var timeDiff = endTime - startTime;
		console.log('preparation for rendering', timeDiff.toFixed(0), 'ms');
	}
}

/*
var p = new Promise(function(resolve, reject) {
	console.log('Начало асинхронной операции');

	someAsyncOperation(function(e, result) {
		if (e) {
			reject(e);
		} else {
			resolve(result);
		}
	});

}).then(function(result) {
	console.log('Асинхронная операция выполнена успешно');
}, function(e) {
	console.log('Асинхронная операция провалена');
	console.error(e);
}).then(function() {
	console.log('Асинхронная операция завершена!');
});

Для перезагрузки мы будем удалять существующий элемент script и добавлять в DOM новый,
причем к URL скрипта каждый раз будет добавляться текущее время — чтобы предотвратить кэширование.

function doReloadScript(scriptNode) {
	var oldSrcBase = scriptNode.src.split("?")[0],
		parent = scriptNode.parentNode,
		newNode = this.window.document.createElement("script");
	parent.removeChild(scriptNode);
	newNode.src = [oldSrcBase, new Date().getTime()].join('?');
	parent.appendChild(newNode);
},

*/

/**
 * Перезагрузка скрипта
 */
function loadScript(name) {
	return new Promise(function (resolve, reject) {
		var el = document.createElement("script");
		el.onload = resolve;
		el.onerror = reject;
		el.async = true;

		el.type = 'text/javascript';

		//el.src = './' + name + '.js';
		el.src = name;	// Это адрес скрипта, который мы загружаем
		el.setAttribute('src', name);
		// load the script
		//		document.getElementsByTagName('head')[0].appendChild(el); 
		document.getElementsByTagName('body')[0].appendChild(el);
	});
}

/**
 * Utilities
 */

/**
 * Load an object from the local storage by id
 */
function load(id, defaultValue) {
	if (typeof (localStorage) !== 'undefined' && localStorage.getItem(id) !== null) {
		return JSON.parse(localStorage.getItem(id));
	}
	return defaultValue;
}

/**
 * Save an object in the local storage providing an id
 */
function save(id, value) {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(id, String(value))
	}
}

/*******************************************************************************
 * Масштабирование сцены под размер окна
 * Вписать сцену в окно
 */
function AppStageScale() {
	const ovw = 16384; // width of the Ovation virtual window
	const ovh = 16384; // height of the Ovation virtual window
	const vpw = window.innerWidth; // width of the viewport
	const vph = window.innerHeight; // height of the viewport
	let nvw; // new width
	let nvh; // new height
	// Соотношение сторон - это соотношение размеров экрана в разных измерениях.
	// Соотношение высоты к ширине - ovh / ovw.
	if (vph / vpw < ovh / ovw) {
		// Если отношение высоты к ширине области просмотра меньше,
		// чем отношение высоты к ширине, тогда высота будет
		// равна высоте области просмотра, а ширина будет масштабироваться.
		nvh = vph;
		nvw = (nvh * ovw) / ovh;
	} else {
		// В другом случае происходит обратное.
		nvw = vpw;
		nvh = (nvw * ovh) / ovw;
	}
	// app.stage.scale.set(nvw / ovw, nvh / ovh); // если сохранять пропорцию
	app.stage.scale.set((vpw / ovw), (vph / ovh));		// если не сохранять
	// пропорцию
}

/*******************************************************************************
 */
function clearArray(array) {
	while (array.length) {
		array.pop();
	}
}
