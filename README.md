# owot-js - OTS

## Installing
`npm i owot-js`  
REQUIRES NODE.JS 12.0+!  
![Nodejs](https://img.shields.io/badge/-Node.js%2012.0%2B-brightgreen?style=for-the-badge&logo=node.js&labelColor=1a1a1a)
# Example
```js
const OWOTjs = require("owot-js");
var bot = new OWOTjs.Client();

bot.on("join", () => {
    bot.chat.send("Hello World!");
});
```
# Events
`open` - WebSocket opened  
`close` - WebSocket closed  
`chat` - New message in chat [message Object]  
`tileUpdate` - New tile updates [updates]  
`fetch` - New fetched tiles [tile]  
`join` - Joined and got id [id, channel]  
`chathistory` - Got chat history [global, page]
# Options
`origin` - origin (default: `https://ourworldoftext.com/`)  
`ws` - ws url (default: `wss://ourworldoftext.com/ws/`)  
`nickname` - client nickname  
`world` - world  (default: `main`)  
`token` - uvias token  
`log` - logging enabled or not (default: `true`)  
`hide` - hide user from the online users (default: `false`)
# Module
### Requiring the library returns an object with:  
`Client` - main client class  
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

### Client.net
#### **WebSocket Client.net.ws**
WebSocket connection.
#### **Client.net.sendWrite(array edits)**
Send writes request.
#### **array Client.net.writeBuffer**
Buffer for writes.
#### **int Client.net.writeSize**
Size of string chunks when sending writes.
#### **Client.net.flushWrites()**
Forced writes flushing.
#### **Client.net.setFlushInterval(int newInterval)**
Set the interval for flushing writes at specified interval in milliseconds.

### Client.chat
#### **Client.chat.send(msg, global = false)**
Sends a chat message.

### Client.world
#### **array Client.world.getTile(int tileX, int tileY)**
Request the content of a tile.
#### **object Client.world.getChar(int tileX, int tileY, int charX, int charY)**
Retrieves the character. Returns { char: ' ', color: 0 }
#### **Promise Client.world.requestRectangle(int minX, int minY, int maxX, int maxY)**
Request content within a specified rectangular region.
#### **bool Client.world.move(int tileX, int tileY, int charX, int charY)**
Update the cursor position and move the player accordingly.
#### **bool Client.world.writeChar(string char = ' ', color, int tileX, int tileY, int charX, int charY)**
Write a character.
#### **string Client.world.getString(int x, int y, int len)**
Get string from x, y to x+len, y.
#### **bool Client.world.writeString(string str = ' ', int color, int startTileX, int startTileY, int startCharX, int startCharY)**
Write a string.
#### **bool Client.world.protectTile(string type, int tileX, int tileY)**
Protect tile. You need to be an owner to use this.
#### **object Client.world.createEditItem(string char = ' ', int tileX, int tileY, int charX, int charY, string data = '')**
Create edit item.

#### **Client.world.leave()**
Leave world.
#### **int Client.world.userCount**
Users in world.

### Client.util
#### **array Client.util.chunkifyString(string message, int quota)**
Chunkify string ensuring the quota.
#### **int Client.util.rgbToInt(int r, int g, int b)**
Convert rgb to int.
#### **Array Client.util.convertXY(int x, int y)**
Convert char XY to position.
#### **Array Client.util.getCursorPosition()**
Get current cursor position. Browser only.

### TileSystem
#### **array Client.world.wrapStringTo16x16(string inputString, Array color)**
Wraps a given input string into a 16x16 grid represented as a 2D array.
#### **object TileSystem.getChar(int x, int y, array chunk)**
Gets the character. Returns: { char: ' ', color: 0 }
#### **array TileSystem.getTile(int tileX, int tileY)**
Retrieves the tile.
#### **TileSystem.saveTile(tileX, tileY)**
Saves a tile with the given key and content.
#### TileSystem.tiles
Object of every fetched tile.
