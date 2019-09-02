const Discord = require("discord.js");
const fs = require('fs');

const client = new Discord.Client();


// make a new stream for each time someone starts to talk
function generateOutputFile(channel, member) {
  try {
    // use IDs instead of username cause some people have stupid emojis in their name
    const fileName = `./recordings/${channel.id}-${member.id}-${Date.now()}.pcm`;
    console.log('writing file: ' + fileName);
    return fs.createWriteStream(fileName);
  } catch (e) {
      return console.log(e);
  }
}

function record(voiceChannel, connection){
  try {
    const receiver = connection.createReceiver();

    connection.on('speaking', (user, speaking) => {
      if (speaking) {
        console.log(`I'm listening to ${user}`);
        // this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
        const audioStream = receiver.createPCMStream(user);
        // create an output stream so we can dump our data in a file
        const outputStream = generateOutputFile(voiceChannel, user);
        // pipe our audio data into the file stream
        audioStream.pipe(outputStream);
        console.log(user);
        //outputStream.on("data", console.log);
        // when the stream ends (the user stopped talking) tell the user
        audioStream.on('end', () => {
          console.log(`I'm no longer listening to ${user}`);
        });
      }
    });
  } catch (e) {
    return console.log(e);
  }
}

module.exports = {
  record: record
};
