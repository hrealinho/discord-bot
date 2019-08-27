const Utils = require('../Utils/Utils.js');
const { prefix } = require('../../config.json');

module.exports = {
  name: 'avatar',
  usage: '`' + prefix + 'avatar <url>`',
  description: 'change avatar to the image in the given url',
  guildOnly: false,
  args: true,
  cooldown: 90,     // setting avatar call in discord api is heavily limited
  execute(arguments, message, queue) {
    message.member.user.setAvatar(Utils.join(arguments))
      .catch( (err) => {
        if (err) return console.log(err);
      });
    return message.reply('Avatar changed. ');
  }
}
