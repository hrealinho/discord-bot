# Discord Bot
**NOT READY FOR PRODUCTION**
 Simple song playing discord bot to test some APIs using discord.js to interact with the Discord API.
 Yes, the code _does_ suck.
 Currently using youtube to play the songs.

 ## FEATURES:

TODO >
 - leave
 - add Next feature
 - refactoring ...
 - tests
 - custom prefix for each guild

WORKING >
 - play song
 - skip a song
 - stop ???,
 - change the volume
 - handle playing multiple servers at once
 - queue
 - ban command if role are admin

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

## Installation:
 - install npm (https://www.npmjs.com/get-npm);
 - navigate to project root directory;
 - `$ npm install ffmpeg`
 - `$ npm install opusscript`
 - `$ npm install`

## Running:
 - `$ npm start`

## Running for production:
- `$ npm run production`  uses pm2 (http://pm2.keymetrics.io/)

## Running for development:
  - `$ npm run dev`  uses nodemon (https://nodemon.io/)

## Usage:
 - To create a discord application and a bot (and get the necessary tokens) check https://discordapp.com/developers/docs/intro
 - Invite the bot to your server through this link: https://discordapp.com/oauth2/authorize?&client_id=CLIENT_ID&scope=bot&permissions=8
 - Set the tokens and desired prefix for the bot's commands
 as well as the bot name in the `config.json` file. Default prefix is `!`.
 - Run the bot. (see running above)

 ## Commands
 - Command files are stored at /src/modules/commands
 - To add a command just create a file `command.js` in the commands folder and export an object containing:
```JavaScript
{
  name: 'command name' e.g. 'quit'
  usage: 'command usage'  (optional)
  description: 'string describing what the command does'  (optional)
  cooldown: number  // cooldown between calls for this cmd
  args: true if the command needs args, false otherwise   (optional)
  guildOnly: true if the command is not supposed to run if invocated from a dm (optional)
  execute(args, message, queue) { // queue is a Map with Objects described below, message is a Message Object from Discord.js docs and args are the commands arguments if any
    // your command's code
  }
}
```

- The queue Map [declared at `discord-bot.js`] has an Object like this for each guild: (so you can use `queue.get(guild.id)` to get the queue Object for that guild)

```JavaScript
{
  textChannel: null,    // Channel object to send messages to in this guild
  voiceChannel: null,   // VoiceChannel object to join and play in in this guild
  connection: null,     // the Connection object for that guild
  songs: [],            // song queue
  play: null,           // song currently playing (Object with name and youtube url (both strings)
  volume: 0,            // volume (number from 1-10)
  playing: false        // true if playing at the moment, false otherwise
}
```


Check discord.js docs (https://discord.js.org/#/docs/) to understand and add to the code or change it.
