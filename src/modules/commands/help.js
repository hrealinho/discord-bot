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
    var str = '\n';
    if (arguments.length <= 1) {
      //...
    }
    // load commands from file - check Utils/Utils.js
    loadCommands((command) => {
      str += '-' + command.usage + ' -> ' + command.description + ' \n\n';
    });

    const cmdEmbed = new Discord.RichEmbed()
      .setColor('#0099ff')
      .addField('Commands', str)
      .addBlankField()
      .setTimestamp();

    message.author.send(cmdEmbed);
    message.reply('sent you a DM with the available commands.');
    return ;
  }
};
