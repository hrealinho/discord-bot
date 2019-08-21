const { prefix } = require('../../config.json');

module.exports = {
  name: 'vol',
  usage : '`' + prefix + 'vol <up>` or ' +
          '`' + prefix + 'vol <down>`',
  description: 'raise or lower the volume',
  args: true,
  execute(arguments, message, queue) {
    console.log(this.name);
    if (!message.guild) return;
    const queueObj = queue.get(message.guild.id);
    if (!queueObj) {
      return;
    }

    if (arguments.includes('up')) {
      //up
      queueObj.volume++;
    }
    else if (queueObj.volume > 0) {
      //down
      queueObj.volume--;
    }

    if (!queueObj.playing) {
      return;
    }
    else {
      const dispatcher = queueObj.connection.dispatcher;
      dispatcher.setVolume(queueObj.volume/10);
    }
  }
}
