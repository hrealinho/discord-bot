const { prefix } = require('../../config.json');
const client = require('../../discord-bot.js');

module.exports = {
  name: 'stats',
  usage: '`' + prefix + 'stats`',
  description: 'display bot uptime',
  guildOnly: false,
  args: false,
  execute(arguments, message, queue) {
    var totalSeconds = (client.uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const uptime = `My uptime is ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;

    return message.reply(uptime);
  }
}
