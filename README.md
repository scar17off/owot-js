# owot-js - OTS

## Installing
`npm i owot-js`  
REQUIRES NODE.JS 12.0+!  
![Nodejs](https://img.shields.io/badge/-Node.js%2012.0%2B-brightgreen?style=for-the-badge&logo=node.js&labelColor=1a1a1a)
# Example
```js
const OWOTjs = require('owot-js');

var bot = new OWOTjs.Client(<object> options);
bot.world.connect(<string> world);

bot.on('join', () => {
    bot.chat.send('Hello World!');
});
```
# Events
`connect` - connecting to websocket  
`join` - joined  
`chat` - new message [message Object]  
`tileUpdate` - tile updates [updates]  
`close` - websocket closed  
`disconnect` - websocket closed (by server)
# Options
`origin` - origin (default: `https://ourworldoftext.com/`)  
`ws` - ws url (default: `wss://ourworldoftext.com/ws/`)  
`nickname` - client nickname  
`world` - world  
`color` - color  
`log` - logging events
