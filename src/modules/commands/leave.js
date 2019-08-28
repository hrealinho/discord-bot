const { prefix } = require('../../config.json');

module.exports = {
  name: 'leave',
  usage: '`' + prefix + 'leave`',
  description: 'reset playlist and leave the voice channel if joined',
  guildOnly: true,
  args: false,
  execute(arguments, message, queue) {
    var queueObj = queue.get(message.guild.id);
    if (queueObj.playing) {
      queueObj.playing = false;
      queueObj.connection.dispatcher.end();
    }
    if (queueObj.voiceChannel) {
      // Leave the voice channel
      queueObj.voiceChannel.leave();
    }
    /*
    queueObj = {
      textChannel: null,
      voiceChannel: null,
      connection: null,
      songs: [],
      play: null,
      volume: 4,
      playing: false,
      prefix: prefix
    };
    queue.set(message.channel.guild.id, queueObj);
    */
    queue.get(message.channel.guild.id).connection = null;
    queue.get(message.channel.guild.id).textChannel = null;
    queue.get(message.channel.guild.id).voiceChannel = null;
    queue.get(message.channel.guild.id).songs = [];
    queue.get(message.channel.guild.id).play = null;
    return message.reply('Bye.');
  }
}
