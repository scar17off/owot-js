let isBrowser = typeof window !== "undefined";

if (isBrowser) {
	!function (e) { "use strict"; function t() { } function n(e, t) { for (var n = e.length; n--;)if (e[n].listener === t) return n; return -1 } function r(e) { return function () { return this[e].apply(this, arguments) } } function i(e) { return "function" == typeof e || e instanceof RegExp || !(!e || "object" != typeof e) && i(e.listener) } var s = t.prototype, o = e.EventEmitter; s.getListeners = function (e) { var t, n, r = this._getEvents(); if (e instanceof RegExp) { t = {}; for (n in r) r.hasOwnProperty(n) && e.test(n) && (t[n] = r[n]) } else t = r[e] || (r[e] = []); return t }, s.flattenListeners = function (e) { var t, n = []; for (t = 0; t < e.length; t += 1)n.push(e[t].listener); return n }, s.getListenersAsObject = function (e) { var t, n = this.getListeners(e); return n instanceof Array && (t = {}, t[e] = n), t || n }, s.addListener = function (e, t) { if (!i(t)) throw new TypeError("listener must be a function"); var r, s = this.getListenersAsObject(e), o = "object" == typeof t; for (r in s) s.hasOwnProperty(r) && -1 === n(s[r], t) && s[r].push(o ? t : { listener: t, once: !1 }); return this }, s.on = r("addListener"), s.addOnceListener = function (e, t) { return this.addListener(e, { listener: t, once: !0 }) }, s.once = r("addOnceListener"), s.defineEvent = function (e) { return this.getListeners(e), this }, s.defineEvents = function (e) { for (var t = 0; t < e.length; t += 1)this.defineEvent(e[t]); return this }, s.removeListener = function (e, t) { var r, i, s = this.getListenersAsObject(e); for (i in s) s.hasOwnProperty(i) && -1 !== (r = n(s[i], t)) && s[i].splice(r, 1); return this }, s.off = r("removeListener"), s.addListeners = function (e, t) { return this.manipulateListeners(!1, e, t) }, s.removeListeners = function (e, t) { return this.manipulateListeners(!0, e, t) }, s.manipulateListeners = function (e, t, n) { var r, i, s = e ? this.removeListener : this.addListener, o = e ? this.removeListeners : this.addListeners; if ("object" != typeof t || t instanceof RegExp) for (r = n.length; r--;)s.call(this, t, n[r]); else for (r in t) t.hasOwnProperty(r) && (i = t[r]) && ("function" == typeof i ? s.call(this, r, i) : o.call(this, r, i)); return this }, s.removeEvent = function (e) { var t, n = typeof e, r = this._getEvents(); if ("string" === n) delete r[e]; else if (e instanceof RegExp) for (t in r) r.hasOwnProperty(t) && e.test(t) && delete r[t]; else delete this._events; return this }, s.removeAllListeners = r("removeEvent"), s.emitEvent = function (e, t) { var n, r, i, s, o = this.getListenersAsObject(e); for (s in o) if (o.hasOwnProperty(s)) for (n = o[s].slice(0), i = 0; i < n.length; i++)r = n[i], !0 === r.once && this.removeListener(e, r.listener), r.listener.apply(this, t || []) === this._getOnceReturnValue() && this.removeListener(e, r.listener); return this }, s.trigger = r("emitEvent"), s.emit = function (e) { var t = Array.prototype.slice.call(arguments, 1); return this.emitEvent(e, t) }, s.setOnceReturnValue = function (e) { return this._onceReturnValue = e, this }, s._getOnceReturnValue = function () { return !this.hasOwnProperty("_onceReturnValue") || this._onceReturnValue }, s._getEvents = function () { return this._events || (this._events = {}) }, t.noConflict = function () { return e.EventEmitter = o, t }, "function" == typeof define && define.amd ? define(function () { return t }) : "object" == typeof module && module.exports ? module.exports = t : e.EventEmitter = t }("undefined" != typeof window ? window : this || {});
} else {
	EventEmitter = require("events");
	WebSocket = require("ws");
	Chalk = require("chalk");
}

