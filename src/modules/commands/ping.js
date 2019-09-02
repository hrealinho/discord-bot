const Discord = require('discord.js');
const { prefix } = require('../../config.json');
const client = require('../../discord-bot.js');

module.exports = {
  name: 'ping',
  aliases: ['pingg'],
  usage: '`' + prefix + 'ping`',
  description: 'get bot ping to discord servers',
  guildOnly: false,
  args: false,
  execute(arguments, message, queue) {
    const str = 'my ping to Discord servers is ' + client.ping + 'ms';
    const cmdEmbed = new Discord.RichEmbed()
      .setColor('#0099ff')
      .addField('Ping', str);

    return message.channel.send(cmdEmbed);
  }
}
