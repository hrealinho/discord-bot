const { prefix } = require('../../config.json');

module.exports = {
  name: 'stop',
  usage: '`' + prefix + 'stop`',
  description: 'stop playing a song',
  guildOnly: true,
  args: false,
  cooldown: 2,
  execute(arguments, message, queue) {    // TODO
    const guild = message.guild;
    if (queue.get(guild.id).playing == false) {
      console.log("Not playing @ " + guild.name);
      return message.channel.send("Not playing.");
    }
    else {
      queue.get(guild.id).playing = false;
      queue.get(guild.id).play = null;
      const dispatcher = queue.get(guild.id).connection.dispatcher;
      return dispatcher.end();
    }
  }
};
