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

    return message.reply('My ping is ' + client.ping + 'ms');
  }
}
