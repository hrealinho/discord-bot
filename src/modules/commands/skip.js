/**
 *
 *
 */
const Discord = require('discord.js');

const Utils = require('../Utils/Utils.js');

const { prefix } = require('../../config.json');
const play = require('./play.js');

/**
 * Skip
 * @param {Object} queue -
 * @param {Guild} guild -
 * @param {Channel} channel -
 * @param {VoiceChannel} voiceChannel -
 */
module.exports = {
  name: 'skip',
  usage: '`' + prefix + 'skip`',
  description: 'skips a playing song or the next in queue if no song is playing',
  args: false,
  execute(arguments, message, queue) {
      var queueObj = queue.get(message.guild.id);
      if (!queueObj.playing && Utils.isEmpty(queueObj.songs)) {
          message.channel.send("Playlist is empty.");
      }
      else {
        const guild = message.guild;
        var queueObj = queue.get(guild.id);
        const channel = queueObj.channel;
        const voiceChannel = queueObj.voiceChannel;

        // NOT WORKING - skips every song and empties playlist TODO
  	    if (!queueObj) return;
  	    if (queueObj.playing == true) {  //if its playing in the guild
  	      queueObj.connection.dispatcher.end(); // trigger onEnd at play.execute
        }
  	    else { // if its not playing in the guild at the moment
  	      queueObj.songs.shift();
  	    }
  	    console.log("Skipping song. @ " + message.channel.guild.name);
  	    message.channel.send("Skipped.");

  			return new Promise(function () {

  			});
      }

		}
};
