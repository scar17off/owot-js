let isBrowser = typeof window !== "undefined";

if (isBrowser) {
	!function (e) { "use strict"; function t() { } function n(e, t) { for (var n = e.length; n--;)if (e[n].listener === t) return n; return -1 } function r(e) { return function () { return this[e].apply(this, arguments) } } function i(e) { return "function" == typeof e || e instanceof RegExp || !(!e || "object" != typeof e) && i(e.listener) } var s = t.prototype, o = e.EventEmitter; s.getListeners = function (e) { var t, n, r = this._getEvents(); if (e instanceof RegExp) { t = {}; for (n in r) r.hasOwnProperty(n) && e.test(n) && (t[n] = r[n]) } else t = r[e] || (r[e] = []); return t }, s.flattenListeners = function (e) { var t, n = []; for (t = 0; t < e.length; t += 1)n.push(e[t].listener); return n }, s.getListenersAsObject = function (e) { var t, n = this.getListeners(e); return n instanceof Array && (t = {}, t[e] = n), t || n }, s.addListener = function (e, t) { if (!i(t)) throw new TypeError("listener must be a function"); var r, s = this.getListenersAsObject(e), o = "object" == typeof t; for (r in s) s.hasOwnProperty(r) && -1 === n(s[r], t) && s[r].push(o ? t : { listener: t, once: !1 }); return this }, s.on = r("addListener"), s.addOnceListener = function (e, t) { return this.addListener(e, { listener: t, once: !0 }) }, s.once = r("addOnceListener"), s.defineEvent = function (e) { return this.getListeners(e), this }, s.defineEvents = function (e) { for (var t = 0; t < e.length; t += 1)this.defineEvent(e[t]); return this }, s.removeListener = function (e, t) { var r, i, s = this.getListenersAsObject(e); for (i in s) s.hasOwnProperty(i) && -1 !== (r = n(s[i], t)) && s[i].splice(r, 1); return this }, s.off = r("removeListener"), s.addListeners = function (e, t) { return this.manipulateListeners(!1, e, t) }, s.removeListeners = function (e, t) { return this.manipulateListeners(!0, e, t) }, s.manipulateListeners = function (e, t, n) { var r, i, s = e ? this.removeListener : this.addListener, o = e ? this.removeListeners : this.addListeners; if ("object" != typeof t || t instanceof RegExp) for (r = n.length; r--;)s.call(this, t, n[r]); else for (r in t) t.hasOwnProperty(r) && (i = t[r]) && ("function" == typeof i ? s.call(this, r, i) : o.call(this, r, i)); return this }, s.removeEvent = function (e) { var t, n = typeof e, r = this._getEvents(); if ("string" === n) delete r[e]; else if (e instanceof RegExp) for (t in r) r.hasOwnProperty(t) && e.test(t) && delete r[t]; else delete this._events; return this }, s.removeAllListeners = r("removeEvent"), s.emitEvent = function (e, t) { var n, r, i, s, o = this.getListenersAsObject(e); for (s in o) if (o.hasOwnProperty(s)) for (n = o[s].slice(0), i = 0; i < n.length; i++)r = n[i], !0 === r.once && this.removeListener(e, r.listener), r.listener.apply(this, t || []) === this._getOnceReturnValue() && this.removeListener(e, r.listener); return this }, s.trigger = r("emitEvent"), s.emit = function (e) { var t = Array.prototype.slice.call(arguments, 1); return this.emitEvent(e, t) }, s.setOnceReturnValue = function (e) { return this._onceReturnValue = e, this }, s._getOnceReturnValue = function () { return !this.hasOwnProperty("_onceReturnValue") || this._onceReturnValue }, s._getEvents = function () { return this._events || (this._events = {}) }, t.noConflict = function () { return e.EventEmitter = o, t }, "function" == typeof define && define.amd ? define(function () { return t }) : "object" == typeof module && module.exports ? module.exports = t : e.EventEmitter = t }("undefined" != typeof window ? window : this || {});
} else {
	EventEmitter = require("events");
	WebSocket = require("ws");
	Chalk = require("chalk");
};

class TileSystem {
	constructor() {
		this.tiles = {};
	};
	wrapStringTo16x16(inputString) {
		const result = [];
		let index = 0;

		for (let i = 0; i < 16; i++) {
			result[i] = [];
			for (let j = 0; j < 16; j++) {
				if (index < inputString.length)
					result[i][j] = inputString[index];
				else
					result[i][j] = ' ';

				index++;
			};
		};

		return result;
	};
	getChar(x, y, tile) {
		if (tile && tile[y] && tile[y][x])
			return tile[y][x];
		return null; // or any default value
	};
	getTile(x, y) {
		return this.tiles[`${x},${y}`] || null;
	};
	saveTile(key, content) {
		const tile = this.wrapStringTo16x16(content);

		this.tiles[key] = tile;
	};
};

const Tiles = new TileSystem();