class CharQuota {
	/**
	 * @param {number} rate - The rate at which the allowance is replenished per unit of time.
	 * @param {number} time - The time unit in milliseconds over which the rate is applied.
	 * @param {boolean} infinite - Indicates whether the allowance is infinite or not.
	 *                            If true, the allowance is not limited and remains constant.
	 *                            If false, the allowance is updated based on the rate and time.
	 * @constructor
	*/
	constructor(rate, time, infinite) {
		this.lastCheck = Date.now();
		this.allowance = rate;
		this.rate = rate;
		this.time = time;
		this.infinite = infinite;
	}
	/**
	 * Updates the allowance based on the elapsed time since the last check.
	 * Adjusts the allowance according to the rate and time constraints.
	*/
	update() {
		const currentTime = Date.now();
		this.allowance += (currentTime - this.lastCheck) * (this.rate / this.time);
		this.lastCheck = currentTime;
		if (this.allowance > this.rate) {
			this.allowance = this.rate;
		}
	}
	/**
	 * Checks if the specified count can be spent based on the allowance.
	 * If the allowance is infinite, it always returns true.
	 * Otherwise, it updates the allowance and checks if it's sufficient.
	 *
	 * @param {number} count - The count to be spent.
	 * @returns {boolean} - Returns true if the count can be spent, false otherwise.
	 */
	canSpend(count) {
		if (this.infinite) {
			return true;
		}

		this.update();

		if (this.allowance < count) {
			return false;
		}

		this.allowance -= count;
		return true;
	}
	/**
	 * Calculates the time remaining until the allowance is fully restored to the specified rate.
	 * If the allowance is already equal to or greater than the rate, returns 0.
	 *
	 * @returns {number} - The time remaining in milliseconds until the allowance is fully restored.
	*/
	getTimeToRestore() {
		if (this.allowance >= this.rate) return 0;
		return (this.rate - this.allowance) / (this.rate / this.time);
	}
	/**
	 * Waits asynchronously until the allowance is fully restored to the specified rate.
	 * It uses the getTimeToRestore method to determine the wait time.
	 *
	 * @returns {Promise<void>} - Resolves once the allowance is fully restored.
	*/
	async waitUntilRestore() {
		const restoreTime = this.getTimeToRestore();
		await new Promise(resolve => setTimeout(resolve, restoreTime));
	}
}

class TileSystem {
	/**
	 * @constructor
	 */
	constructor() {
		/**
		 * Object containing tiles, identified by their coordinates (e.g., "x,y").
		 * @type {Object.<string, Array.<Array.<{char: string, writability: number, color: string}>>>}
		 */
		this.tiles = {}
	}
	/**
	 * Wraps a given input string into a 16x16 grid represented as a 2D array.
	 * @param {string} inputString - The input string to wrap into a 16x16 grid.
	 * @param {number} writability - Indicates if the grid cells are writable.
	 * @param {Array.<string>} [color] - An optional array of color strings corresponding to each character in inputString.
	 * @returns {Array.<Array.<{char: string, writability: number, color: string}>>} - A 2D array representing the wrapped 16x16 grid, with each cell containing an object with char and color properties.
	 */
	wrapStringTo16x16(inputString, writability, color) {
		const result = [];
		let index = 0;
		if(!color) color = new Array(inputString.length).fill(0);

		for (let x = 0; x < 16; x++) {
			result[x] = [];
			for (let y = 0; y < 16; y++) {
				const colorIndex = index;
				if (index < inputString.length)
					result[x][y] = { char: inputString[index], writability, color: color[colorIndex] };
				else
					result[x][y] = { char: ' ', writability: 0, color: 0 };

				index++;
			}
		}

		return result;
	}
	/**
	 * Gets the character at the specified coordinates (x, y) within a given tile.
	 * @param {number} x - The x-coordinate of the character within the tile.
	 * @param {number} y - The y-coordinate of the character within the tile.
	 * @param {Array.<Array.<{char: string, writability: number, color: string}>>} tile - The tile represented as a 2D array, with each cell containing an object with char and color properties.
	 * @returns {{char: string, writability: number, color: string}|null} - The character and its color at the specified coordinates, or null if not found.
	 */
	getChar(x, y, tile) {
		if (tile && tile[x] && tile[x][y])
			return tile[x][y];
		return null; // or any default value
	}
	/**
	 * Retrieves the tile at the specified coordinates (x, y) from the tiles object.
	 * @param {number} x - The x-coordinate of the tile.
	 * @param {number} y - The y-coordinate of the tile.
	 * @returns {Array.<Array.<{char: string, writability: number, color: string}>>|null} - The tile represented as a 2D array, with each cell containing an object with char and color properties, or null if not found.
	 */
	getTile(x, y) {
		return this.tiles[`${x},${y}`] || null;
	}
	/**
	 * Saves a tile with the given key and content into the tiles object.
	 * @param {string} key - The key identifying the tile (e.g., "x,y").
	 * @param {string} content - The content to be wrapped into a 16x16 grid and saved as a tile.
	 * @param {number} writability - Indicates if the grid cells are writable.
	 * @param {Array.<string>} [color] - An optional array of color strings corresponding to each character in content.
	 * @returns {void}
	 */
	saveTile(key, content, writability, color) {
		const tile = this.wrapStringTo16x16(content, writability, color);

		this.tiles[key] = tile;
	}
}

