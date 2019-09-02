const Utils = require('../Utils/Utils.js');
const { prefix } = require('../../config.json');

module.exports = {
  name: 'nickname',
  usage: '`' + prefix + 'nickname <name>`',
  description: 'change the bot`s server nickname to the given one',
  guildOnly: true,
  args: true,
  cooldown: 5,     // TODO
  execute(arguments, message, queue) {
    if (!message || !arguments) return message.reply('Error changing nickname.');

    msg.guild.members.get(client.user.id).setNickname(arguments)

    return message.reply('Guild nickname changed');
  }
}
