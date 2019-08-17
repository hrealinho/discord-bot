# Discord Bot
**NOT READY FOR PRODUCTION**
 Simple song playing discord bot

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

## Installation:
 - install npm (https://www.npmjs.com/get-npm);
 - navigate to project root directory;
 - `$ npm install ffmpeg`; [ or `$ choco install ffmpeg` if on windows (install
   choco first https://chocolatey.org/install) ]
 - `$ npm install opusscript`;
 - `$ npm install`;

## Running:
 - `$ npm start`

## Running for production:
- `$ npm run production` [ uses pm2 (http://pm2.keymetrics.io/) ]

## Running for development:
  - `$ npm run dev` [ uses nodemon (https://nodemon.io/) ]

## Usage:
 - Invite the bot to your server through this link: https://discordapp.com/oauth2/authorize?&client_id=610256035730554917&scope=bot&permissions=8
 - Set the tokens and desired prefix for the bot's commands
 as well as the bot name in the `config.json` file. Default prefix is `!`.
 To get the necessary tokens check https://discordapp.com/developers/docs/intro
 - Run the bot.
 - The bot has now joined your server and is ready to be used.

 ## Commands
 - `help`
 - `play`
 - `stop`
 - `add <song>`
 - `skip`
 - ...


Check discord.js docs (https://discord.js.org/#/docs/)
