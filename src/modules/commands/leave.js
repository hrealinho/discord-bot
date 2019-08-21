const { prefix } = require('../../config.json');

module.exports = {
  name: 'leave',
  usage: '`' + prefix + 'leave`',
  description: 'reset playlist and leave the voice channel if joined',
  args: false,
  execute(arguments, message, queue) {
    var queueObj = queue.get(message.guild.id);
    if (queueObj.VoiceChannel) {
      // Leave the voice channel
      queueObj.channel.leave();
    }

    queueObj = {
      textChannel: null,
      voiceChannel: null,
      connection: null,
      songs: [],
      play: null,
      volume: 4,
      playing: false
    };
    queue.set(message.channel.guild.id, queueObj);

  }
}
