const loadCommands = require('../commands.js');
const { prefix } = require('../../config.json');

module.exports = {
  name: 'help',
  usage: '`' + prefix + 'help`',
  description: 'show commands',
  execute(arguments, message, queue) {
    var str = 'Commands available at ' + message.guild.name + ':\n\n';

    loadCommands((command) => {
      str += '-' + command.usage + ' -> ' + command.description + ' \n\n';
    });

    message.author.send(str);
    message.reply(`${message.author}, sent you a DM with the available commands.`);
    return new Promise(function () {

    });
  }
};
