const { prefix } = require('../../config.json');
const Discord = require('discord.js');
const client = require('../../discord-bot.js');

module.exports = {
  name: 'stats',
  usage: '`' + prefix + 'stats`',
  description: 'display bot uptime',
  guildOnly: false,
  args: false,
  execute(arguments, message, queue) {
    var totalSeconds = (client.uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    const cmdEmbed = new Discord.RichEmbed()
      .setColor('#0099ff')
      .setTitle('Uptime')
      .addField('my uptime is', uptime);

    return message.channel.send(cmdEmbed);
  }
}
