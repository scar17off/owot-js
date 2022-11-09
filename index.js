let isBrowser = typeof window !== "undefined";

function append(src, onload) {
	if(!isBrowser) return;
    var s = document.createElement('script');
    s.src = src;
    s.onload = onload;
    document.body.appendChild(s);
};

if (isBrowser) {
	!function(e){"use strict";function t(){}function n(e,t){for(var n=e.length;n--;)if(e[n].listener===t)return n;return-1}function r(e){return function(){return this[e].apply(this,arguments)}}function i(e){return"function"==typeof e||e instanceof RegExp||!(!e||"object"!=typeof e)&&i(e.listener)}var s=t.prototype,o=e.EventEmitter;s.getListeners=function(e){var t,n,r=this._getEvents();if(e instanceof RegExp){t={};for(n in r)r.hasOwnProperty(n)&&e.test(n)&&(t[n]=r[n])}else t=r[e]||(r[e]=[]);return t},s.flattenListeners=function(e){var t,n=[];for(t=0;t<e.length;t+=1)n.push(e[t].listener);return n},s.getListenersAsObject=function(e){var t,n=this.getListeners(e);return n instanceof Array&&(t={},t[e]=n),t||n},s.addListener=function(e,t){if(!i(t))throw new TypeError("listener must be a function");var r,s=this.getListenersAsObject(e),o="object"==typeof t;for(r in s)s.hasOwnProperty(r)&&-1===n(s[r],t)&&s[r].push(o?t:{listener:t,once:!1});return this},s.on=r("addListener"),s.addOnceListener=function(e,t){return this.addListener(e,{listener:t,once:!0})},s.once=r("addOnceListener"),s.defineEvent=function(e){return this.getListeners(e),this},s.defineEvents=function(e){for(var t=0;t<e.length;t+=1)this.defineEvent(e[t]);return this},s.removeListener=function(e,t){var r,i,s=this.getListenersAsObject(e);for(i in s)s.hasOwnProperty(i)&&-1!==(r=n(s[i],t))&&s[i].splice(r,1);return this},s.off=r("removeListener"),s.addListeners=function(e,t){return this.manipulateListeners(!1,e,t)},s.removeListeners=function(e,t){return this.manipulateListeners(!0,e,t)},s.manipulateListeners=function(e,t,n){var r,i,s=e?this.removeListener:this.addListener,o=e?this.removeListeners:this.addListeners;if("object"!=typeof t||t instanceof RegExp)for(r=n.length;r--;)s.call(this,t,n[r]);else for(r in t)t.hasOwnProperty(r)&&(i=t[r])&&("function"==typeof i?s.call(this,r,i):o.call(this,r,i));return this},s.removeEvent=function(e){var t,n=typeof e,r=this._getEvents();if("string"===n)delete r[e];else if(e instanceof RegExp)for(t in r)r.hasOwnProperty(t)&&e.test(t)&&delete r[t];else delete this._events;return this},s.removeAllListeners=r("removeEvent"),s.emitEvent=function(e,t){var n,r,i,s,o=this.getListenersAsObject(e);for(s in o)if(o.hasOwnProperty(s))for(n=o[s].slice(0),i=0;i<n.length;i++)r=n[i],!0===r.once&&this.removeListener(e,r.listener),r.listener.apply(this,t||[])===this._getOnceReturnValue()&&this.removeListener(e,r.listener);return this},s.trigger=r("emitEvent"),s.emit=function(e){var t=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,t)},s.setOnceReturnValue=function(e){return this._onceReturnValue=e,this},s._getOnceReturnValue=function(){return!this.hasOwnProperty("_onceReturnValue")||this._onceReturnValue},s._getEvents=function(){return this._events||(this._events={})},t.noConflict=function(){return e.EventEmitter=o,t},"function"==typeof define&&define.amd?define(function(){return t}):"object"==typeof module&&module.exports?module.exports=t:e.EventEmitter=t}("undefined"!=typeof window?window:this||{});
} else {
	EventEmitter = require("events");
	WebSocket = require("ws");
	Chalk = require("chalk");
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
};
// weirdo way because of owot's tileupdate system. needs to be fixed
class TileSys {
	constructor(content, color, writability, pos) {
		this.content = content || '';
		this.color = color || 0;
		this.writability = writability || null;
		this.pos = pos;
	}
};

