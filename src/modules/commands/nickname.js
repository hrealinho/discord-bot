const Utils = require('../Utils/Utils.js');
const { prefix } = require('../../config.json');

module.exports = {
  name: 'nickname',
  usage: '`' + prefix + 'nickname <name>`',
  description: 'change server nickname to the given one',
  guildOnly: true,
  args: true,
  cooldown: 15,     // setting avatar call in discord api is heavily limited
  execute(arguments, message, queue) {
    if (!message || !arguments) return message.reply('Error changing nickname.');

    msg.guild.members.get(client.user.id).setNickname(arguments)

    return message.reply('Guild nickname changed');
  }
}
