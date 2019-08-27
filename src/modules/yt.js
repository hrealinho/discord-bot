const Discord = require('discord.js');
const YouTube = require('youtube-node');

const {
	yt_token,
	spotify
 } = require('../config.json');

const youTube = new YouTube();

/**
 * Searches youtube
 * @param {Map} queue -
 * @param {string} songName -
 * @param {Channel} channel -
 * @param {function} callback -
 */
function getSong(queue, songName, channel, callback) {
	// YOUTUBE TOKEN
	youTube.setKey(yt_token);

	// search for the song in youtube and get the first result to appear
	youTube.search(songName, 1, function(error, result) {
		if (error) {
			console.log(error);
		}
		else {
			//console.log(JSON.stringify(result, null, 2));
			// get video id from first result on the search
			const videoId = result.items[0].id.videoId;
			if (!result || !result.items[0] || !videoId) {
					channel.send("No song found.");
					return;
			}
			// build youtube video url and song object
			const name = result.items[0].snippet.title;
			const videoUrl = 'https://youtube.com/watch?v=' + videoId;
			const song = {
					name: name,
					url: videoUrl
			};
			callback(song);
			return ;
		}
	});
}





module.exports = getSong;
