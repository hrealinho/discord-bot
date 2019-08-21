/**
 * Voice player module for discord
 * @author Henrique Realinho
 */

const Utils = require('../Utils/Utils.js');
const ytdl = require('ytdl-core');
const YouTube = require('youtube-node');

const youTube = new YouTube();

const VOLUME = 0.4;

/**
 * Play a song
 * @param {VoiceChannel} channel - Voice Channel for the song to be played in
 * @param {string} url - youtube url of the song to be played
 * @param {function} onEnd - callback to execute at the end of the
 */
function play (channel, url, onEnd) {
// TODO
  if (!channel) {
    return;
  }

  join (channel, function (connection) {
    // joined voice channel (or client was already in the voice channel)
    const dispatcher = connection.playStream(ytdl(url.toString()))
    .on('end', () => { // TODO
        onEnd();
    })
    .on('error', error => {  // play stream error
        console.error(error);
    });

    dispatcher.setVolume(VOLUME);
  });
}


/**
 * Join the voice channel
 * @param {VoiceChannel} channel - the VoiceChannel to be joined
 * @param {function} callback -
 */
async function join(channel, callback) {

    if (!channel) return console.error("The channel does not exist!");

    channel.join()
        .then( connection => {
        // worked
        console.log("Successfully connected.");
        callback(connection);
    }).catch(e => {
        // errored, log it to console
        console.error(e);
    });
}

module.exports = {
  play: play
};
