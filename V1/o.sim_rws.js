//
// Copyright (c) 2020-2021, Alexey Levashov, Oleg Sergeev
//

(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof module !== 'undefined' && module.exports){
		module.exports = factory();
	} else {
		global.SimServerWebSocket = factory();
	}
})(this, function () {

	if (!('ReconnectingWebSocket' in window)) {
		return;
	}

	// SimServer protocol constants

	var ST_CODES = {
		ST_STOP: 0,
		ST_RUN: 1,
		ST_FREEZE: 2,
		ST_FAIL: 3,
		ST_STEP: 4,
		ST_LOAD: 5,
		ST_LOADING_DATA: 6,
		ST_LOADING_TEXTS: 7,
		ST_RESET: 8,
		ST_SNAP: 9,
		ST_BUILD: 10,
		ST_RELOAD: 11,
		ST_SWCHECK: 12,
		ST_RESETBACKTRACK: 13,
		ST_BREAK: 14,
		ST_BREAK_FREEZE: 15,
		ST_SESSION_IO: 16,
		_at : function(code) { for (var prop in this) if (this[prop] == code) return prop; }
	};
  
	var MSG_CODES = {
		MSG_ERROR: -1,
		MSG_BEGIN: 0,
		MSG_STATUS: 1,
		MSG_DATA: 2,
		MSG_REQUEST: 3,
		MSG_FILE: 4,
		MSG_FILE_MORE: 5,
		MSG_FILE_UPTODAY: 6,
		MSG_FILE_NOTEXIST: 7,
		MSG_FILE_ERROR: 8,
		MSG_FILE_CRC: 9,
		MSG_END: 10
	};

	var T_TYPE = {
		T_NULL: 0,
		T_CHAR: -1,
		T_BOOL: -2,
		T_BYTE: -3,
		T_SHORT: -4,
		T_INT: -5,
		T_FLOAT: -6,
		T_DOUBLE: -7,
		T_VOID: -8,
		T_COMPLEX: -9,
		T_COMPLEX8: -10
	}

	/**************************************************/
	const string2bytes = string => new TextEncoder("utf-8").encode(string);
	const bytes2string = bytes => new TextDecoder("utf-8").decode(bytes).replace(/\0/g, '');	// convert bytes to ASCII and remove 0x0

	/**************************************************/
	function SimServerWebSocket(url, options) {

		// Default settings
		var settings = {
				/** Whether this instance should log debug messages. */
				debug: false,
				/** The login user name for handshake to SimServer. */
				userName: 'webClient'
		}

		if (!options) { options = {}; }

		// Overwrite and define settings with options if they exist.
		for (var key in settings) {
			if (typeof options[key] !== 'undefined') {
				this[key] = options[key];
			} else {
				this[key] = settings[key];
			}
		}

		// These should be treated as read-only properties
		this.url = url;

		// Private state variables
		var self = this;
		var rws;
		var SendQueue = [];		// FIFO with synchronous command
		var Subscription = {
			pageId: '0',		// is any unique string identifier (usually the page file name) - в нашем случае это номер видеокадра
			blockId: 0,			// is used for verifying the subscription message
			command: 'DATA',
			refresh: 1000,
			varList: [],
			varValue: []
		};

		const ReconnectingWebSocket_options = {
			connectionTimeout: 1000,			// повторить попытку подключения, если по истечении этого времени подключение не было выполнено, в мс
			maxRetries: Infinity,				// макс. количество попыток

			minReconnectionDelay: 1000,			// мин. задержка в мс между переподключениями
			maxReconnectionDelay: 1000,			// макс. задержка в мс между переподключениями
			reconnectionDelayGrowFactor: 1.0,	// как быстро растет задержка переподключения

		//	minUptime: 5000,					// мин. время в мс, чтобы считать соединение стабильным
			maxEnqueuedMessages: 3,				// макс. количество сообщений в буфере до повторного подключения

		//	startClosed: false,					// запустить веб-сокет в CLOSED состоянии, вызвать `.reconnect ()` для подключения

		//	debug: self.debug,					// включить вывод отладки
			debug: false,						// включить вывод отладки
		};

		// Constructor
		rws = new ReconnectingWebSocket(url, ['SimServerAPI'], ReconnectingWebSocket_options);

		rws.onopen = function(evt) { self.onOpen(evt) };
		rws.onclose = function(evt) { self.onClose(evt) };
		rws.onmessage = function(evt) { self.onMessage(evt) };
		rws.onerror = function(evt) { self.onError(evt) };

		/**************************************************/
		this.onOpen = function(event) {
			if (self.debug || SimServerWebSocket.debugAll) {
				console.debug('%cSIM_RWS onOpen: %s ', 'background: green; color: black;', self.url);
			}
			self.SendQueue = [];					// очищаем очередь запросов к SimServer

			self.send('login ' + self.userName);
//			setTimeout(() => self.send('login ' + self.userName), 100);

		};

		/**************************************************/
		this.onClose = function(event) {
			if (self.debug || SimServerWebSocket.debugAll) {
				console.debug('%cSIM_RWS onClose: ', 'background: red; color: white;', event);
			}

			if (event.code === 1005) {
				console.log('%cSIM_RWS SimServer socket error: connection refused (code: %d)', 'background: red; color: white;', event.code);
			}

			if (event.code === 1005 ||	// websockify
				event.code === 1006) {	// websocat
				console.log('%cSIM_RWS SimServer socket error: connection refused (code: %d)', 'background: red; color: white;', event.code);
			}

			// Значение принятых параметров = null
			for (let i = 0; i < Subscription.varValue.length; i++) {
				Subscription.varValue[i] = null;
			}

//			// reconnect after closing
//			if (rws._retryCount === 10)
//				setTimeout(() => { rws.reconnect(1005, 'reconnect'); }, 100);

		};

		/**************************************************/
		this.onMessage = function(packet) {
			decodeResponse(packet);
		};

		/**************************************************/
		this.onError = function(event) {
			if (self.debug || SimServerWebSocket.debugAll) {
				console.debug('%cSIM_RWS onError: ', 'background: red; color: white;', event);
			}

			if (event.message === 'TIMEOUT') {
				console.log('%cSIM_RWS WebSocketServer socket error: connection refused (message: %s)', 'background: red; color: white;', event.message);
			} else {
				console.log('%cSIM_RWS WebSocketServer socket error: ', 'background: red; color: white;', event);
			}
		};

		/**************************************************/
		//  Define methods - Запрос-ответ (Request–Response)
		/**************************************************/

		/** drag command to SimServer
		 **************************************************/
		this.dragRequest = function() {
			if (rws.readyState == WebSocket.OPEN) {
				var msg = SendQueue[0].request;

				//if (self.debug || SimServerWebSocket.debugAll) {
				//	console.debug('SIM_RWS', 'dragRequest', 'msg:', msg);
				//}

				// create message body		
				var body = (typeof msg === 'string' || msg instanceof String) ? string2bytes(msg) : msg;

				//if (self.debug || SimServerWebSocket.debugAll) {
				//	console.debug('SIM_RWS', 'dragRequest', 'body:', body);
				//}

				// create header
				var length = body.length + 1;
				var code = 1;
				var sizeOf_int32 = 4;
				var header = (length | (code << 28));					// __int32 header;

				// build buffer
				var buffer = new ArrayBuffer(length + sizeOf_int32);	// allocate buffer by its length
				new Uint8Array(buffer).set(body, 4);					// copy message body to buffer
				new DataView(buffer).setUint32(0, header, true);		// set header in the buffer

				return rws.send(buffer);
			} else {
				throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
			}
		};

		/** Cancel Data Subscription
		 **************************************************/
		this.unsubscribe = function(pageId) {
			let ID = pageId || Subscription.pageId;
			// This command cancels a previously requested data subscription with the specified ID
			self.send("CANCEL " + ID);
		};

		/** Subscribe
		 **************************************************/
		this.subscribe = function(config) {
			// create subscription or default;
			var su = config || {};
			su.command = su.command || 'DATA';
			su.refresh = su.refresh || 1000;
			su.blockId = su.blockId || ++Subscription.blockId;
			su.pageId  = su.pageId || su.blockId.toString();
			su.varList = su.varList || [];
			su.varValue = [];
			su.command = su.command + ' "' + su.pageId + '" ' + su.blockId + ' ' + su.refresh + ' ' + su.varList.join(' ');

			//if (self.debug || SimServerWebSocket.debugAll) {
			//	console.debug('SIM_RWS', 'subscribe', ' :', su);
			//}

			// send subscribe command
			self.send(su.command);
			Object.assign(Subscription, su);	// клонируем объект
		};

		/** Subscribe
		 **************************************************/
		this.getSubscribe = function() {
			return Subscription;
		};

		/** decode answer from SimServer
		 **************************************************/
		function decodeResponse(packet) {
			//if (self.debug || SimServerWebSocket.debugAll) {
			//	console.debug('SIM_RWS', 'decodeResponse', self.url);
			//}

			let buffer = new DataView(packet.data);				// packet.data = ArrayBuffer - непрерывная область памяти фиксированной длины
			let code = buffer.getInt8(3) >> 4;					// __int8 code = ((header & 0xF0000000) >> 28);
			let size = buffer.getInt32(0, true) & 0x0FFFFFFF;	// __int32 size = header & 0x0FFFFFFF;
			let re = SendQueue[0] || {};						// response handler				

			switch (code) {
				case MSG_CODES.MSG_STATUS:
				{
					let status = ST_CODES._at(buffer.getInt8(4, true));
					if (self.debug || SimServerWebSocket.debugAll) {
						console.debug('SIM_RWS', 'decodeResponse', 'MSG_STATUS:', status);
					}
					break;
				}
				case MSG_CODES.MSG_DATA:
				{
					//if (self.debug || SimServerWebSocket.debugAll) {
					//	console.debug('SIM_RWS', 'decodeResponse', 'MSG_DATA :', packet.data);
					//}
					decode_MSG_DATA(packet);
					break;
				}
				case MSG_CODES.MSG_REQUEST:
				{
					re.response = bytes2string(packet.data.slice(4)).replace(/\x00/, '');

					if ( (re.response === undefined) || (re.response === null) ) {
						console.error('%cSIM_RWS decodeResponse MSG_REQUEST: undefined', 'background: magenta; color: black;');
						break;
					}

					// dequeue sent request
					/*var shifted = */SendQueue.shift();

					if (self.debug || SimServerWebSocket.debugAll) {
						console.debug('SIM_RWS', 'decodeResponse', 'MSG_REQUEST:', re);
					}

					// Попытка подписаться после восствновления связи
					//     Uncaught TypeError: Cannot read property 'startsWith' of undefined
					//         at decodeResponse (simserver-websocket.js:351)
					try {	// может выбрасывать три вида исключений
						if ( re.request.startsWith('login') &&
							 re.response.startsWith('OK') &&
							 (Subscription.blockId != 0) ) {
							if (self.debug || SimServerWebSocket.debugAll) {
								console.debug('SIM_RWS', 'decodeResponse', 'refresh subscribe');
							}
							self.subscribe({ pageId: Subscription.pageId, varList: Subscription.varList });
						}
					} catch (e) {
						if (e instanceof TypeError) {
							// обработка исключения TypeError
						} else if (e instanceof RangeError) {
							// обработка исключения RangeError
						} else if (e instanceof EvalError) {
							// обработка исключения EvalError
						} else {
							// обработка остальных исключений
							console.error('SIM_RWS', 'decodeResponse', e);	// передать обработчику ошибок
						}
					}

					// Если получили такой ответ - 'Server: ERROR - Unknown command' , то - reconnect
					if (re.response.startsWith('Server: ERROR - Unknown command')) {
						console.error('SIM_RWS', 'decodeResponse', 'MSG_REQUEST:', re.response);
						self.reconnect();
					}

					// send only if send queue is not empty
					if (SendQueue.length > 0) {
						self.dragRequest();
					}
					break;
				}
			};

		}; // decodeResponse

		/** decode MSG_DATA
		 **************************************************/
		function decode_MSG_DATA(packet) {

			// list of values for subscription
			var values = new Array();
			var buffer = new DataView(packet.data);

			// items from subscription data block
			var BLOCK_ID = 0;
			var ITEMS_COUNT = 0;
			var PAGE_ID = "";
			var ITEM_TYPE = 0;
			var ITEM_LEN = 0;

			// a state machine control variables
			var iState = 0;							// deafult state
			const INITIAL_OFFSET = 4;				// Initial offset in data block
			var offest = INITIAL_OFFSET;			// offset in byte array
			var size = offest + 1;

			// the loop
			while (size <= packet.data.byteLength) {
				let ss = size;
				switch (iState) {
					case 0: // get PAGE_ID               
						let c = buffer.getInt8(offest);
						if (c === 0) {
							PAGE_ID = bytes2string(packet.data.slice(INITIAL_OFFSET, offest));
							iState = 1;
							size += 2;	// MAGIC[2]
						}
						else if (c === 0x7E) {	//'~'
							let message = new TextDecoder('cp866').decode(packet.data.slice(offest)); // encoding types here: https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/TextDecoder
							if (message.lastIndexOf('~action') === 0) {
								handleServerAction({
									action: message.slice(7)/*,
									subscriptions: subscriptions*/
								});
								return packet.data.byteLength;
							}
						}
						else
							size += 1;	// PAGE_ID[+1]
							//offest += 1;				
						break;
					case 1: // get MAGIC            
						var MAGIC = buffer.getUint16(offest, false);
						if (MAGIC === 0x5044) {			//"PD"  Subscription data
							iState = 2
						} else if (MAGIC === 0x5551) {	// "QU" Query subscription update
							iState = 2
						} else
							return 0;
						size += 4;		// BLOCK_ID[4]
						break;
					case 2: // get BLOCK_ID               
						BLOCK_ID = buffer.getInt32(offest, true);

//						if (self.debug || SimServerWebSocket.debugAll) {
//							console.debug('SIM_RWS', 'decode_MSG_DATA', 'BLOCK_ID =', BLOCK_ID);
//						}

						iState = 3;
						size += 4;		// ITEMS_COUNT[4]
						break;
					case 3: // get ITEMS_COUNT
						ITEMS_COUNT = buffer.getInt32(offest, true);

//						if (self.debug || SimServerWebSocket.debugAll) {
//							console.debug('SIM_RWS', 'decode_MSG_DATA', 'ITEMS_COUNT =', ITEMS_COUNT);
//						}

						iState = 4;
						size += 1;		// ITEM_TYPE[1]                
						break;
					case 4: // get ITEM_LEN
						ITEM_LEN = buffer.getUint8(offest);
						iState = 5;
						size += 1;		// ITEM_TYPE[1]
						break;
					case 5: // get ITEM_TYPE
						ITEM_TYPE = buffer.getInt8(offest);
						var length = (ITEM_LEN == -100) ? 4 : ITEM_LEN;
						iState = 6;
						size += length;	// ITEM_VALUE[length]
						break;
					case 6: // get ITEM_VALUE[ITEM_LEN]
						var VALUE = null;	// default value is null if not provided by server                
						try {
							switch (ITEM_TYPE) {
								case T_TYPE.T_NULL:
									VALUE = null;
									break;
								case T_TYPE.T_CHAR:
									VALUE = (ITEM_LEN == 1) ? buffer.getInt8(offest) : bytes2string(packet.data.slice(offest, ITEM_LEN));
									break;
								case T_TYPE.T_BOOL:
								case T_TYPE.T_BYTE:
									VALUE = buffer.getInt8(offest);
									break;
								case T_TYPE.T_SHORT:
									VALUE = buffer.getInt16(offest, true);
									break;
								case T_TYPE.T_INT:
									VALUE = buffer.getInt32(offest, true);
									break;
								case T_TYPE.T_FLOAT:
									VALUE = buffer.getFloat32(offest, true);
					//	VALUE = parseFloat(VALUE.toFixed(6));
									break;
								case T_TYPE.T_DOUBLE:
									VALUE = buffer.getFloat64(offest, true);
					//	VALUE = parseFloat(VALUE.toFixed(6));
									break;
								case T_TYPE.T_VOID:
									VALUE = "";	// VOID empty sting
									break;
								case T_TYPE.T_COMPLEX:
									VALUE = new Float64Array(2);						// COMPLEX (double)
									VALUE[0] = buffer.getFloat64(offest, true);
									VALUE[1] = buffer.getFloat64(offest + 8, true);
									break;
								case T_TYPE.T_COMPLEX8:
									VALUE = new Float32Array(2);						// COMPLEX (float)
									VALUE[0] = buffer.getFloat32(offest, true);
									VALUE[1] = buffer.getFloat32(offest + 4, true);
									break;
								default :
									var name = (Subscription.varList !== undefined)? Subscription.varList[values.length]:values.length.toString();

									if (self.debug || SimServerWebSocket.debugAll) {
										console.error('SIM_RWS', 'decode_MSG_DATA', 'ITEM_TYPE:', name);
									}

									break;
							}
						}
						catch (e) {
							VALUE = "Error in subscription data (type: " + ITEM_TYPE.toString() + ") " + e.message;
							console.error('SIM_RWS', 'decode_MSG_DATA', VALUE);
						}

						values.push(VALUE);

						//if (self.debug || SimServerWebSocket.debugAll) {
						//	console.debug('SIM_RWS', 'decode_MSG_DATA', 'VALUE =', VALUE);
						//}

						size += 1;
						iState = 4;	// ITEM_LEN[1]
						break;
				}
				offest = ss;

			} //while (offest < packet.data.byteLength);

			// Обновим Subscription.varValue полученными динамическими данными
			// если полученные данные это то на что подписывались 
			if ((PAGE_ID == Subscription.pageId) ?? (BLOCK_ID == Subscription.blockId)) {
				Subscription.varValue = values;
//				uptimeDATA = new Date();
			}

			if (self.debug || SimServerWebSocket.debugAll) {
				console.debug(
					'SIM_RWS',
					//'onmessage',
					//'decodeResponse',
					'decode_MSG_DATA',
					', PAGE_ID:', PAGE_ID,
					', BLOCK_ID:', BLOCK_ID,
					', ITEMS_COUNT:', ITEMS_COUNT,
					', VALUES:', values);
			}

			if (self.debug || SimServerWebSocket.debugAll) {
				console.debug(
					'SIM_RWS',
					//'onmessage',
					//'decodeResponse',
					'decode_MSG_DATA',
					', Subscription:', Subscription);
			}
		}; // decode_MSG_DATA

		/** Transmits data to the SimSserver over the connection.
		 **************************************************/
		this.send = function(message) {
			if (rws.readyState == WebSocket.OPEN) {
				if (self.debug || SimServerWebSocket.debugAll) {
					//console.debug('SIM_RWS, bufferedAmount:', rws.bufferedAmount, ', send:', message);
					console.debug('SIM_RWS send:', message);
				}

				// create send request {message to send}
				var req = { request: message, response: '' };

				var count = SendQueue.length;		// is send queue empty

				SendQueue.push(req);				// add request (req) to send queue  

				if (count == 0)
					return self.dragRequest();		// drags the queue if it is empty
			}/* else {
				throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
			}*/
		};

		/**
		 * Additional public API method to refresh the connection.
		 **************************************************/
		this.reconnect = function() {
			rws.reconnect(1000, 'reconnect');
		};

	} // SimServerWebSocket

	/**
	 * Whether all instances of SimServerWebSocket should log debug messages.
	 **************************************************/
	SimServerWebSocket.debugAll = false;

	return SimServerWebSocket;
});
