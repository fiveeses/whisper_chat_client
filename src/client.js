// assumes devconsole umd file is global
var devconsole = devconsole || {};

(function iife(devconsole) {

	const dbg = (...args) => {
		console.info("dbg:", ...args);
	}

	// set-up devconsole
	const dc = (function iifeAddConsole(domTarget, listenerTarget) {
		// make a dev console
		const dc = devconsole.init(domTarget, "csbl", true);
		function handleKeyup(e) {
			switch (e.key) {
				case "`": { dc.toggle(); } break;
			}
			return e;
		};
		listenerTarget.addEventListener("keyup", handleKeyup);
		dc.toggle();
		return dc;
	}(
		document.getElementById("target"),
		document.body
	));

	// ok so now we need the chat front-end, don't we?
		// what should we do?
		// Add console page for chat
			// capabilities:
				// default: send line (only if active)
				// connect: (only if not active)
				// disconnect: (only if active)

	// Chat Controls

	const chatControls = (function iifeBuildChatControls() {
		const CHAT_NAME = "Whisper Chat client";
		const CHAT_IP = "minax"; //"127.0.0.1";
		const CHAT_PORT = "1337";
		// if user is running mozilla then use it's built-in WebSocket
		const WebSocket = window.WebSocket || window.MozWebSocket;
		let connection = (void 0);
		let enterLine;
		let enterFormattedLine;
		let name = (void 0);
		let chat = function(arg) {
			let text = arg;
			let returnValue = Promise.resolve();
			if (!connection) {
				text = `Could not send: "${text}". ${CHAT_NAME} not connected`;
				returnValue = returnValue.then(() => { 
					return enterLine(text).then(Promise.reject);
				});
			} else {
				if(!!text && typeof text === "string") {
					while (text.startsWith("/")) {
						text = text.substring(1);
					}
					if (!!text) {
						connection.send(text);
					}
				}
			}
			return returnValue;
		};
		chat.nick = function(arg) {
			if (!!connection && !!arg) {
				name = arg;
				connection.send(`/nick ${name}`);
			}
		}
		chat.connect = function(...args) {
			return Promise[!!connection ? "reject" : "resolve"](!!connection ? `Ignoring: ${CHAT_NAME} already connected` : `${CHAT_NAME} connecting...`).then((m) => {
				enterLine(m);
				const CHAT_ADDRESS = `ws://${CHAT_IP}:${CHAT_PORT}`;
				connection = new WebSocket(CHAT_ADDRESS);
				connection.onopen = function () {
					enterLine(`${CHAT_NAME} connected on ${CHAT_ADDRESS}`);
				};
				connection.onclose = function () {
					enterLine(`${CHAT_NAME} on ${CHAT_ADDRESS} disconnected`);
					connection = (void 0);
				};
				connection.onerror = function (error) {
					enterLine(`${CHAT_NAME} failure: ${error}`);
				};
				connection.onmessage = function (message) {
					const data = message.data;
					try {
						// assumes all messages from the server are json
						const json = JSON.parse(data);
						// handle incoming message
						console.info(`${CHAT_NAME} received:`, json);
						switch (json.type) {
							case "message": {
								if (!!json.data.author) {
									enterFormattedLine([{
											value: `${json.data.author}: `,
											style: {
												"fontWeight": 600,
												"color": json.data.color || "currentcolor"
											}
										},
										{ value: json.data.text }
									]);
								} else {
									enterFormattedLine([{
										value: `${json.data.text}`,
										style: { "fontStyle": "italic" }
									}]);
								}
							} break;
							case "nick": {
								enterLine(json.data);
							} break;
							case "color":
							default: {
								console.warn(`Unknown message type received ('${json.type}') with data:`, json.data);
							} break;
						};
					} catch (e) {
						console.warn(`${CHAT_NAME} onmessage: This doesn't look like a valid JSON: ${data}`);
						return;
					}
				};
			}, enterLine);
		};
		chat.disconnect = function(args) {
			return Promise[!connection ? "reject" : "resolve"](!!connection ? `${CHAT_NAME} disconnecting...` : `Ignoring: ${CHAT_NAME} not connected`).then((m) => {
					enterLine(m);
					connection.close();
				}, enterLine);
			};
		chat.init = function(el, efl) {
			el("initializing chatControls...");
			enterLine = el;
			enterFormattedLine = efl;
		};
		return chat;
	}());

	// Means we need more than just a command table.
	// We need a processor.
	const ProcessorConstructor = (function iifeMakeProcessor(chatControls) {
		class ChatProcessor extends devconsole.Processor {
			constructor(chat, element) {
				super(element);
				this.chat = chat;
				chat.init(this.enterLine.bind(this), this.enterFormattedLine.bind(this));
			}
			execute(text) { // clog, getCommand, splitCommand
				dbg(`execute(${text})`);
				const gc = this.utility.getCommand;
				const sc = this.utility.splitCommand;
				const self = this;
				function enterLine(...args) {
					if (arguments.length && typeof arguments[0] == "string") {
						return self.enterLine(...args);
					}
				}
				return gc(text).then(
					(t) => {
						const payload = sc(t);
						dbg("gcthen", payload);
						switch (payload.cmd) {
							case "/cn":
							case "/connect": {
								dbg("/connect")
								this.chat.connect(...(payload.args || [])).then(
									enterLine,
									enterLine
								);
							} break;
							case "/dc":
							case "/disconnect": {
								dbg("/disconnect");
								this.chat.disconnect(...(payload.args || [])).then(
									enterLine,
									enterLine
								);
							} break;
							case "/nick": {
								dbg("/nick");
								const name = payload.arg
								if (!!name) {
									this.chat.nick(name);
								}
							} break;
							default: { this.chat(t); } break;
						};
					},
					(t) => {
						this.chat(t);
					}
				)
			}
		}

		return ChatProcessor.bind(ChatProcessor, chatControls);
	}(chatControls));

	const title = "Whisper Chat";
	dc.addTab({ProcessorConstructor, title});
	window.dc = dc;
	setTimeout(function() { 
		chatControls.connect();
		dc.focus();
	}, 1000);

}(devconsole));