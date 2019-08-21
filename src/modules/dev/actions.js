/**
 * Bot actions
 * @author Henrique Realinho
 */
const Utils = require('./Utils/Utils.js');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const YouTube = require('youtube-node');
const fs = require('fs');

const {
	prefix,
	yt_token
} = require('../config.json');
const VOLUME = 4; // volume (1-10)
const getSong = require('./Utils/yt.js');

const youTube = new YouTube();



var help = {    // working
  name: 'help',
  usage: prefix + '`help`',
  execute(arguments, channel) {
    var str = "COMMANDS:\n";
    str += "`" + prefix + "add 'song'` - Adds a song to the playlist\n";
    str += "`" + prefix + "play` - Start playing\n";
    str += "`" + prefix + "stop` - Stop playing\n";
    str += "`" + prefix + "skip` - Skip current song if playing or the next song if not playing\n";
    str += "`" + prefix + "leave` - Leave voice channel - resets playlist\n";
    channel.send(str);

    return new Promise(function () {

    });
  }
};

var play = {
  name: 'play',
  usage: prefix + '`play`',
  execute(arguments, queue, guild, channel, voiceChannel) {    // TODO
	    var song;
	    // song queue for this server
	    const serverQueue = queue.get(guild.id).songs;

	   if (queue.get(guild.id).playing ) {
	      return;
	    }
	    else if (arguments.length > 0 && (!serverQueue || Utils.isEmpty(serverQueue))) {      // TODO
	      //channel.send("`" + prefix + "play` has no arguments.\nAdd songs using `" + prefix + "add 'song'`");
	      getSong(queue, arguments.toString(), queue.get(guild.id).channel, (songObj) => {
	        song = songObj;
	      });
	    }
	    else if (serverQueue) {
	      song = serverQueue.shift(); // song is a object with the song name and url
	    }
	    else { // lul
	      song = serverQueue.shift();
	    }

			if (!voiceChannel) return console.error("The channel does not exist!");
	    voiceChannel.join()
	        .then( connection => {
	        // worked
	        console.log("Successfully connected. @ " + channel.guild.name);
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
		        execute(arguments, queue, guild, channel, voiceChannel);
		      })
		      .on('error', error => {  // play stream error
		        queue.get(guild.id).playing = false;
		        console.error(error);
		      });
		      dispatcher.setVolume(VOLUME/10);
	    }).catch(e => {
	        // errored, log it to console
	        console.error(e);
	    });
			return new Promise(function () {

			});
		}
};

var add = {
  name: 'add',
  usage: prefix + '`add <song>`',
  execute(message, queue, songName, channel) {
		getSong(queue, songName, channel, function (song) {
			queue.get(message.guild.id).songs.push(song);
		});
  }
};


var stop = {
  name: 'stop',
  usage: prefix + '`stop`',
  execute(guild, queue) {
		if (!queue.get(guild.id).playing) return;

    const dispatcher = queue.get(guild.id).connection.dispatcher;
    dispatcher.end();
    queue.get(guild.id).playing = false;
    queue.get(guild.id).play = null;

		return new Promise(function () {

		});
  }
};


var skip = {
  name: 'skip',
  usage: prefix + '`skip`',
  execute(queue, guild, channel, voiceChannel) {
	  // NOT WORKING - skips every song and empties playlist TODO
	    var queueObj = queue.get(guild.id);
	    if (!queueObj) return;
	    if (queueObj.playing == true) { // if its playing in the guild
	      queueObj.connection.dispatcher.end();
				if(queueObj.songs)
				play.execute(arguments, queue, guild, channel, queueObj.voiceChannel);
	    }
	    else { // if its not playing in the guild at the moment
	      queueObj.songs.shift();
	    }
	    console.log("Skipping song. @ " + channel.guild.name);
	    channel.send("Skipped.");

			return new Promise(function () {

			});
		}
};

var queue = {
  name: 'queue',
  usage: prefix + '`queue`',
  execute(message, queue) {
		if (queue.get(message.guild.id).play) {
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
		return new Promise(function () {

		});
  }
};


var leave = {
  name: 'leave',
  usage: prefix + '`leave`',
  execute(queue) {
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

		return new Promise();
  }
};


module.exports = {
  help,
  add,
  play,
  stop,
  skip,
  leave,
  queue
};
