const Discord = require('discord.js');
const { prefix } = require('../../config.json');

const Utils = require('../Utils/Utils.js');

module.exports = {
  name: 'queue',
  usage: '`' + prefix + 'queue`',
  description: "get the name of the current song playing and the rest of the songs in the queue",
  guildOnly: true,
  args: false,
  execute(arguments, message, queue) {
    var str = "server playlist:\n";
    if (queue.get(message.guild.id).playing) {
      str += "Now playing:\n - " + queue.get(message.guild.id).play.name + '\n';
    }

    const songs = queue.get(message.guild.id).songs;
    if (!songs || songs == [] || Utils.isEmpty(songs)) {
        message.channel.send(str); // print now playing msg before returning
        return message.channel.send("No song in queue.");
    }
    else {
        str += "\nQueue:\n";
        songs.forEach( (song) => {
          str += " - " + song.name + "\n";
        });

        const cmdEmbed = new Discord.RichEmbed()
          .setColor('#0099ff')
          .addField('Playlist', str)
          .setTimestamp();
        message.channel.send(cmdEmbed);
    }
		return;
  }
};
