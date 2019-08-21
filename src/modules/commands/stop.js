const { prefix } = require('../../config.json');

module.exports = {
  name: 'stop',
  usage: '`' + prefix + 'stop`',
  description: 'stop playing',
  args: false,
  execute(arguments, message, queue) {
    const guild = message.guild;
    if (queue.get(guild.id).playing == false) {
      console.log("Not playing @ " + guild.name);
      message.channel.send("Not playing.");
      return;
    }
    else {
      const dispatcher = queue.get(guild.id).connection.dispatcher;
      dispatcher.end();
      queue.get(guild.id).playing = false;
      queue.get(guild.id).play = null;

  		return new Promise(function () {

  		});
    }
  }
};
