/**
 *
 *
 */
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const YouTube = require('youtube-node');

const Utils = require('../Utils/Utils.js');
const VoicePlayer = require('../voice-player.js');
const { prefix } = require('../../config.json');
const getSong = require('../yt.js');

const VOLUME = 4;

module.exports = {
  name: 'play',
  aliases: ['p'],
  usage: '`' + prefix + 'play`',
  description: 'play the first song in queue',
  guildOnly: true,
  args: false,
  cooldown: 5,
  execute(arguments, message, queue) {
			const guild = message.guild;
			if (!guild) return;
			const playlist = queue.get(guild.id);
      if (arguments.length > 0 || (Utils.isEmpty(playlist.songs) || playlist.playing)) {
        message.reply("Play what?\nAdd a song to a playlist using `" + prefix + "add 'song'` and then use `" + prefix + "play` to play");
      }
			else if (!message.member.voiceChannel) {
        message.reply("You are not in a voice channel.");
      }
			else {
        var song = {};
				if (playlist.playing && arguments.length > 0) {
	        // if already playing, add song in arguments to queue
	        return require('./add.js').execute(arguments, message, queue);
				}

        // song queue for this server
        const serverQueue = playlist.songs;
        if(!playlist.playing && arguments.length > 0) {
          getSong(queue, arguments,
         (songObj) => {
            song = songObj;
          });
        }
        else {
          song = serverQueue.shift();
        }
        console.log(song);
        if (!song || song === {} || song == undefined) return;

				const channel = message.channel;
				const voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) return console.error("The channel does not exist!");

        // calls voice player module to play the song's url with callback functions
        // executing upon joining the voice channel and upon ending the song
        VoicePlayer.play(voiceChannel, song.url,
          function onJoin(connection) {
            // worked
            console.log("Successfully connected. @ " + connection.channel.guild.name);
            // joined voice channel (or client was already in the voice channel)
            const queueObj = {
              textChannel: channel,
              voiceChannel: voiceChannel,
              connection: connection,
              songs: serverQueue,
              play: song,
              volume: 5,
              playing: true,
              prefix: prefix
            };
            queue.set(channel.guild.id, queueObj);

            console.log("Now playing: " + song.name + " in " + song.url);
            return channel.send("Now playing: " + song.name);
          },
          function onEnd() { // TODO
            if (!queue.get(guild.id).playing) {
              return message.channel.send('Stopped');
            }
            queue.get(guild.id).playing = false;
            queue.get(guild.id).play = null;
            console.log('Music ended!');
            if (Utils.isEmpty(queue.get(guild.id).songs)) {
                console.log("Empty queue @ " + guild.name);
                channel.send("Playlist is empty.");
            }
            return module.exports.execute(arguments, message, queue);
          });
        return;
      }
    }
};
