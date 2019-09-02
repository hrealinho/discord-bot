/**
 * My simple discord bot using discord.js.
 * documentation available at https://github.com/hrealinho/discord-bot
 * Discord.js docs at https://discord.js.org/#/docs/
 *
 * To create your discord application and bot check
 *  https://discordapp.com/developers/docs/intro
 * Before running invite the bot you created with the respective CLIENT_ID
 * your server through:
 *   https://discordapp.com/oauth2/authorize?&client_id=CLIENT_ID&scope=bot&permissions=8
 *
 * @author Henrique Realinho
 */

/** CONFIG FILE **/
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
const db = require('./modules/dev/database.js');
const cleanup = require('./modules/Utils/cleanup.js').Cleanup(onExit);


// Init
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();


/** GLOBAL VARIABLES **/
const receivedMessages = []; // saves received messages
const queue = new Map();  // map for queue Objects with info for each guild

/** CONSTANTS **/
const AVATAR_URL = __dirname + '/images/discord-logo.jpg';
const VOLUME = 4; // volume 1-10

/******************************* DISCORD LOGIN *******************************/
//
client.login(d_token).catch( (e) => {
  console.log('Error logging into discord');
  console.log(e);

});

/******************************* ON READY *******************************/
client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    onLoad();
});

/**
 * Set bot status and fill servers and channels data structures.
 */
function onLoad() {
  // load commands to discord collection
  Utils.loadCommands( (command) => {
    client.commands.set(command.name, command);
  });

  setInfo();

  // save servers the bot is connected to
  client.guilds.forEach((guild) => {
      // load guild prefix from database or add guild document to the database,
      //if the guild is not on the database
      var guildPrefix = '';
      db.loadPrefix(guild.id, (doc) => {
        if (doc == null) { return; }
        guildPrefix = doc.prefix;
        if (!guildPrefix || guildPrefix === undefined) {
          guildPrefix = prefix;
          return db.save(guild.name, guild.id, [], guildPrefix, (doc) => {
            console.log('saved to database: ' + doc);
          });
        }
        else {
          return console.log('loaded data from database');
        }
      });

      const queueObj = {
        textChannel: null,
        voiceChannel: null,
        connection: null,
        songs: [],
        play: null,
        volume: 0,
        playing: false,
        prefix: guildPrefix
      };
      // add queue Object for each guild to the queue Map
      queue.set(guild.id, queueObj);
  });
}

/**
 *
 */
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
          name: 'sounds | use ' + prefix + 'help'
      }
  });
}

/*****************************************************************************/

/******************************* ON MESSAGE **********************************/
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
  if (message.content.startsWith(queue.get(message.guild.id).prefix)) {
      runCmd(message);
  }
});


/*****                       PROCESSING COMMANDS                          *****/

/**
 * Interprets and runs a command from a message.
 * @param {Message} message -
 */
function runCmd(message) {
  const fullCommand = message.content.substr(prefix.length); // remove prefix
	const args = fullCommand.split(" ").slice(1);
	const commandName = fullCommand.split(/ +/).shift().toLowerCase(); // split w regex

  if (!client.commands.has(commandName) && commandName.includes(prefix))  {
    return message.channel.send(`Not a command, ${message.author}.\n` +
      'Try `'+ prefix + 'help`');
  }
  else if (!client.commands.has(commandName)) {
    return ;
  }

  // get command object
  const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

  /** check if the command has a cooldown and apply it **/
  if (!cooldowns.has(command.name)) {
  	cooldowns.set(command.name, new Discord.Collection());
  }
  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  if (command.cooldown > 0) {
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    	if (now < expirationTime) {  // cooldown
    		const timeLeft = (expirationTime - now) / 1000;
    		return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
    	}
    }
    else {
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }
  }
  ////////////////////////////////////////////////////////
  try {
    if (command.guildOnly && message.channel.type !== 'text') { // check for guild only cmds
    	return message.reply('I can\'t execute that command inside DMs!');
    }
    if (command.args && !args.length) {   // check if needed args are missing
      message.reply(`You didn't provide any arguments, ${message.author}!`);
      return message.channel.send('usage: ' + command.usage);
    }
    /****************************** EXECUTE CMD *******************************/
    return command.execute(args, message, queue);
    /**************************************************************************/
  } catch (error) {
  	console.error(error);
  	return message.reply('there was an error trying to execute that command!');
  }
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
}

/*****************************************************************************/


///////////////////////////////////////////////////////////////////////////////

/**
 * Update database, runs upon process exit - check modules/Utils/cleanup.js
 */
function onExit() { // TODO
  const guilds = client.guilds;
  if (guilds === []) return console.log('error exit');
  console.log('saving..');
  guilds.forEach( guild => {
      const songs = queue.get(guild.id).songs;
      const guildPrefix = queue.get(guild.id).prefix;

      db.save(guild.name, guild.id, songs, guildPrefix, (doc) => {
        console.log('saved to database: ' + doc);
      });
  });
}

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
      playing: false,
      prefix: prefix
    };
    // save the guild's queue object in the Map
    queue.set(guild.id, queueObj);
    // save guild's document in the database
    db.save(guild.name, guild.id, [], prefix, (doc) => {

      console.log('saved to database: ' + doc);
    });
});

// removed from a guild
client.on("guildDelete", guild => {
    console.log("Left a guild: " + guild.name);
    // remove guild from map
    queue.delete(guild.id);
    // remove guild's doc from database
    db.delete(guild.id);
});

/*****************************************************************************/

client.once('reconnecting', () => {
   console.log('Reconnecting!');
   client.guilds.forEach( (guild) => {
       var guildPrefix = prefix;
       // load prefix from database
       db.loadPrefix(guild.id, (doc) => {
         if (doc == null) return;
         guildPrefix = doc.prefix;
         console.log('loaded from database: ' + doc);
       });
       if (!guildPrefix) guildPrefix = prefix;
       const queueObj = {
         textChannel: null,
         voiceChannel: null,
         connection: null,
         songs: [],
         play: null,
         volume: VOLUME,
         playing: false,
         prefix: guildPrefix
       };
       // add to data structure
       queue.set(guild.id, queueObj);
   });
});

client.once('disconnect', () => {
  console.log('Disconnect!');
  client.guilds.forEach( (guild) => {
      const guildPrefix = queue.get(guild.id).prefix;
      // delete from Map
      queue.delete(guild.id);
      // update guild's doc to the database
      db.save(guild.name, guild.id, [], guildPrefix);
  });
});

module.exports = client;
