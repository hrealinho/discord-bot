# Discord Bot
**NOT READY FOR PRODUCTION** 
 Simple song playing discord bot to test some APIs. Yes, the code _does_ suck.
 Currently using youtube to play the songs.

 ## FEATURES:
 - custom prefix
 - youtube playing with song queues

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
 - Set the tokens and desired prefix for the bot's commands
 as well as the bot name in the `config.json` file. Default prefix is `!`.
 To get the necessary tokens check https://discordapp.com/developers/docs/intro
(create your application and bot)
 - Invite the bot to your server through this link: https://discordapp.com/oauth2/authorize?&client_id=CLIENT_ID&scope=bot&permissions=8
(with your client id)
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
