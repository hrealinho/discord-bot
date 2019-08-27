const { prefix } = require('../../config.json');

module.exports = {
  name: 'prefix',
  aliases: [],
  usage: '`' + prefix + 'prefix <new prefix>`',
  description: 'changes the prefix.',
  guildOnly: true,
  args: true,
  cooldown: 10,
  execute(arguments, message, queue) {  // TODO
    if (!queue || !message) return console.log('error at prefix cmd.');
    if (arguments.length > 1) return message.reply('Prefix should be a character');

    const queueObj = queue.get(message.guild.id);
    const nPrefix = arguments.toString();
    queueObj.prefix = nPrefix;
    return message.reply('Changed guild prefix to `' + nPrefix +'`');
  }
};
