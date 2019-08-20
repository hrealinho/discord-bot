# Discord Bot
**NOT READY FOR PRODUCTION** 
 Simple song playing discord bot to test some APIs using discord.js to interact with the Discord API.
 Yes, the code _does_ suck.
 Currently using youtube to play the songs.

 ## FEATURES:
 - custom prefix
 - youtube playing with song queue

TODO >
 - stop ???,
 - skip ???
 - add Next feature
 - refactoring ...
 - Custom Commands

WORKING >
 - play song
 - handle playing multiple servers at once
 - queue
 - leave
 - custom prefix ..

## Dependencies
```JSON
"dependencies": {
  "discord.js": "^11.5.1",
  "ffmpeg": "0.0.4",
  "fs": "0.0.1-security",
  "nodemon": "^1.19.1",
  "opusscript": "0.0.7",
  "performance-now": "^2.1.0",
  "pm2": "^3.5.1",
  "youtube-node": "^1.3.0",
  "ytdl-core": "^0.29.5"
}
```

## DOCS

## Installation
 - install npm (https://www.npmjs.com/get-npm);
 - navigate to project root directory;
 - `$ npm install ffmpeg`;
 - `$ npm install opusscript`;
 - `$ npm install`;

## Running
 - `$ npm start`

## Running for production
- `$ npm run production`  uses pm2 (http://pm2.keymetrics.io/) 

## Running for development
  - `$ npm run dev`  uses nodemon (https://nodemon.io/) 

## Usage
(create your application and bot at https://discordapp.com/developers/applications/ first)
 - Set the tokens and desired prefix for the bot's commands
 as well as the bot name in the `config.json` file. Default prefix is `!`.
 To get the necessary tokens check https://discordapp.com/developers/docs/intro
 - Invite the bot to your server through this link (changing to your client id): 
https://discordapp.com/oauth2/authorize?&client_id=CLIENT_ID&scope=bot&permissions=8
 - Run the bot.
 - The bot has now joined your server and is ready to be used.

 ## Bot commands
 - `help`
 - `play`
 - `stop`
 - `add <song>`
 - `skip`
 - ...


Check discord.js docs (https://discord.js.org/#/docs/) to add to the code or change it.