class Client extends EventEmitter {
	constructor(options = {}) {
		super();

		this.player = {
			nickname: '',
			color: 0,
			id: 0,
			channel: null,
			tileX: 0,
			tileY: 0,
			charX: 0,
			tileY: 0,
			setPosition: (tileX, tileY, charX, charY) => {
				this.player.tileX = tileX;
				this.player.tileY = tileY;
				this.player.charX = charX;
				this.player.charY = charY;
			}
		};

		if (!options.world) options.world = '';
		if (!options.color) options.color = '0';
		if (!options.log) options.log = true;
		if (!options.origin) options.origin = "https://ourworldoftext.com/";
		if (!options.ws) options.ws = `wss://ourworldoftext.com/${(options.world == '' ? '' : options.world + '/')}ws/`;

		this.options = options;

		this.net = {
			ws: new WebSocket(this.options.ws, null, {
				headers: {
					Cookie: typeof options.token == "undefined" ? '' : "csrftoken=" + options.token
				}
			})
		};

		this.net.ws.onopen = () => {
			this.util.log(`WebSocket connected!`);
			this.util.log(`Joined world '${options.world}'`);
			this.emit("open");
		};
		this.net.ws.onmessage = (msg) => {
			let data = JSON.parse(msg.data);

			if (data.kind == "chat") this.emit("chat", data);
			if (data.kind == "tileUpdate" || data.kind == "fetch") {
				this.emit("tileUpdate", data.tiles);

				for (const update in data.tiles) {
					Tiles.saveTile(update, data.tiles[update].content);
				};
			};
			if (data.kind == "user_count") this.world.userCount = data.count;
			if (data.kind == "channel") {
				this.player.id = data.id;
				this.player.channel = data.channel;

				this.emit("id", data.id, data.channel);
			};
		};
		this.net.ws.onclose = () => {
			if (!this.options.log) return;

			this.util.log("WebSocket disconnected!");
			this.emit("close");
		};

		this.chat = {
			send: (message, color, global = false) => {
				if (this.net.ws.readyState !== 1) return;

				this.net.ws.send(JSON.stringify({
					kind: "chat",
					message: message,
					location: global ? "global" : "page",
					color: typeof color == 'undefined' ? this.player.chatColor : color,
					nickname: this.player.nickname
				}));

				return true;
			}
		};
		this.world = {
			leave: () => {
				if (this.net.ws.readyState !== 1) return;
				this.net.ws.close();
				this.emit("close");
			},
			userCount: 0,
			getTile: (tileX, tileY) => {
				return Tiles.chunks[`${tileX},${tileY}`];
			},
			getChar: (tileX, tileY, charX, charY) => {
				return Tiles.chunks[`${tileX},${tileY}`][charX][charY];
			},
			getCharXY: (charX, charY) => {
				const position = this.util.convertXY(charX, charY);
				const tilePosition = `${position[0]},${position[1]}`;

				if (!Tiles.chunks[tilePosition])
					requestTileXY(tilePosition);

				return Tiles.chunks[tilePosition][position[2]][position[3]];
			},
			requestRectangle: (minX, minY, maxX, maxY) => {
				if (this.net.ws.readyState !== 1) return false;

				this.net.ws.send(JSON.stringify({
					fetchRectangles: [{
						minX,
						minY,
						maxX,
						maxY
					}],
					kind: "fetch"
				}));
			},
			requestTileXY: (tileX = 0, tileY = 0) => {
				if (this.net.ws.readyState !== 1) return false;

				this.net.ws.send(JSON.stringify({ fetchRectangles: [{ minX: tileX, minY: tileY, maxX: tileX, maxY: tileY }], kind: "fetch" }));
			},
			move: (tileX = 0, tileY = 0, charX = 0, charY = 0) => {
				if (this.net.ws.readyState !== 1) return false;

				this.net.ws.send(JSON.stringify({
					"kind": "cursor",
					"position": {
						tileY,
						tileX,
						charY,
						charX
					},
					"channel": this.player.channel
				}));

				this.player.setPosition(tileX, tileY, charX, charY);

				return true;
			},
			moveXY: (charX = 0, charY = 0) => {
				if (this.net.ws.readyState !== 1) return false;

				const position = this.util.convertXY(charX, charY);

				this.net.ws.send(JSON.stringify({
					kind: "cursor",
					position: {
						tileX: position[1],
						tileY: position[0],
						charX: position[3],
						charY: position[2]
					},
					channel: this.player.channel
				}));

				this.player.setPosition(position[0], position[1], position[2], position[3]);

				return true;
			},
			writeChar: (char, color, tileX, tileY, charX, charY) => {
				if (this.net.ws.readyState !== 1) return false;
				if (Tiles.getChar(tileX, tileY, charX, charY) == char) return false;
				if (color) this.player.color = color;

				this.net.ws.send(JSON.stringify({
					"kind": "write",
					"edits": [
						[
							tileY,
							tileX,
							charY,
							charX,
							this.player.color,
							char,
							1 // sequence (not sure if it's necessary)
						]
					]
				}));

				this.player.setPosition(tileX, tileY, charX, charY);

				return true;
			},
			writeCharXY: (char, color, charX, charY) => {
				if (this.net.ws.readyState !== 1) return false;
				if (color) this.player.color = color;

				const position = this.util.convertXY(charX, charY);
				if (Tiles.getChar(position[0], position[1], position[2], position[3]) == char) return false;

				this.net.ws.send(JSON.stringify({
					"kind": "write",
					"edits": [
						[
							position[1],
							position[0],
							position[3],
							position[2],
							this.player.color,
							char,
							1 // sequence (not sure if it's necessary)
						]
					]
				}));

				this.player.setPosition(position[0], position[1], position[2], position[3]);

				return true;
			},
			writeString: (str, color, startTileX, startTileY, startCharX, startCharY) => {
				if (this.net.ws.readyState !== 1) return false;
			
				const edits = [];
				let currentTileX = startTileX;
				let currentTileY = startTileY;
				let currentCharX = startCharX;
				let currentCharY = startCharY;
			
				if (color) this.player.color = color;
			
				for (let i = 0; i < str.length; i++) {
					var char = str[i];
					const currentChar = Tiles.getChar(currentCharX, currentCharY, Tiles.getTile(currentTileX, currentTileY));

					if(char == '\n') {
						currentCharX = startCharX;
						currentTileX = startTileX;
						currentCharY++;

						if(currentCharY == 16) {
							currentTileY++;
							currentCharY = 0;
						};

						continue;
					};
					
					if (char !== currentChar)
						edits.push([
							currentTileY,
							currentTileX,
							currentCharY,
							currentCharX,
							this.player.color,
							char,
							i + 1 // sequence
						]);

					currentCharX++;

					if(currentCharX == 16) {
						currentTileX++;
						currentCharX = 0;
					};
				};
			
				if (edits.length > 0) {
					this.net.ws.send(JSON.stringify({
						"kind": "write",
						"edits": edits
					}));
				};
			
				this.player.setPosition(currentTileX, currentTileY, currentCharX - 1, currentCharY);
			
				return true;
			},
			writeStringXY: (str, color, charX, charY) => {
				if (this.net.ws.readyState !== 1) return false;

				const position = this.util.convertXY(charX, charY);
				const startTileX = position[1];
				const startTileY = position[0];
				const startCharX = position[3];
				const startCharY = position[2];
			
				const edits = [];
				let currentTileX = startTileX;
				let currentTileY = startTileY;
				let currentCharX = startCharX;
				let currentCharY = startCharY;
			
				if (color) this.player.color = color;
			
				for (let i = 0; i < str.length; i++) {
					var char = str[i];
					const currentChar = Tiles.getChar(currentCharX, currentCharY, Tiles.getTile(currentTileX, currentTileY));

					if(char == '\n') {
						currentCharX = startCharX;
						currentTileX = startTileX;
						currentCharY++;

						if(currentCharY == 16) {
							currentTileY++;
							currentCharY = 0;
						};

						continue;
					};
					
					if (char !== currentChar)
						edits.push([
							currentTileY,
							currentTileX,
							currentCharY,
							currentCharX,
							this.player.color,
							char,
							i + 1 // sequence
						]);

					currentCharX++;

					if(currentCharX == 16) {
						currentTileX++;
						currentCharX = 0;
					};
				};
			
				if (edits.length > 0) {
					this.net.ws.send(JSON.stringify({
						"kind": "write",
						"edits": edits
					}));
				};
			
				this.player.setPosition(currentTileX, currentTileY, currentCharX - 1, currentCharY);
			
				return true;
			},
			protectTile: (type = 'public', tileX, tileY) => {
				if (this.net.ws.readyState !== 1) return false;

				this.net.ws.send(JSON.stringify({
					"tileX": tileX,
					"tileY": tileY,
					"type": type
				}));

				return true;
			}
		};
		this.util = {
			rgbToInt: (r, g, b) => {
				return b | g << 8 | r << 16;
			},
			convertXY: (x, y) => {
				let tileX = Math.floor(x / 16);
				let tileY = Math.floor(y / 8);
				let charX = x % 16;
				let charY = y % 8;

				return [tileX, tileY, charX, charY];
			},
			getCursorPosition: () => {
				let pos = [cursorCoords[0] * 16 + cursorCoords[2], cursorCoords[1] * 8 + cursorCoords[3]];
				if (!pos[1].toString().startsWith("-")) pos[1] = Math.abs(pos[1]);
				return pos;
			},
			log: (msg) => {
				if (!this.options.log) return;

				msg = "[OWOT.js] " + msg;
				if (isBrowser) console.log('%c ' + msg, "color: #00ff00");
				else Chalk.green(msg);
			}
		};
	};
};

if (isBrowser) window.OWOTjs = {
	Client: Client,
	Tiles,
	TileSystem
};
else {
	module.exports = {
		Client: Client,
		Tiles: Tiles,
		TileSysystem: TileSysystem
	};
};