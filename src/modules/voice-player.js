/**
 * Voice player module for discord
 * @author Henrique Realinho
 */

const Utils = require('./Utils/Utils.js');
const ytdl = require('ytdl-core');
const YouTube = require('youtube-node');

const youTube = new YouTube();

const VOLUME = 0.4;

/**
 * Plays a song using ytdl to download the audio of the given url
 * @param {VoiceChannel} channel - VoiceChannel object for the song to be played in
 * @param {string} url - youtube url of the song to be played
 * @param {function} onJoin - callback to execute once the channel is joined
 * @param {function} onEnd - callback to execute at the end of the song
 */
function play (channel, url, onJoin, onEnd) {
// TODO
  if (!channel || !url) {
    return;
  }

  return join(channel, function (connection) {
    onJoin(connection);
    // joined voice channel (or client was already in the voice channel)

    // dispatcher to play the url using ytdl stream
    const stream = ytdl(url, { filter: 'audioonly' });
    const dispatcher = connection.playStream(stream);
    dispatcher.on('end', () => { // TODO
        onEnd();
    })
    dispatcher.on('error', error => {  // play stream error
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
        return callback(connection);
    }).catch(e => {
        // errored, log it to console
        console.error(e);
    });
}

module.exports = {
  play: play,
  join: join
};