const Tiles = new TileSystem();

/**
 * @extends EventEmitter
 */
class Client extends EventEmitter {
	/**
	 * @param {Object} [options={}] - Configuration options for the client.
	 * @param {string} [options.world=''] - The world identifier.
	 * @param {string} [options.color='0'] - The default color for the player.
	 * @param {boolean} [options.log=true] - Indicates whether logging is enabled.
	 * @param {string} [options.origin='https://ourworldoftext.com/'] - The origin URL.
	 * @param {string} [options.ws] - The WebSocket URL for communication.
	 * @param {string} [options.token] - The authentication token.
	 * @param {string} [options.hide] - Hide user from online user counter.
	 * @constructor
	 */
	constructor(options = {}) {
		super();

		/**
		 * Player information including nickname, color, id, channel, and position.
		 * @type {Object}
		 * @property {string} nickname - The player's nickname.
		 * @property {string} color - The player's color.
		 * @property {number} id - The player's id.
		 * @property {string|null} channel - The player's channel.
		 * @property {number} tileX - The player's tile x-coordinate.
		 * @property {number} tileY - The player's tile y-coordinate.
		 * @property {number} charX - The player's character x-coordinate.
		 * @property {number} charY - The player's character y-coordinate.
		 * @property {Function} setPosition - Sets the player's position.
		 * @property {Object} quota - Object representing character rate quota using CharQuota class.
		 */

		this.player = {
			nickname: '',
			chatColor: 0,
			color: 0,
			id: null,
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
			},
			quota: new CharQuota(512, 1000)
		}

		if (!options.world) options.world = '';
		if (!options.color) options.color = '0';
		if (!options.log) options.log = true;
		if (!options.origin) options.origin = "https://ourworldoftext.com/";
		options.ws = options.ws || `wss://ourworldoftext.com/${options.world ? options.world + '/' : ''}ws/${options.hide ? '?hide=1' : ''}`;

		this.options = options;

		const parameters = [{
			headers: {
				Cookie: typeof options.token == "undefined" ? '' : "token=" + options.token
			}
		}];

		if (isBrowser) parameters.unshift(null);

