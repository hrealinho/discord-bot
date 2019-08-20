﻿/**
 * My simple discord bot using discord.js.
 * documentation available at https://github.com/hrealinho/discord-bot
 * Discord.js docs at https://discord.js.org/#/docs/
 * Before running invite the bot to your desired server through:
 *  https://discordapp.com/oauth2/authorize?&client_id=610256035730554917&scope=bot&permissions=8
 *
 * @author Henrique Realinho
 */

// TEST SERVER ID 610255655625818122

/** CONFIG **/
const {
  name,
	prefix,
	d_token,
  yt_token,
} = require('./config.json');  // change config.json
/** DEPENDENCIES **/
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const YouTube = require('youtube-node');
const fs = require('fs');
// OTHER PACKAGES
const Utils = require('./Utils/Utils.js');
const actions = require('./modules/actions.js');
//const loadCommands = require('./modules/commands.js');

// Init
const client = new Discord.Client();
client.commands = new Discord.Collection();

const youTube = new YouTube();

/** GLOBAL VARIABLES **/
const receivedMessages = []; // saves received messages

const queue = new Map();

/** CONSTANTS **/
const VOLUME = 4; // volume (1-10)
const AVATAR_URL = __dirname + '/images/discord-logo.jpg';

/*****************************************************************************/

// ON READY
client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    onLoad();
});

function setInfo() {
  if (client.user.username != name) {
    
    // changes username according to config.json file
  client.user.setUsername(username)
    .then(user => console.log(`My new username is ${user.username}`))
    .catch(console.error);
  }
  // set bot status and activity
  //client.user.setAvatar(AVATAR_URL);     // change bot's avatar if you want
  client.user.setStatus('available');
  client.user.setPresence({
      game: {
          name: 'with toilet paper | ' + prefix + 'help'
      }
  });

}

/**
 * Set bot status and fill servers and channels data structures.
 * Changes username according to config.json file. Set a different avatar by
 * uncommenting client.user.setAvatar(AVATAR_URL); and setting
 * your own AVATAR_URL
 */
function onLoad() {
/*  
  const commandFiles = fs.readdirSync('./modules/commands').filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
  }
*/

  setInfo();
  // save servers the bot is connected to
  client.guilds.forEach((guild) => {
    const queueObj = {
      textChannel: null,
      voiceChannel: null,
      connection: null,
      songs: [],
      play: null,
      volume: VOLUME,
      playing: false
    };
    queue.set(guild.id, queueObj);
  });

}

/**
 * Get guild with name name and return the guild
 * @param {string} name
 * @returns Guild
 */
function getGuild(name) {
  client.guilds.forEach( (server) => {
      if (server.name.contains(name)){
        return server;
      }
  });
}

/**
 * Get channel with name name within the given guild and return it
 * @param {string} name -
 * @returns VoiceChannel
 */
function getChannel(name) {
  client.guilds.forEach( (guild) => {
    guild.channels.forEach( (channel) => {
      if (channel.name.contains(name)) {
          return channel;
      }
    })
  });
}

/**
 * Reply to a received message.
 * @param {Message} message - the received message
 */
function reply(message) {
  // store received msgs
  receivedMessages.push(message);

  // send acknowledgement message
  message.react("👍");

  // Get every custom emoji from the server (if any) and react with each one
  message.guild.emojis.forEach(customEmoji => {
      message.react(customEmoji)
      .catch( (err) => {
         if(err) console.log(err);
      });
  });
}

/******************************* ON MESSAGE **********************************/

// ON MESSAGE
client.on('message', (message) => {
  // Prevent bot from responding to its own messages
  if (message.author == client.user) {
      return;
  }
   // check if the bot was tagged in the message
  if (message.content.includes(client.user.toString())) {
      reply(message);
  }
  // check for the prefix and process the command
  if (message.content.startsWith(prefix)) {
      processCommand(message);
  }
});

/** PROCESSING COMMANDS **/

/**
 * Process a command
 * @param {Message} message - Discord.js received message with the command.
 */
function processCommand (message) {
  const fullCommand = message.content.substr(1); // remove the leading exclamation mark
  const splitCommand = fullCommand.split(" "); // split the message up in to pieces for each space
  const primaryCommand = splitCommand[0]; // the first word directly after the exclamation is the command
  const arguments = splitCommand.slice(1); // all other words are arguments/parameters/options for the command

  console.log("Command received: " + primaryCommand);
  console.log("Arguments: " + arguments); // there may not be any arguments
  // execute the command
  execute(primaryCommand, arguments, message);

}

