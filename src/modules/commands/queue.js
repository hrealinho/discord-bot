
const { prefix } = require('../../config.json');

const Utils = require('../Utils/Utils.js');

module.exports = {
  name: 'queue',
  usage: '`' + prefix + 'queue`',
  description: "get the name of the current song playing and the rest of the songs in the queue",
  args: false,
  execute(arguments, message, queue) {
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
		return new Promise(function () {

		});
  }
};