		/**
		 * Network configuration and methods for WebSocket communication.
		 * @type {Object}
		 * @property {WebSocket} ws - The WebSocket connection.
		 * @property {Function} sendWrite - Sends write requests through the WebSocket.
		 * @property {Array} writeBuffer - Buffer for storing write requests before sending.
		 * @property {number} writeSize - Maximum number of edits to send per request.
		 * @property {Function} flushWrites - Sends buffered write requests in chunks.
		 * @property {number} writeInterval - Interval for flushing write requests.
		 * @property {number} sequence - Sequence number for write requests.
		 */
		this.net = {
			ws: new WebSocket(this.options.ws, ...parameters),
			/**
			 * Sends write requests through the WebSocket.
			 * @param {Array} edits - The edits to be sent.
			 * @returns {boolean} - Returns false if unable to send.
			 */
			sendWrite: (edits) => {
				if (this.net.ws.readyState !== WebSocket.OPEN) return false;
				if(!this.player.quota.canSpend(1)) return false;

				const writeReq = {
					kind: "write",
					edits: edits
				}

				this.net.ws.send(JSON.stringify(writeReq));
			},
			/**
			 * Buffer for storing write requests before sending.
			 * @type {Array}
			 */
			writeBuffer: [],
			/**
			 * Maximum number of edits to send per request.
			 * @type {number}
			 */
			writeSize: 512,
			/**
			 * Sends buffered write requests in chunks.
			 */
			flushWrites() {
				if (!this.player || !this.player.quota) {
					console.error("Player or player quota is not initialized.");
					return;
				}
				while (this.net.writeBuffer.length > 0 && this.player.quota.canSpend(1)) {
					const edits = this.net.writeBuffer.splice(0, this.net.writeSize);
					this.net.sendWrite(edits);
				}
			},
			/**
			 * Interval for flushing write requests based on player quota time.
			 */
			writeInterval: setInterval(() => {
				this.net.flushWrites();
			}, this.player.quota.time),
			/**
			 * Updates the writeInterval rate for flushing write requests.
			 * @param {number} newInterval - The new interval in milliseconds.
			 * @returns {void}
			 */
			setFlushInterval(newInterval) {
				clearInterval(this.net.writeInterval);
				this.net.writeInterval = setInterval(() => {
					this.net.flushWrites();
				}, newInterval);
			},
			sequence: 1
		}

		this.net.flushWrites = this.net.flushWrites.bind(this);

		this.net.ws.onopen = () => {
			this.util.log(`WebSocket connected!`);
			this.util.log(`Joined world '${options.world}'`);
			this.emit("open");
		}
		this.net.ws.onmessage = (msg) => {
			let data = JSON.parse(msg.data);
			if (data.kind == "chathistory") {
				this.emit("chathistory", data.global_chat_prev, data.page_chat_prev);
			}
			if (data.kind == "chat") this.emit("chat", data);
			if (data.kind == "tileUpdate" || data.kind == "fetch") {
				this.emit("tileUpdate", data.tiles);
			
				for (const update in data.tiles) {
					if (!data.tiles[update]) return;
					const content = data.tiles[update].content;
					const writability = data.tiles[update].properties.writability;
					const color = data.tiles[update].properties.color;
			
					Tiles.saveTile(update, content, writability, color);
				}
			
				if (data.kind == "fetch") this.emit("fetch", data.tiles);
			}
			if (data.kind == "user_count") this.world.userCount = data.count;
			if (data.kind == "channel") {
				this.player.id = data.id;
				this.player.channel = data.channel;

				this.emit("join", data.id, data.channel);
			}
		}
		this.net.ws.onclose = () => {
			this.util.log("WebSocket disconnected!");
			this.emit("close");
		}

