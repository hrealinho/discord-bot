/**
 * My simple discord bot using discord.js.
 * documentation available at https://github.com/hrealinho/discord-bot
 * Discord.js docs at https://discord.js.org/#/docs/
 * Before running invite the bot to your desired server through:
 *  https://discordapp.com/oauth2/authorize?&client_id=610256035730554917&scope=bot&permissions=8
 *
 * @author Henrique Realinho
 */

// TEST SERVER ID 610255655625818122

/** CONFIG **/
const {
  name,
	prefix,
	d_token,
  yt_token,
} = require('./config.json');  // change config.json
/** DEPENDENCIES **/
const Discord = require('discord.js');
// OTHER PACKAGES
const Utils = require('./modules/Utils/Utils.js');
const loadCommands = require('./modules/commands.js');

// Init
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();


/** GLOBAL VARIABLES **/
const receivedMessages = []; // saves received messages
const queue = new Map();  // map for queue Objects with info for each guild

/** CONSTANTS **/
const AVATAR_URL = __dirname + '/images/discord-logo.jpg';

/*****************************************************************************/
// DISCORD LOGIN
client.login(d_token).catch( (e) => {
  console.log('Error logging into discord');
  console.log(e);
});

// ON READY
client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    onLoad();
});

function setInfo() {
  if (client.user.username != name) {
    // changes username according to config.json file
  client.user.setUsername(name)
    .then(user => console.log(`My new username is ${user.username}`))
    .catch(console.error);
  }
  // set bot status and activity
  //client.user.setAvatar(AVATAR_URL);     // change bot's avatar if you want
  client.user.setStatus('available');
  client.user.setPresence({
      game: {
          name: 'with toilet paper | ' + prefix + 'help'
      }
  });

}

/**
 * Set bot status and fill servers and channels data structures.
 */
function onLoad() {
  loadCommands( (command) => {
    client.commands.set(command.name, command);
  });

  setInfo();
  // save servers the bot is connected to
  client.guilds.forEach((guild) => {
    const queueObj = {
      textChannel: null,
      voiceChannel: null,
      connection: null,
      songs: [],
      play: null,
      volume: 0,
      playing: false
    };
    queue.set(guild.id, queueObj);
  });
}

/**
 * Reply to a received message.
 * @param {Message} message - the received message
 */
function reply(message) {
  // store received msgs
  receivedMessages.push(message);

  // send acknowledgement message
  message.react("👍");

  // Get every custom emoji from the server (if any) and react with each one
  message.guild.emojis.forEach(customEmoji => {
      message.react(customEmoji)
      .catch( (err) => {
         if(err) console.log(err);
      });
  });
}

/******************************* ON MESSAGE **********************************/

// ON MESSAGE
client.on('message', (message) => {
  // Prevent bot from responding to its own messages
  if (message.author == client.user) {
      return;
  }
   // check if the bot was tagged in the message
  if (message.content.includes(client.user.toString())) {
      reply(message);
  }

  // check for the prefix and process the command
  if (message.content.startsWith(prefix)) {
      runCmd(message);
  }
});

/** PROCESSING COMMANDS **/

/**
 *
 * @param {Message} message -
 * @param {[string]} arguments -
 */
function runCmd(message) {
  const fullCommand = message.content.substr(prefix.length); // remove prefix
	const args = fullCommand.split(" ").slice(1);
	const commandName = fullCommand.split(/ +/).shift().toLowerCase();

  if (!client.commands.has(commandName))  {
    return message.channel.send(`Not a command, ${message.author}.\n` +
      'Try `'+ prefix + 'help`');
  }

  const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;
  /** CHECK FOR COOLDOWN **/
  if (!cooldowns.has(command.name)) {
  	cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

  	if (now < expirationTime) {
  		const timeLeft = (expirationTime - now) / 1000;
  		return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
  	}
  }
  else {
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }
  /****/
  try {
    if (command.args && !args.length) {
      message.reply(`You didn't provide any arguments, ${message.author}!`);
      return message.reply('usage: ' + command.usage);
    }
    /* EXECUTE CMD */
    return command.execute(args, message, queue);

  } catch (error) {
  	console.error(error);
  	return message.reply('there was an error trying to execute that command!');
  }
}

///////////////////////////////////////////////////////////////////////////////

// joined a guild
client.on("guildCreate", guild => {
    console.log("Joined a new guild: " + guild.name);
    // add to data structure
    const queueObj = {
      textChannel: null,
      voiceChannel: null,
      connection: null,
      songs: [],
      play: null,
      volume: VOLUME,
      playing: false
    };
    queue.set(guild.id, queueObj);
})

// removed from a guild
client.on("guildDelete", guild => {
    console.log("Left a guild: " + guild.name);
    //remove guild from map
    queue.delete(guild.id);
})

/*****************************************************************************/

client.once('reconnecting', () => {
 console.log('Reconnecting!');
 client.guilds.forEach( (guild) => {
   // add to data structure
   const queueObj = {
     textChannel: null,
     voiceChannel: null,
     connection: null,
     songs: [],
     play: null,
     volume: VOLUME,
     playing: false
   };
   queue.set(guild.id, queueObj);
 });
});

client.once('disconnect', () => {
 console.log('Disconnect!');
 queue = new Map();
});


module.exports = client;

//////////////////////////////////////////////////////////

/**************************** CREATING COMMANDS *******************************/
