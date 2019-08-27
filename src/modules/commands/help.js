const loadCommands = require('../Utils/Utils.js').loadCommands;
const { prefix } = require('../../config.json');

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

    message.author.send(str);
    message.reply('sent you a DM with the available commands.');
    return ;
  }
};
