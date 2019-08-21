const { prefix } = require('../../config.json');
const Utils = require('../Utils/Utils.js');
const getSong = require('../yt.js');

module.exports = {
  name: 'add',
  usage: '`' + prefix + 'add <song name>`',
  description: 'add song to queue',
  cooldown: 3,
  args: true,
  execute(arguments, message, queue) {
    if (arguments.length == 0) {
      message.channel.send("Add what?\nUse `" + prefix + "add 'song'`");
    } else {
      var songName = Utils.join(arguments);
      if (!songName) songName = arguments.toString();

      getSong(queue, songName, message.channel, function (song) {
  			queue.get(message.guild.id).songs.push(song);
        message.reply("Added " + song.name + " to the playlist.");
  		});

    }


  }
}
