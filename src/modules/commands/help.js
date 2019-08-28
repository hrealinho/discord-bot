const Discord = require('discord.js');

const loadCommands = require('../Utils/Utils.js').loadCommands;
const {
   prefix,
   name
 } = require('../../config.json');

module.exports = {
  name: 'help',
  aliases: ['h'],
  usage: '`' + prefix + 'help`',
  description: 'show commands',
  guildOnly: false,
  execute(arguments, message, queue) {
    var str = 'Commands available:\n';
    if (arguments.length <= 1) {
      //
    }

    loadCommands((command) => {
      str += '-' + command.usage + ' -> ' + command.description + ' \n\n';
    });
    // inside a command, event listener, etc.
    const cmdEmbed = new Discord.RichEmbed()
      .setColor('#0099ff')
      .addField('Commands', str)
      .addBlankField()
      .setTimestamp()
      .setFooter(name, 'bot');
    message.author.send(cmdEmbed);
    message.reply('sent you a DM with the available commands.');
    return ;
  }
};
