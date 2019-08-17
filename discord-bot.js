/**
 * My simple discord bot using discord.js.
 * documentation available at https://github.com/hrealinho/discord-bot
 * Discord.js docs at https://discord.js.org/#/docs/
 * Before running invite the bot to your desired server through:
 *  https://discordapp.com/oauth2/authorize?&client_id=610256035730554917&scope=bot&permissions=8
 *
 * @author Henrique Realinho
 */

/** DEPENDENCIES **/
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const YouTube = require('youtube-node');
const fs = require('fs');
// OTHER PACKAGES
const {
  name,
	prefix,
	d_token,
  yt_token
} = require('./config.json');  // change config.json
const Utils = require('./Utils/Utils.js');

// Init
const bot = new Discord.Client();
const youTube = new YouTube();

/** GLOBAL VARIABLES **/
var servers = []; // connected servers
var channels = []; // available channels within the connected servers
var receivedMessages = []; // saves received messages
const channelQueue = new Map(); // queue of channels to play into
var songQueue = new Map(); // song queue for each guild
var playing = new Map(); // map of songs playing for each guild
var play = new Map();


/** CONSTANTS **/
const VOLUME = 0.4; // volume in percentage

/*****************************************************************************/

// ON READY
bot.on('ready', () => {
    console.log("Connected as " + bot.user.tag);
    onLoad();
});

/**
 * Set bot status and fill servers and channels data structures.
 *
 */
function onLoad() {
    // set bot status and activity
    //bot.user.setAvatar('url');
    bot.user.setStatus('available');
    bot.user.setPresence({
        game: {
            name: 'with toilet paper | ' + prefix + 'help'
        }
    });
    // save servers the bot is connected to
    bot.guilds.forEach((guild) => {
        const server = {
          name: guild.name,
          guild: guild
        }
        servers.push(server);
        play.set(guild.id, false);
        playing.set(guild.id, []);
        songQueue.set(guild.id, []);
        channelQueue.set(guild.id, []);
        // list and save all channels
        guild.channels.forEach((channel) => {
            const channelObj = {
              name: channel.name,
              channel: channel
            }
            channels.push(channelObj);
        })
    })
}

/**
 * Get guild with name name
 * @param {string} name
 */
function getGuild(name) {
    bot.guilds.forEach( (server) => {
          if (server.name.equals(name)){
            return server;
          }
      });
    servers.forEach( (server) => {
        if (server.name.contains(name)){
          return server;
        }
    });
}

/**
 * Get channel with name name within the given guild
 * @param {Guild} guild -
 * @param {string} name -
 */
function getChannel(guild, name) {
    guild.channels.forEach( (channel) => {
        if (channel.name.equals(name)){
          return channel;
        }
    });

    channels.forEach( (channel) => {
      if (channel.name.contains(name)) {
          return channel;
      }
    });
}

/**
 * Reply to a received message.
 * @param {Message} message - the received message
 */
function reply(message) {
    // send acknowledgement message
   // receivedMessage.channel.send("Message received from " + receivedMessage.author.toString() + ": " + receivedMessage.content);

    message.react("👍");

    // Get every custom emoji from the server (if any) and react with each one
    message.guild.emojis.forEach(customEmoji => {
        //console.log(`Reacting with custom emoji: ${customEmoji.name} (${customEmoji.id})`);
        message.react(customEmoji).catch( (err) => {
           if(err) console.log(err);
        });
    });
    // If you know the ID of the custom emoji you want, you can get it directly with:
    // let customEmoji = receivedMessage.guild.emojis.get(emojiId)

    // store received msgs
    message.push(message);
}

/******************************* ON MESSAGE **********************************/

