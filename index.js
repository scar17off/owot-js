const EventEmitter = require("events");
const WebSocket = require("ws");
const Chalk = require("chalk");

class OWOTjs {
	constructor(options = {}){
		var ws;
		var OTS = this;
		OTS.EE = new EventEmitter();

		OTS.player = {
			color: 0,
			rank: 0,
			id: 0,
			x: 0,
			y: 0
		};
		OTS.options = {
			origin: options.origin,
			ws: options.ws,
			chunkSize: 16,
			playerJoined: false,
			nickname: options.nickname,
			log: false
		};
		if(!OTS.options.world) OTS.options.world = '';
		if(!OTS.options.color) OTS.options.color = "0";
		if(!OTS.options.log) OTS.options.log = true;
		if(!OTS.options.origin) OTS.options.origin = "https://ourworldoftext.com/";
		if(!OTS.options.ws) OTS.options.ws = "wss://ourworldoftext.com/ws/";
		OTS.chat = {
			setNickname: (nickname) => {
				if(ws.readyState !== 1) return;
				ws.send(JSON.stringify({
					kind: "chat",
					nickname: OTS.player.nickname,
					message: "/nick "+nickname,
					location: "page",
					color: OTS.options.color
				}));
				OTS.player.nickname = nickname
			},
			send: (message, globalChat) => {
				if(ws.readyState !== 1) return;
				let chat;
				if(globalChat == true) {chat = "global"} else if(globalChat == false) {chat = "page"} else {chat = "page"};
				ws.send(JSON.stringify({
					kind: "chat",
					nickname: OTS.player.nickname,
					message: message,
					location: chat,
					color: OTS.options.color
				}));
			}
		};
		OTS.world = {
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
				ws.send(JSON.stringify({"kind":"write","edits":[calculatecoords(x, y).concat(OTS.player.color,char,144)]}));
			},
			connect: (world) => {
				let worldToConnect = world || '';
				ws = new WebSocket(OTS.options.ws);
            	OTS.EE.emit("connect");
            	ws.onopen = () => {
            		if(!ws) return;
					OTS.player.joined = true;
					OTS.EE.emit("join");
            	};
            	ws.onclose = () => {
            		OTS.player.joined = false;
            		if(OTS.options.log) console.log("[OWOT.js] Bot disconnected.");
            		OTS.EE.emit("disconnect");
            	};
            	ws.onmessage = (msg) => {
            		let data = JSON.parse(msg.data);
            		if(data.kind == "chat") OTS.EE.emit("chat", data);
            		if(data.kind == "tileUpdate") OTS.EE.emit("tileUpdate", data);
            	};
            	OTS.ws = ws;
			},
			leave: () => {
				if(ws.readyState !== 1) return;
				ws.close();
				OTS.EE.emit("close");
				OTS.player.joined = false;
			}
		};
		OTS.on = (event, callback) => {
			if(!event || !callback) return "Not enough arguments.";
			OTS.EE.on(event, callback);
		};
		OTS.utils = {
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
			    x-=1;
				return [Math.floor(y / 8), Math.floor(x / 16), y - Math.floor(y / 8) * 8, x - Math.floor(x / 16) * 16];
			},
			getMyChunkPos: () => {
				calculatecoords(truecoords()[0], truecoords()[1]);
			},
			getChunkPos: (x, y) => {
				calculatecoords(x, y);
			},
			getRealPos: () => {
			    let pos = [cursorCoords[0] * 16 + cursorCoords[2], cursorCoords[1] * 8 + cursorCoords[3]];
			    if(!pos[1].toString().startsWith("-")) pos[1] = Math.abs(pos[1]);
			    return pos;
			},
			log: (toLog) => {
				if(OTS.options.log) console.log(Chalk.green(toLog));
			}
		};
	};
};
module.exports = {
	Client: OWOTjs
};