/**************************** CREATING COMMANDS *******************************/
/*
/**
 * Exec COMMANDS
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function execute(primaryCommand, arguments, message) {
    switch (primaryCommand) {
      case 'help':
        helpCommand(arguments, message);
        break;
      case 'multiply':
        multiplyCommand(arguments, message);
        break;
      case 'josue':
        josueCommand(arguments, message);
        break;
      case 'leave':
        leaveCommand(arguments, message);
        break;
      case 'add':
        addSongCommand(arguments, message);
        break;
      case 'skip':
        skipCommand(arguments, message);
        break;
      case 'stop':
        stopCommand(arguments, message);
        break;
      case 'queue':
        playlistCommand(arguments, message);
        break;
      case 'play':
        playCommand(arguments, message);
        break;
      case 'p':
        playCommand(arguments, message);
        break;
      default:
        message.channel.send("I don't understand the command. Try `" + prefix + "help` to get a list of commands or `" + prefix + "josue`. \nPS > este bot é um bico");
    }
}

/**
 *
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function playCommand(arguments, message) {
    if (arguments.length == 0 && Utils.isEmpty(queue.get(message.guild.id).songs) && queue.get(message.guild.id).playing) {
      message.channel.send("Play what?\nAdd a song to a playlist using `" + prefix + "add 'song'` and then use `" + prefix + "play`");
    } else if (!message.member.voiceChannel) {
      message.channel.send("You are not in a voice channel.");
    } else if (queue.get(message.guild.id).playing) {
      // if already playing, add song to queue
      addSong(arguments.toString(), message);
      //actions.add.execute(message, queue, arguments.toString(), queue.get(message.guild.id).channel);
    } else {
      //playSong(arguments, message.guild, message.channel, message.member.voiceChannel);
      actions.play.execute(arguments, queue, message.guild, message.channel, message.member.voiceChannel);
    }
}


/**
 * Add a song to a playlist
 * @param {[string]} arguments -
 * @param {Message} message -
 */
 function addSongCommand(arguments, message) {   // TODO
    if (arguments.length == 0) {
      message.channel.send("Add what?\nUse `" + prefix + "add 'song'`");
    } else {
      const songName = Utils.join(arguments);
      if (!songName) songName = arguments.toString();
      actions.add.execute(message, queue, songName, queue.get(message.guild.id).channel);
      //addSong(songName, message);
    }
}


/**
 * Command to stop playing a song
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function stopCommand(arguments, message) {
    var channel = message.channel;
    // channel.members.forEach( member => { });
    if (queue.get(channel.guild.id).playing) {
      //stopSong(channel.guild);
      actions.stop.execute(channel.guild, queue);
    }
    else {
      console.log("Not playing @ " + channel.guild.name);
      channel.send("Not playing.");
    }
}

/**
 *
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function playlistCommand(arguments, message) {
    actions.queue.execute(message, queue);
    /*
    if (queue.get(message.guild.id).playing) {
      message.channel.send("Now playing:\n - " + queue.get(message.guild.id).play.name + '\n');
    }

    const songs = queue.get(message.guild.id).songs; // songQueue.get(message.guild.id);
    if (!songs || songs == [] || Utils.isEmpty(songs)) {
        message.channel.send("No song in the playlist.");
    }
    else {
        var str = "\n";
        str += "Queue:\n";
        songs.forEach( (song) => {
          str += " - " + song.name + "\n";
        });
        message.channel.send(str);
    }
    */
}

/**
 *
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function skipCommand(arguments, message) {
    var queueObj = queue.get(message.guild.id);
    if (!queueObj.playing && Utils.isEmpty(queueObj.songs)) {
        message.channel.send("Playlist is empty.");
    }
    else {
        const guild = message.guild;
        const channel = queue.get(message.guild.id).channel;
        const voiceChannel = queue.get(message.guild.id).voiceChannel;
        //skipSong(message, guild, message.channel, voiceChannel);
        actions.skip.execute(queue, guild, message.channel, voiceChannel);
    }
}

/**
 * Leave the voice channel the author of the message is in
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function leaveCommand(arguments, message) {
    actions.leave.execute(queue)
  /*
    const queueObj = queue.get(message.guild.id);

    if (!queueObj.channel) return;
    // Leave the voice channel
    queueObj.channel.leave();

    queueObj = {
      textChannel: null,
      voiceChannel: null,
      connection: null,
      songs: [],
      play: null,
      volume: VOLUME,
      playing: false
    };
    queue.set(channel.guild.id, queueObj);
    */
}

/**
 *
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function helpCommand(arguments, message) {
    actions.help.execute(arguments, message.channel);
}
///////////////////////////////////////////////////////////////////////////////

// joined a guild
client.on("guildCreate", guild => {
    console.log("Joined a new guild: " + guild.name);
    // add to data structure
    const queueObj = {
      textChannel: null,
      voiceChannel: null,
      connection: null,
      songs: [],
      play: null,
      volume: VOLUME,
      playing: false
    };
    queue.set(guild.id, queueObj);
})

// removed from a guild
client.on("guildDelete", guild => {
    console.log("Left a guild: " + guild.name);
    //remove guild from map
    queue.delete(guild.id);
})

/*****************************************************************************/

client.once('reconnecting', () => {
 console.log('Reconnecting!');
});

client.once('disconnect', () => {
 console.log('Disconnect!');
});

// DISCORD LOGIN
client.login(d_token).catch( (e) => {
  console.log('Error logging into discord');
  console.log(e);
});
// YOUTUBE API KEY
youTube.setKey(yt_token);

module.exports = client;
