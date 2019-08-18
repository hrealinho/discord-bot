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


// Init
const client = new Discord.Client();
const youTube = new YouTube();

/** GLOBAL VARIABLES **/
var receivedMessages = []; // saves received messages

//var songQueue = new Map(); // song queue for each guild
//var playing = new Map(); // map of songs playing for each guild
//var play = new Map();

var queue = new Map();

/** CONSTANTS **/
const VOLUME = 4; // volume (1-10)
const AVATAR_URL = __dirname + '/images/discord-logo.jpg';

/*****************************************************************************/

// ON READY
client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    if (client.user.username != name) {
      setUsername(name);
    }
    onLoad();
});

function setUsername(username) {
    // Set username
  client.user.setUsername(username)
    .then(user => console.log(`My new username is ${user.username}`))
    .catch(console.error);
}

/**
 * Set bot status and fill servers and channels data structures.
 * Changes username according to config.json file. Set a different avatar by
 * uncommenting client.user.setAvatar(AVATAR_URL); and setting
 * your own AVATAR_URL
 */
function onLoad() {
    // set bot status and activity
    //client.user.setAvatar(AVATAR_URL);     // change bot's avatar if you want
    client.user.setStatus('available');
    client.user.setPresence({
        game: {
            name: 'with toilet paper | ' + prefix + 'help'
        }
    });
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
    let fullCommand = message.content.substr(1); // remove the leading exclamation mark
    let splitCommand = fullCommand.split(" "); // split the message up in to pieces for each space
    let primaryCommand = splitCommand[0]; // the first word directly after the exclamation is the command
    let arguments = splitCommand.slice(1); // all other words are arguments/parameters/options for the command

    console.log("Command received: " + primaryCommand);
    console.log("Arguments: " + arguments); // there may not be any arguments
    // execute the command
    execute(primaryCommand, arguments, message);
}

/**************************** CREATING COMMANDS *******************************/

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
      message.channel.send("Already playing.\nAdd to playlist with `add <song>`");
    } else {
      playSong(arguments, message.guild, message.channel, message.member.voiceChannel);
    }
}

/**
 * Plays a song
 * Changes play, playing and queue data structures
 * @param {Guild} guild -
 * @param {Channel} channel -
 * @param {VoiceChannel} voiceChannel -
 */
function playSong(arguments, guild, channel, voiceChannel) {    // TODO
    var song;
    // song queue for this server
    const serverQueue = queue.get(guild.id).songs;

   if (queue.get(guild.id).playing) {
      return;
    }
    else if (arguments.length > 0 && (!serverQueue || Utils.isEmpty(serverQueue))) {      // TODO
      //channel.send("`" + prefix + "play` has no arguments.\nAdd songs using `" + prefix + "add 'song'`");
      getSong(arguments.toString(), channel, (songObj) => {
        song = songObj;
      }).then(
      console.log(song));
    }
    else if (serverQueue) {
      song = serverQueue.shift(); // song is a object with the song name and url
    }
    else { // lul
      song = serverQueue.shift();
    }

    // youtube search: https://www.youtube.com/results?search_query=QUERY
    // youtube watch video by id: https://www.youtube.com/watch?v=VIDEOID

    join(voiceChannel , function (connection) {
      // joined voice channel (or client was already in the voice channel)
      const queueObj = {
        textChannel: channel,
        voiceChannel: voiceChannel,
        connection: connection,
        songs: serverQueue,
        play: song,
        volume: 5,
        playing: true
      };
      queue.set(channel.guild.id, queueObj);

      console.log("Now playing: " + song.name + " in " + song.url);
      channel.send("Now playing: " + song.name);

      // dispatcher to play the url using ytdl
      const dispatcher = connection.playStream(ytdl(song.url.toString()))
      .on('end', () => { // TODO
        console.log('Music ended!');
        if (Utils.isEmpty(queue.get(guild.id).songs)) {
            console.log("Empty queue @ " + guild.name);
            channel.send("Playlist is empty.");
            return ;
        }
        playSong(arguments, guild, channel, voiceChannel);
      })
      .on('error', error => {  // play stream error
        queue.get(guild.id).playing = false;
        console.error(error);
      });
      dispatcher.setVolume(VOLUME/10);
    });
}

/**
 * Join the voice channel and execute callback
 * @param {VoiceChannel} voiceChannel -
 * @param {function} callback -
 */