// ON MESSAGE
bot.on('message', (message) => {
    // Prevent bot from responding to its own messages
    if (message.author == bot.user) {
        return;
    }
     // check if the bot was tagged in the message
    if (message.content.includes(bot.user.toString())) {
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
    let fullCommand = message.content.substr(1); // Remove the leading exclamation mark
    let splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
    let primaryCommand = splitCommand[0]; // The first word directly after the exclamation is the command
    let arguments = splitCommand.slice(1); // All other words are arguments/parameters/options for the command

    console.log("Command received: " + primaryCommand);
    console.log("Arguments: " + arguments); // There may not be any arguments
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
    if (primaryCommand == "help") {
        helpCommand(arguments, message);
    } else if (primaryCommand == "multiply") {
        multiplyCommand(arguments, message);
    } else if (primaryCommand == "josue") {
        josueCommand(arguments, message);
    } else if (primaryCommand == "leave") {
        leaveCommand(arguments, message);
    } else if (primaryCommand == "add") {
        addSongCommand(arguments, message);
    } else if (primaryCommand == "skip") {
        skipCommand(arguments, message);
    } else if (primaryCommand == "stop") {
        stopCommand(arguments, message);
    } else if (primaryCommand == "queue") {
        playlistCommand(arguments, message);
    } else if (primaryCommand == "play") {
        playCommand(arguments, message);
    } else {
        message.channel.send("I don't understand the command. Try `" + prefix + "help` to get a list of commands or `" + prefix + "josue`. \nPS > este bot é um bico");
    }
}

/**
 *
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function playCommand(arguments, message) {
    if (arguments.length == 0 && Utils.isEmpty(songQueue.get(message.guild.id)) && play.get(message.guild.id)) {
        message.channel.send("Play what?\nAdd a song to a playlist using `" + prefix + "add 'song'` and then use `" + prefix + "play`");
    } else if (!message.member.voiceChannel) {
         message.channel.send("You are not in a voice channel.");
    } else if (play.get(message.guild.id)) {
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
    const serverQueue = songQueue.get(guild.id);

   if (play.get(guild.id)) {
      voiceChannel.connection.dispatcher.setVolume(VOLUME);
      return;
    }
    else if (arguments.length > 0 && !serverQueue) {      // TODO
        //channel.send("`" + prefix + "play` has no arguments.\nAdd songs using `" + prefix + "add 'song'`");
        getSong(arguments.toString(), channel, (songObj) => {
          song = songObj;
        });
    }
    else if (serverQueue){
      song = serverQueue.shift(); // song is a object with the song name and url
    }
    else { // lul
      song = serverQueue.shift();
    }

    // voice channel to be played on
    if (!song) {
		    channelQueue.delete(voiceChannel.id);
        songQueue.delete(guild.id);
		    return;
	  }
    // youtube search: https://www.youtube.com/results?search_query=QUERY
    // youtube watch video by id: https://www.youtube.com/watch?v=VIDEOID

    join(voiceChannel , function (connection){
      // joined voice channel (or client was already in the voice channel)
      play.set(guild.id, true);
      channelQueue.set(guild.id, voiceChannel);
      playing.set(guild.id, song);   // set playing song

      console.log("Now playing: " + song.name + " in " + song.url);
      channel.send("Now playing: " + song.name);

      const dispatcher = connection.playStream(ytdl(song.url.toString()))
      .on('end', () => { // TODO
        //  play.set(guild.id, false);
          console.log('Music ended!');
          if (Utils.isEmpty(songQueue.get(guild.id))) {
              console.log("Empty queue @ " + guild.name);
              channel.send("Playlist is empty.");
              return ;
          }
          playSong(arguments, guild, channel, voiceChannel);
      })
      .on('error', error => {  // play stream error
          play.set(guild.id, false);
          console.error(error);
      });

      dispatcher.setVolume(VOLUME);
     // dispatcher.setVolumeLogarithmic(voiceChannel.volume / 5);
    });
}

/**
 * Join the voice channel and execute callback
 * @param {VoiceChannel} voiceChannel -
 * @param {function} callback -
 */
function join(voiceChannel, callback) {
    var channel = voiceChannel;
    channelQueue.set(channel.id, channel);

    if (!channel) return console.error("The channel does not exist!");
    channel.join()
        .then( connection => {
        // worked
        console.log("Successfully connected.");
        console.log("Successfully connected. @ " + voiceChannel.guild.name);
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
    }
    else {
        const songName = Utils.join(arguments);
        addSong(songName, message);
        if (play.get(message.guild.id) == true && message.member.voiceChannel) {
          playSong(arguments, message.guild, message.channel, message.member.voiceChannel);
        }
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
      // if queue for the channel is empty
      songQueue.get(message.guild.id).push(song);
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
          }
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
   if (play.get(channel.guild.id)) {
      stopSong(channel.guild);
    }
    else {
      console.log('Not playing @ ' + channel.guild.name);
      channel.send("Not playing.");
    }
}

/**
 * Stop playing a song in a given guild.
 * @param {Guild} guild - the guild in which to stop the playing song
 */
function stopSong(guild) {  // TODO
    play.set(guild.id, false);

    const channel = channelQueue.get(guild.id);
    const dispatcher = channel.connection.dispatcher;
    dispatcher.setVolume(0);
}

/**
 *
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function playlistCommand(arguments, message) {
    if (play.get(message.guild.id) == true) {
      message.channel.send("Now playing:\n - " + playing.get(message.guild.id).name + '\n');
    }

    const songs = songQueue.get(message.guild.id);
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
    if (Utils.isEmpty(songQueue.get(message.guild.id)))
        message.channel.send("Playlist is empty.");
    else {
        const guild = message.guild;
        const channel = message.channel;
        const voiceChannel = channelQueue.get(message.guild.id);
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
    if (play.get(guild.id)) { // if its playing in the guild
        play.set(guild.id, false);
        playSong(arguments, guild, channel, voiceChannel);
    }
    else { // if its not playing in the guild at the moment
        songQueue.get(channel.guild.id).shift();
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
    var channel = message.member.voiceChannel;

    play.set(channel.guild.id, false);
    playing.set(channel.guild.id, []);
    songQueue.set(channel.guild.id, []);
    channelQueue.set(channel.id, []);

    if (!channel) return;

    // Leave the voice channel
    channel.leave();
}


/**
 *
 * @param {[string]} arguments -
 * @param {Message} message -
 */
function helpCommand(arguments, message) {
    if (arguments.length > 0) {
        //receivedMessage.channel.send("It looks like you might need help with " + arguments)
    } else {
        //receivedMessage.channel.send("I'm not sure what you need help with. Try `" + prefix + "help [topic]`")
    }

    var str = "COMMANDS:\n";
    str += "`" + prefix + "add 'song'` - Adds a song to the playlist\n";
    str += "`" + prefix + "play` - Start playing\n";
    str += "`" + prefix + "stop` - Stop playing\n";
    str += "`" + prefix + "skip` - Skip current song if playing or the next song if not playing\n";
    str += "`" + prefix + "leave` - Leave voice channel - resets playlist\n";
    message.channel.send(str);
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

//joined a server
bot.on("guildCreate", guild => {
    console.log("Joined a new guild: " + guild.name);
    // add to data structures
    const server = {
      name: guild.name,
      guild: guild
    }
    servers.push(server);
    play.set(guild.id, false);
    playing.set(guild.id, []);
    songQueue.set(guild.id, []);
    channelQueue.set(guild.id, []);
    // list and save all channels
    guild.channels.forEach((channel) => {
        const channelObj = {
          name: channel.name,
          channel: channel
        }
        channels.push(channelObj);
    })
})

//removed from a server
bot.on("guildDelete", guild => {
    console.log("Left a guild: " + guild.name);
    //remove from guildArray
    servers.forEach( (server) => {
      if (server.id == guild.id) {
        servers.delete(server);
      }
    } );
    guild.channels.forEach( (channel) => {
      channels.forEach( (ch) => {
        if (ch.id == channel.id) {
          channels.delete(ch);
        }
      });
    } );
    play.delete(guild.id);
    playing.delete(guild.id);
    songQueue.delete(guild.id);
    channelQueue.delete(guild.id);
})

/*****************************************************************************/

bot.once('reconnecting', () => {
 console.log('Reconnecting!');
});

bot.once('disconnect', () => {
 console.log('Disconnect!');
});

// DISCORD LOGIN
bot.login(d_token);
// YOUTUBE API KEY
youTube.setKey(yt_token);

module.exports = bot;
