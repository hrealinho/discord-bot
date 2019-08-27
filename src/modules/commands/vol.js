const Utils = require('../Utils/Utils.js');
const { prefix } = require('../../config.json');

module.exports = {
  name: 'vol',
  usage : '`' + prefix + 'vol <up>` or ' +
          '`' + prefix + 'vol <down>`',
  description: 'raise or lower the volume',
  guildOnly: true,
  args: true,
  cooldown: false,
  execute(arguments, message, queue) {
    if (!message.guild) return;
    const queueObj = queue.get(message.guild.id);
    if (!queueObj) {
      return;
    }

    const args = Utils.join(arguments);
    if (args.includes('up') || args.includes('u')) {
      //up
      queueObj.volume++;
      message.reply('volume++');
    }
    else if (queueObj.volume > 0 && (args.includes('down')|| args.includes('d'))) {
      //down
      queueObj.volume--;
      message.reply('volume--');
    }

    if (!queueObj.playing) {
      return;
    }
    else {
      const dispatcher = queueObj.connection.dispatcher;
      return dispatcher.setVolume(queueObj.volume/10);
    }
  }
}
