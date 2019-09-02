const { prefix } = require('../../config.json');
const Utils = require('../Utils/Utils.js');
const getSong = require('../yt.js');

module.exports = {
  name: 'add',
  usage: '`' + prefix + 'add <song name>`',
  description: 'add song to playlist',
  guildOnly: true,
  cooldown: 3,
  args: true,
  execute(arguments, message, queue) {
    try {
      if (arguments.length == 0) {
        return message.channel.send("Add what?\nUse `" + prefix + "add 'song'`");
      } else {
        var songName = Utils.join(arguments);
        if (!songName) songName = arguments.toString();

        return getSong(message.channel, songName, queue,
          function callback(song) { // song is an Object with its name and url
      			queue.get(message.guild.id).songs.push(song);
            message.reply("Added " + song.name + " to the playlist.");
            return console.log("Added " + song + " @ " + message.guild);
      	});
      }
    } catch (e) {
      console.log(e);
      return;
    }
  }
}
