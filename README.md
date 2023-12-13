# owot-js - OTS

## Installing
`npm i owot-js`  
REQUIRES NODE.JS 12.0+!  
![Nodejs](https://img.shields.io/badge/-Node.js%2012.0%2B-brightgreen?style=for-the-badge&logo=node.js&labelColor=1a1a1a)
# Example
```js
const OWOTjs = require('owot-js');

var bot = new OWOTjs.Client(<object> options);

bot.on("join", () => {
    bot.chat.send('Hello World!');
});
```
# Events
`open` - WebSocket opened  
`close` - WebSocket closed  
`chat` - New message in chat [message Object]  
`tileUpdate` - New tile updates [updates]  
`fetch` - New fetched tiles [tile]  
`join` - Joined and got id [id, channel]
# Options
`origin` - origin (default: `https://ourworldoftext.com/`)  
`ws` - ws url (default: `wss://ourworldoftext.com/ws/`)  
`nickname` - client nickname  
`world` - world  (default: `main`)  
`token` - uvias token
# Module
### Requiring the library returns an object with:  
`Client` - main OTS Client class  
`CharRate` - CharRate class for quota  
`Tiles` - TileSystem instance  
`TileSystem` - Class for tiles, char management
# API
## Client

### Client.player
- `nickname`
- `color`
- `id`
- `channel`
- `tileX`
- `tileY`
- `charX`
- `charY`
- `quota`

### Client.chat
#### **Client.chat.send(msg)**
Send message in chat

### Client.world
#### **Client.world.getTile(tileX, tileY)**
Get tile data.
#### **Client.world.getChar(tileX, tileY, charX, charY)**
Get tile data.
#### **Client.world.getCharXY(charX, charY)**
Get char by XY
#### **Client.world.requestRectangle(minX, minY, maxX, maxY)**
Request rectangle area and store characters to TileSystem
#### **Client.world.requestTileXY(tileX, tileY)**
Request tile by XY, store data to TileSystem and return data
#### **Client.world.move(tileX, tileY, charX, charY)**
Move client to position
#### **Client.world.moveXY(charX, charY)**
Move client to char XY
#### **Client.world.writeChar(char, color, tileX, tileY, charX, charY)**
Write character
#### **Client.world.writeCharXY(char, color, charX, charY)**
Write character to XY
#### **Client.world.writeString(str, color, startTileX, startTileY, startCharX, startCharY)**
Write string
#### **Client.world.writeStringXY(str, color, charX, charY)**
Write string to XY
#### **Client.world.protectTile(type, tileX, tileY)**
Protect tile. You need to be an owner to use this
#### **Client.world.leave()**
Leave world
#### **Client.world.userCount**
Users in world

### Client.util
#### **Client.util.rgbToInt(r, g, b)**
Convert rgb to int
#### **Client.util.convertXY(x, y)**
Convert char XY to position
#### **Client.util.getCursorPosition()**
Get current cursor position. Browser only

### TileSystem
#### **TileSystem.wrapStringTo16x16(inputString)**
Wrap string to 16x16 grid
#### **TileSystem.getChar(x, y, chunk)**
Get char at XY in specified tile data
#### **TileSystem.getTile(tileX, tileY)**
Get tile data
#### TileSystem.tiles
Object of every loaded tile