function join(voiceChannel, callback) {
    var channel = voiceChannel;

    if (!channel) return console.error("The channel does not exist!");
    channel.join()
        .then( connection => {
        // worked
        console.log("Successfully connected. @ " + channel.guild.name);
        callback(connection);
    }).catch(e => {
        // errored, log it to console
        console.error(e);
    });
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
      addSong(songName, message);
    }
}

/**
 *
 * @param {string} songName -
 * @param {Message} message -
 */
function addSong(songName, message) {
  var ytVideoId, videoUrl, song;

  getSong(songName, message.channel, function (song) {
    queue.get(message.guild.id).songs.push(song);
    // TODO
    console.log("Added song " + song.name + " to playlist @ " + message.guild.name);
    message.channel.send("Added song " + song.name + " to playlist.");
  });
}

/**
 *
 * @param {string} songName -
 * @param {Channel} channel -
 * @param {function} callback -
 * @returns Song
 */
function getSong(songName, channel, callback) {        // TODO
  var videoId, videoUrl;
  var name;
  // search for the song in youtube and get the first result to appear
  youTube.search(songName, 1, function(error, result) {
    if (error) {
      console.log(error);
    }
    else {
      //console.log(JSON.stringify(result, null, 2));
      if (!result || !result.items[0]) {
          channel.send("No song found.");
          return;
      }
      // get video id from first result on the search
      videoId = result.items[0].id.videoId;
      if (!videoId) {
          channel.send("No song  found.");
          return;
      }
      name = result.items[0].snippet.title;
      // build youtube video url
      videoUrl = 'https://youtube.com/watch?v=' + videoId;
      song = {
          name: name,
          url: videoUrl
      };
      console.log(song);
      callback(song);
      return song;
    }
  });
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
      stopSong(channel.guild);
    }
    else {
      console.log("Not playing @ " + channel.guild.name);
      channel.send("Not playing.");
    }
}

/**
 * Stop playing a song in a given guild.
 * @param {Guild} guild - the guild in which to stop the playing song
 */
function stopSong(guild) {  // TODO
    if (!queue.get(guild.id).playing) return;

    const dispatcher = queue.get(guild.id).connection.dispatcher;
    dispatcher.end();
    queue.get(guild.id).playing = false;
    queue.get(guild.id).play = null;
}

/**
 *
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function playlistCommand(arguments, message) {
    if (queue.get(message.guild.id).play) {
      message.channel.send("Now playing:\n - " + playing.get(message.guild.id).name + '\n');
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
}

/**
 *
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function skipCommand(arguments, message) {
    if (Utils.isEmpty(queue.get(message.guild.id).songs))
        message.channel.send("Playlist is empty.");
    else {
        const guild = message.guild;
        const channel = queue.get(message.guild.id).channel;
        const voiceChannel = queue.get(message.guild.id).voiceChannel;
        skipSong(arguments, message, guild, channel, voiceChannel);
    }
}

/**
 *
 * @param {[string]} arguments -
 * @param {Guild} guild -
 * @param {Channel} channel -
 * @param {VoiceChannel} voiceChannel -
 */
function skipSong(arguments, guild, channel, voiceChannel) {
  // NOT WORKING - skips every song and empties playlist TODO
    var queueObj = queue.get(guild.id);
    if (!queueObj) return;
    if (queueObj.playing) { // if its playing in the guild
      queueObj.connection.dispatcher.end();
    }
    else { // if its not playing in the guild at the moment
      queueObj.songs.shift();
    }
    console.log("Skipping song. @ " + channel.guild.name);
    channel.send("Skipped.");
}

/**
 * Leave the voice channel the author of the message is in
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function leaveCommand(arguments, message) {
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
}

/**
 *
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function helpCommand(arguments, message) {
    actions.help.execute(arguments, message.channel)
      .then(
        console.log('help command served')
      );
}
///////////////////////////////////////////////////////////////////////////////

function josueCommand(arguments, message) {
    // send a msg to a channel
   var spamChannel = message.channel;
    spamChannel.send("Fuck!\nYou can play me, soon.");
// post img or file to a channel
    // Provide a path to a local file
    //const localFileAttachment = new Discord.Attachment(__dirname + '/data/image.png');
    //spamChannel.send(localFileAttachment);

    // URL to a file
    const webAttachment = new Discord.Attachment('http://hd.wallpaperswide.com/thumbs/iron_man_3-t2.jpg');
    spamChannel.send(webAttachment);
}

// joined a guild
client.on("guildCreate", guild => {
    console.log("Joined a new guild: " + guild.name);
    // add to data structures
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
    //remove guild
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
