/**
 *
 *
 */
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const YouTube = require('youtube-node');

const Utils = require('../Utils/Utils.js');
const { prefix } = require('../../config.json');
const getSong = require('../yt.js');

const VOLUME = 4;

module.exports = {
  name: 'play',
  aliases: ['p'],
  usage: '`' + prefix + 'play` or `' + prefix + 'play <song name>`',
  description: 'play the first song in queue if no arguments given, or play the given song if no song is in queue (if a song is already in queue, adds it to the playlist)',
  cooldown: 5,
  execute(arguments, message, queue) {
			const guild = message.guild;
			if (!guild) return;
			const playlist = queue.get(guild.id);
      if (arguments.length == 0 && Utils.isEmpty(playlist.songs)) {
        message.channel.send("Play what?\nAdd a song to a playlist using `" + prefix + "add 'song'` and then use `" + prefix + "play`");
      }
			else if (!message.member.voiceChannel) {
        message.channel.send("You are not in a voice channel.");
      }
			else {
				if (playlist.playing && arguments.length > 0) {
	        // if already playing, add song in arguments to queue
	        require('./add.js').execute(arguments, message, queue);
				}
        var song = {};
        // song queue for this server
        const serverQueue = playlist.songs;

        if (playlist.playing) {
          return;
        } else {
          song = serverQueue.shift();
        }
        if (!song) return;

				const channel = message.channel;
				const voiceChannel = message.member.voiceChannel;
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
              queue.get(guild.id).playing = false;
              queue.get(guild.id).play = null;
              console.log('Music ended!');
              if (Utils.isEmpty(queue.get(guild.id).songs)) {
                  console.log("Empty queue @ " + guild.name);
                  channel.send("Playlist is empty.");
              }
              this.execute(arguments, message, queue);
            })
            .on('error', error => {  // play stream error
              queue.get(guild.id).playing = false;
              queue.get(guild.id).play = null;
              console.error(error);
            });
            dispatcher.setVolume(queue.get(guild.id).volume/10);
        }).catch(e => {
            // errored, log it to console
            console.error(e);
        });
        return new Promise(function () {

        });
      }
    }
};
