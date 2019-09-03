const { prefix } = require('../../config.json');
// uses database - mongodb
const db = require('../database.js');

module.exports = {
  name: 'leave',
  usage: '`' + prefix + 'leave`',
  description: 'reset playlist and leave the voice channel if joined',
  guildOnly: true,
  args: false,
  execute(arguments, message, queue) {
    const guild = message.guild;
    if (!guild) return console.log('error at leave cmd.');

    var queueObj = queue.get(guild.id);
    if (queueObj.playing) { // if playing, end connection
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
    const songs = queue.get(guild.id).songs;
    const guildPrefix = queue.get(guild.id).prefix;
    // save to database
    db.save(guild.name, guild.id, songs, guildPrefix);
    // set default to every field except prefix
    queue.get(message.channel.guild.id).connection = null;
    queue.get(message.channel.guild.id).textChannel = null;
    queue.get(message.channel.guild.id).voiceChannel = null;
    queue.get(message.channel.guild.id).songs = [];
    queue.get(message.channel.guild.id).play = null;
    queue.get(message.channel.guild.id).prefix = prefix;

    return message.reply('Bye.');
  }
}