		this.chat = {
			/**
			 * Sends a chat message through the WebSocket connection.
			 * @param {string} message - The message to be sent.
			 * @param {boolean} [global=false] - Indicates whether the message is global.
			 * @returns {boolean} - Returns true if the message was sent successfully, false otherwise.
			 */
			send: (message, global = false) => {
				if (this.net.ws.readyState !== WebSocket.OPEN) return;

				this.net.ws.send(JSON.stringify({
					kind: "chat",
					message: message,
					location: global ? "global" : "page",
					color: this.player.chatColor,
					nickname: this.player.nickname
				}));

				return true;
			}
		}
		this.world = {
			/**
			 * The current number of users in the world.
			 * @type {number}
			 */
			userCount: 0,
			/**
			 * Closes the WebSocket connection and emits a "close" event.
			 * @returns {void}
			 */
			leave: () => {
				this.net.ws.close();
				this.emit("close");
			},
			/**
			 * Request the content of a tile at specified coordinates.
			 * If the content is already available locally, it returns the tile content immediately.
			 * Otherwise, it sends a fetch request to the server and returns a Promise that resolves with the fetched tile content.
			 *
			 * @param {number} [tileX] - The x-coordinate of the requested tile.
			 * @param {number} [tileY] - The y-coordinate of the requested tile.
			 * @returns {Promise<Array.<Array.<string>>>|Array.<Array.<string>>|boolean} - If the content is available locally, returns the tile content.
			 *                                                                            If the WebSocket connection is not open, returns false.
			 *                                                                            Otherwise, returns a Promise that resolves with the fetched tile content.
			 */
			getTile: (tileX, tileY) => {
				if (this.net.ws.readyState !== WebSocket.OPEN) return false;
				const existingTile = Tiles.getTile(tileX, tileY);
				if (existingTile) return existingTile;

				return new Promise((resolve, reject) => {
					this.net.ws.send(JSON.stringify({ fetchRectangles: [{ minX: tileX, minY: tileY, maxX: tileX, maxY: tileY }], kind: "fetch" }));

					const fn = (...args) => {
						const updates = args[0];

						for (const update in updates) {
							const [tileUpdateY, tileUpdateX] = update.split(",").map(coord => parseInt(coord)); // first coord in key name is Y somewhy
							if (tileUpdateX !== tileX || tileUpdateY !== tileY) continue;
							this.off("fetch", fn);
							const content = updates[update].content;
							const writability = updates[update].writability;
							const color = updates[update].color;
							Tiles.saveTile(`${tileX},${tileY}`, content, writability, color);
							resolve(Tiles.getTile(tileX, tileY));
						}
					}
					this.on("fetch", fn);
				});
			},
			/**
			* Retrieves the character at the specified coordinates (tileX, tileY, charX, charY) from the world.
			* @param {number} tileX - The x-coordinate of the tile.
			* @param {number} tileY - The y-coordinate of the tile.
			* @param {number} charX - The x-coordinate of the character within the tile.
			* @param {number} charY - The y-coordinate of the character within the tile.
			* @returns {Promise<string>} - A promise that resolves to the character at the specified coordinates.
			*/
			getChar: async (tileX, tileY, charX, charY) => {
				if (typeof charX === 'undefined' || typeof charY === 'undefined') {
					[tileX, tileY, charX, charY] = this.util.convertXY(tileX, tileY);
				}

				charX = Math.abs(charX);
				charY = Math.abs(charY);

				const tile = await this.world.getTile(tileX, tileY);

				return Tiles.getChar(charX, charY, tile);
			},
			/**
			 * Request content within a specified rectangular region and returns a Promise that resolves with the fetched chunks.
			 *
			 * @param {number} minX - The minimum x-coordinate of the rectangular region.
			 * @param {number} minY - The minimum y-coordinate of the rectangular region.
			 * @param {number} maxX - The maximum x-coordinate of the rectangular region.
			 * @param {number} maxY - The maximum y-coordinate of the rectangular region.
			 * @returns {Promise<any>} - A Promise that resolves with the fetched chunks if the WebSocket connection is open; otherwise, rejects with an error.
			 */
			requestRectangle: (minX, minY, maxX, maxY) => {
				return new Promise((resolve, reject) => {
					if (this.net.ws.readyState !== WebSocket.OPEN) reject(new Error("WebSocket connection is not open"));

					this.net.ws.send(JSON.stringify({
						fetchRectangles: [{
							minX,
							minY,
							maxX,
							maxY
						}],
						kind: "fetch"
					}));

					const fn = (...args) => {
						const updates = args[0];
						let fetchedChunks = [];
						for (const update in updates) {
							const [updateMinY, updateMinX, updateMaxY, updateMaxX] = update.split(",").map(coord => parseInt(coord));
							if (updateMinX >= minX && updateMinY >= minY && updateMaxX <= maxX && updateMaxY <= maxY) {
								fetchedChunks.push(updates[update]);
							}
						}
						if (fetchedChunks.length > 0) {
							this.off("fetch", fn);
							resolve(fetchedChunks);
						}
					}
					this.on("fetch", fn);
				});
			},
			/**
			 * Update the cursor position and move the player accordingly.
			 *
			 * @param {number} [tileX=0] - The target x-coordinate of the tile for the cursor and player.
			 * @param {number} [tileY=0] - The target y-coordinate of the tile for the cursor and player.
			 * @param {number} [charX=0] - The target x-coordinate of the character within the tile.
			 * @param {number} [charY=0] - The target y-coordinate of the character within the tile.
			 * @returns {boolean} - Returns true if the WebSocket connection is open, and the message is sent successfully; otherwise, returns false.
			 */
			move: (tileX = 0, tileY = 0, charX = undefined, charY = undefined) => {
				if (this.net.ws.readyState !== WebSocket.OPEN) return false;

				if (typeof charX === 'undefined' || typeof charY === 'undefined') {
					[tileX, tileY] = this.util.convertXY(tileX, tileY);
					charX = 0;
					charY = 0;
				}

				this.net.ws.send(JSON.stringify({
					"kind": "cursor",
					"position": {
						tileX,
						tileY,
						charX,
						charY
					},
					"channel": this.player.channel
				}));

				return true;
			},
			/**
			 * Write a character at specified coordinates, with optional color.
			 *
			 * @param {string} char - The character to be written.
			 * @param {string} color - The color to be applied to the character (optional).
			 * @param {number} tileX - The x-coordinate of the tile where the character will be written.
			 * @param {number} tileY - The y-coordinate of the tile where the character will be written.
			 * @param {number} charX - The x-coordinate of the character within its tile.
			 * @param {number} charY - The y-coordinate of the character within its tile.
			 * @returns {boolean} - Returns true if the WebSocket connection is open, the character is different from the existing one,
			 * @param {string} bgColor - The background color of the character.
			 *                     the player has enough quota to spend, and the message is added to the write buffer successfully; otherwise, returns false.
			 */
			writeChar: (char = ' ', color, tileX, tileY, charX, charY, bgColor) => {
				if (this.net.ws.readyState !== WebSocket.OPEN) return false;
				if (!this.player.quota.canSpend(1)) return false;
				if (color) this.player.color = color;

				if (typeof charX === 'undefined' || typeof charY === 'undefined') {
					[tileX, tileY, charX, charY] = this.util.convertXY(tileX, tileY);
				}

				if (Tiles.getChar(charX, charY, this.world.getTile(tileX, tileY)) == char) return false;

				const editItem = this.world.createEditItem(char, color, tileX, tileY, charX, charY, bgColor);
				this.net.writeBuffer.push(editItem);

				return true;
			},
			/**
			 * Write a string at specified coordinates, with optional color.
			 *
			 * @param {string} str - The string to be written.
			 * @param {string} color - The color to be applied to the string (optional).
			 * @param {number} tileX - The x-coordinate of the tile where the string will start.
			 * @param {number} tileY - The y-coordinate of the tile where the string will start.
			 * @param {number} charX - The x-coordinate of the first character within its tile.
			 * @param {number} charY - The y-coordinate of the first character within its tile.
			 * @param {string} bgColor - The background color of the character.
			 * @returns {boolean} - Returns true if all characters are added to the write buffer successfully; otherwise, returns false.
			 */
			writeString: async (str = ' ', color, tileX, tileY, charX, charY, bgColor) => {
				if (this.net.ws.readyState !== WebSocket.OPEN) return false;
				if (color) this.player.color = color;

				if (typeof charX === 'undefined' || typeof charY === 'undefined') {
					[tileX, tileY, charX, charY] = this.util.convertXY(tileX, tileY);
				}

				const chunks = this.util.chunkifyString(str, this.player.quota.rate);
				let offsetX = 0, offsetY = 0, tileOffsetX = 0;

				for (const chunk of chunks) {
					if (!this.player.quota.canSpend(chunk.length)) {
						await this.player.quota.waitUntilRestore();
					}

					for (let i = 0; i < chunk.length; i++) {
						const char = chunk.charAt(i);
						if (char === '\n') {
							offsetX = 0;
							offsetY++;
						} else {
							let [x, y] = this.util.convertPosition(tileX, tileY, charX, charY);
							x += offsetX;
							y += offsetY;
							const [newTileX, newTileY, newCharX, newCharY] = this.util.convertXY(x, y);

							const editItem = this.world.createEditItem(char, this.player.color, newTileX + tileOffsetX, newTileY, newCharX, newCharY, bgColor);
							this.net.writeBuffer.push(editItem);

							offsetX++;
							if (offsetX >= 16) {
								offsetX = 0;
								tileOffsetX++;
							}
						}
					}
				}

				return true;
			},
			/**
			 * Create an edit message
			 *
			 * @param {string} char - The character to be placed.
			 * @param {string} color - The color of the character.
			 * @param {number} tileX - The x-coordinate of the tile to be edited.
			 * @param {number} tileY - The y-coordinate of the tile to be edited.
			 * @param {number} charX - The x-coordinate of the character within the tile.
			 * @param {number} charY - The y-coordinate of the character within the tile.
			 * @param {string} bgColor - The background color of the character.
			 * @returns {object} - Returns an object containing the edit message.
			 */
			createEditItem: (char = ' ', color, tileX, tileY, charX, charY, bgColor) => {
				if (color) this.player.color = color;

				if (typeof charX === 'undefined' && typeof charY === 'undefined') {
					[tileX, tileY, charY, charX] = this.util.convertXY(tileX, tileY);
				}
				if (this.net.sequence > 10000) this.net.sequence = 0;
				return [
					tileY,
					tileX,
					charY,
					charX,
					Date.now(),
					char,
					this.net.sequence++,
					color,
					bgColor,
				];
			},
			/**
			 * Constructs an edit message object.
			 *
			 * @param {Array} editItems - An array of edit items to be included in the message.
			 * @returns {object} An object representing the edit message.
			 */
			editMessage: (editItems) => {
				const MAX_EDITS_PER_MESSAGE = this.player.quota.rate;
				let messages = [];
				for (let i = 0; i < editItems.length; i += MAX_EDITS_PER_MESSAGE) {
					messages.push({
						kind: "write",
						edits: editItems.slice(i, i + MAX_EDITS_PER_MESSAGE)
					});
				}
				return messages;
			},
			/**
			 * Protect a tile with a specified protection type.
			 *
			 * @param {string} [type='public'] - The type of protection to be applied to the tile (e.g., 'public', 'private').
			 *                                    Defaults to 'public' if not provided.
			 * @param {number} tileX - The x-coordinate of the tile to be protected.
			 * @param {number} tileY - The y-coordinate of the tile to be protected.
			 * @returns {boolean} - Returns true if the WebSocket connection is open and the message is sent successfully; otherwise, returns false.
			 */
			protectTile: (type = 'public', tileX, tileY) => {
				if (this.net.ws.readyState !== WebSocket.OPEN) return false;

				this.net.ws.send(JSON.stringify({
					"tileX": tileX,
					"tileY": tileY,
					"type": type
				}));

				return true;
			},
			/**
			 * Create a link with a URL.
			 *
			 * @param {string} url - The URL to be associated with the link.
			 * @param {number} tileX - The x-coordinate of the current character's tile.
			 * @param {number} tileY - The y-coordinate of the current character's tile.
			 * @param {number} charX - The x-coordinate of the current character within its tile.
			 * @param {number} charY - The y-coordinate of the current character within its tile.
			 * @returns {boolean} - Returns true if the WebSocket connection is open and the message is sent successfully; otherwise, returns false.
			 */
			createLinkURL: (url, tileX, tileY, charX, charY) => {
				if (this.net.ws.readyState !== WebSocket.OPEN) return false;

				this.net.ws.send(JSON.stringify({
					kind: "link",
					data: {
						tileY,
						tileX,
						charY,
						charX,
						url: url
					},
					type: "url"
				}));

				return true
			},
			/**
			 * Create a link with coordinates.
			 *
			 * @param {string} url - The URL to be associated with the link.
			 * @param {number} linkTileX - The x-coordinate of the tile containing the linked character.
			 * @param {number} linkTileY - The y-coordinate of the tile containing the linked character.
			 * @param {number} tileX - The x-coordinate of the current character's tile.
			 * @param {number} tileY - The y-coordinate of the current character's tile.
			 * @param {number} charX - The x-coordinate of the current character within its tile.
			 * @param {number} charY - The y-coordinate of the current character within its tile.
			 * @returns {boolean} - Returns true if the WebSocket connection is open and the message is sent successfully; otherwise, returns false.
			 */
			createLinkCoordinates: (url, linkTileX, linkTileY, tileX, tileY, charX, charY) => {
				if (this.net.ws.readyState !== WebSocket.OPEN) return false;

				this.net.ws.send(JSON.stringify({
					kind: "link",
					data: {
						tileY,
						tileX,
						charY,
						charX,
						link_tileX: linkTileX,
						link_tileY: linkTileY,
						url: url
					},
					type: "coord"
				}));

				return true
			}
		}
		/**
		 * Utility methods
		 * @type {Object}
		 * @property {function} rgbToInt - Converts RGB values to a single integer.
		 * @property {function} convertXY - Converts screen coordinates to tile and character coordinates.
		 * @property {function} convertPosition - Converts tile and character coordinates to a flat position.
		 * @property {function} getCursorPosition - Retrieves the cursor position based on internal cursor coordinates.
		 * @property {function} log - Logs a message if logging is enabled.
		 */
		this.util = {
			/**
			 * Splits a long string into chunks that fit within the character quota.
			 * @param {string} message - The message to be split.
			 * @param {number} quota - The character quota per chunk.
			 * @returns {Array.<string>} - An array of message chunks that fit within the quota.
			 */
			chunkifyString: (message, quota) => {
				let chunks = [];
				for (let i = 0, len = message.length; i < len; i += quota) {
					chunks.push(message.substring(i, i + quota));
				}
				return chunks;
			},
			/**
			 * Converts RGB values to a single integer.
			 *
			 * @param {number} r - The red component (0-255).
			 * @param {number} g - The green component (0-255).
			 * @param {number} b - The blue component (0-255).
			 * @returns {number} - The integer representation of the RGB values.
			 */
			rgbToInt: (r, g, b) => {
				return b | g << 8 | r << 16;
			},
			/**
			* Converts screen coordinates to tile and character coordinates.
			*
			* @param {number} x - The x-coordinate on the screen.
			* @param {number} y - The y-coordinate on the screen.
			* @returns {Array.<number>} - An array containing [tileX, tileY, charY, charX].
			*/
			convertXY: (x, y) => {
				let tileX = Math.floor(x / 16);
				let tileY = Math.floor(y / 8);
				let charX = x % 16;
				let charY = y % 8;
                
				charX = Math.abs(charX);
				charY = Math.abs(charY);

				if (x < 0 && charX > 0) charX = 16 - charX;
				if (y < 0 && charY > 0) charY = 8 - charY;

				return [tileX, tileY, charX, charY];
			},
			/**
			 * Converts tile and character coordinates to a flat position.
			 *
			 * @param {number} tileX - The x-coordinate of the tile.
			 * @param {number} tileY - The y-coordinate of the tile.
			 * @param {number} charX - The x-coordinate of the character within the tile.
			 * @param {number} charY - The y-coordinate of the character within the tile.
			 * @returns {Array.<number>} - An array containing the flat position [position].
			 */
			convertPosition: (tileX, tileY, charX, charY) => [tileX * 16 + charX, tileY * 8 + charY],
			/**
			 * Retrieves the cursor position based on internal cursor coordinates.
			 *
			 * @returns {Array.<number>} - An array containing the cursor position [cursorX, cursorY].
			 */
			getCursorPosition: () => {
				let pos = [cursorCoords[0] * 16 + cursorCoords[2], cursorCoords[1] * 8 + cursorCoords[3]];
				if (!pos[1].toString().startsWith("-")) pos[1] = Math.abs(pos[1]);
				return pos;
			},
			/**
			 * Logs a message if logging is enabled.
			 *
			 * @param {string} msg - The message to be logged.
			 * @returns {void}
			 */
			log: (msg) => {
				if (!this.options.log) return;

				msg = "[OWOT.js] " + msg;
				if (isBrowser) console.log('%c ' + msg, "color: #00ff00");
				else Chalk.green(msg);
			}
		}
	}
}

if (isBrowser) window.OWOTjs = {
	Client,
	CharQuota,
	Tiles,
	TileSystem
}
else {
	/**
	 * Module exports for the non-browser (Node.js/CommonJS) environment.
	 */
	module.exports = {
		/**
		 * The Client class for managing WebSocket connections.
		 */
		Client,
		/**
		 * The CharQuota class for managing character rate limitations.
		 */
		CharQuota,
		/**
		 * The Tiles class for handling tiles and characters.
		 */
		Tiles,
		/**
		 * The TileSystem class for managing tiles and their properties.
		 */
		TileSystem
	}
}