class Tiles {
	constructor() {
		this.tiles = {};

		this.Register = (data) => {
			let channel = data.channel, kind = data.kind, source = data.source, tiles_ = data.tiles;

			if(kind !== 'tileUpdate') return; // not tileupdate

			for(let tiledata in tiles_) {
				let tile = tiles_[tiledata];
				tile.chunk = tiledata;
				let content = tile.content, color = tile.color, writability = tile.writability, chunk = tile.chunk;

				for(let char in content) {
					let pluslen = char;
					char = content[char];
					// temp

					let fullPos = [chunk.split(',')[0], chunk.split(',')[1]]; // chunkX, chunkY, charX, charY

					let Tile_ = new TileSys(char, color, writability, fullPos);

					// console.log(Tile_);
				};
			};
		};
	}
	calcCoords(x, y) {
		return 
	}
};

class Client extends EventEmitter {
	constructor(options = {}){
		super();
		var ws;

		this.player = {
			color: 0,
			rank: 0,
			id: 0,
			x: 0,
			y: 0
		};
		this.options = {
			origin: options.origin,
			ws: options.ws,
			chunkSize: 16,
			playerJoined: false,
			nickname: options.nickname,
			log: false
		};
		if(!this.options.world) this.options.world = '';
		if(!this.options.color) this.options.color = "0";
		if(!this.options.log) this.options.log = true;
		if(!this.options.origin) this.options.origin = "https://ourworldoftext.com/";
		if(!this.options.ws) this.options.ws = "wss://ourworldoftext.com/ws/";
		this.chat = {
			setNickname: (nickname) => {
				if(ws.readyState !== 1) return;
				ws.send(JSON.stringify({
					kind: "chat",
					nickname: this.player.nickname,
					message: "/nick "+nickname,
					location: "page",
					color: this.player.color
				}));
				this.player.nickname = nickname
			},
			send: (message, globalChat) => {
				if(ws.readyState !== 1) return;
				let chat;
				if(globalChat == true) {chat = "global"} else if(globalChat == false) {chat = "page"} else {chat = "page"};
				ws.send(JSON.stringify({
					kind: "chat",
					nickname: this.player.nickname,
					message: message,
					location: chat,
					color: this.player.color
				}));
			}
		};
		this.world = {
			eraseRect: (char, startx, starty, endx, endy) => {
				if(typeof char == 'undefined' || typeof startx == 'undefined' || typeof starty == 'undefined' || typeof endx == 'undefined' || typeof endy == 'undefined') {
					console.log('Error: eraceRect ( <str> char, <int> startx, <int> starty, <int> endx, <int> endy )');
					return;
				};
				// loop
				for(let xPos = startx; xPos < endx; xPos++) {
					for(let yPos = starty; yPos < endy; yPos++) {
						// console.log(xPos, yPos);
						this.world.setChar(char, xPos, yPos, 0);
					};
				};
			},
			setChunk: (char, x, y, pix) => {
				if(typeof pix == 'undefined') pix = this.options.chunkSize; // default: 16
				if(typeof char == 'undefined' || typeof x == 'undefined' || typeof y == 'undefined') {
					Chalk.red('Error: setChunk ( <str> char, <int> x, <int> y, <optional> pix )');
					return;
				};
				// start
				let SchunkX = Math.floor(x / pix) * pix;
				let SchunkY = Math.floor(y / (pix / 2)) * pix / 2;
				// end
				let EchunkX = SchunkX + pix;
				let EchunkY = SchunkY + pix / 2;
				// loop
				for(let xPos = SchunkX; xPos < EchunkX; xPos++) {
					for(let yPos = SchunkY; yPos < EchunkY; yPos++) {
						// console.log(xPos, yPos);
						this.world.setChar(char, xPos, yPos, 0);
					};
				};
			},
			protect: (chunkX, chunkY, type) => {
				if(ws.readyState !== 1) return;
				if(!chunkX || !chunkY || !type) return "Not enough arguments.";
				ws.send(JSON.stringify({"kind":"protect","data":{"tileX":chunkX,"tileY":chunkY,"type":type},"action":"protect"}));
			},
			move: (x, y) => {
				if(ws.readyState !== 1) return;
				ws.send(JSON.stringify({"kind":"cursor","position":{"tileX":0,"tileY":1,"charX":0,"charY":1}}));
			},
			setChar: (char, x, y, color) => {
				if(ws.readyState !== 1) return;
				ws.send(JSON.stringify({"kind":"write","edits":[this.utils.calculateCoords(x, y).concat(this.player.color,char,144)]}));
			},
			connect: (world) => {
				let worldToConnect = world || '';
				ws = new WebSocket(this.options.ws);

				let tiles = new Tiles();

				this.world.tiles = tiles;

            	this.emit("connect");
            	ws.onopen = () => {
            		if(!ws) return;
					this.player.joined = true;
					this.emit("join");
            	};
            	ws.onclose = () => {
            		if(!this.options.log) return;
            		this.player.joined = false;
            		this.utils.log("[OWOT.js] Bot disconnected.");
            		this.emit("disconnect");
            	};
            	ws.onmessage = (msg) => {
            		let data = JSON.parse(msg.data);
            		if(data.kind == "chat") this.emit("chat", data);
            		if(data.kind == "tileUpdate") {
            			this.emit("tileUpdate", data);
            			this.world.tiles.Register(data);
            		};
            	};
            	this.ws = ws;
			},
			leave: () => {
				if(ws.readyState !== 1) return;
				ws.close();
				this.emit("close");
				this.player.joined = false;
			}
		};
		this.utils = {
			hexToRgb: (hex) => {
			  	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			  	if(result){
			  	    let r = parseInt(result[1], 16);
			  	    let g = parseInt(result[2], 16);
			  	    let b = parseInt(result[3], 16);
			  	    return [r, g, b];
			  	};
			  	return null;
			},
			getRandomHex: () => {
				return (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
			},
			getRandomInt: (min, max) => {
			  	min = Math.ceil(min);
			  	max = Math.floor(max);
			  	return Math.floor(Math.random() * (max - min)) + min;
			},
			rgbToInt: (r, g, b) => {
				return b | g << 8 | r << 16;
			},
			calculateCoords: (x, y) => {
			    // x-=1;
				return [Math.floor(y / 8), Math.floor(x / 16), y - Math.floor(y / 8) * 8, x - Math.floor(x / 16) * 16];
			},
			getMyChunkPos: () => {
				calculateCoords(truecoords()[0], truecoords()[1]);
			},
			getChunkPos: (x, y) => {
				calculateCoords(x, y);
			},
			getRealPos: () => {
			    let pos = [cursorCoords[0] * 16 + cursorCoords[2], cursorCoords[1] * 8 + cursorCoords[3]];
			    if(!pos[1].toString().startsWith("-")) pos[1] = Math.abs(pos[1]);
			    return pos;
			},
			log: (...toLog) => {
				if(!this.options.log) return;
				if(isBrowser) console.log('%c ' +toLog[0], toLog[1]);
				else Chalk.green(toLog.join(''));
			}
		};
	};
};
if(isBrowser) window.OTS = {
	Client: Client,
	Tiles: Tiles,
	TileSys: TileSys
};
else {
	module.exports = {
		Client: Client,
		Tiles: Tiles,
		TileSys: TileSys
	};
};
