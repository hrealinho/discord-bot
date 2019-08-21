/**
 * Commands module for discord bot.
 * command format described at actions.js
 *
 * @author Henrique Realinho
 */
const Utils = require('./Utils/Utils.js');
const fs = require('fs');
// cmd files dir
const dir = '/commands/';

/**
* Gets the commands from a file describing them.
* @param {function} callback - 
*/
function loadCommands(callback) {
  // TODO
  const commandFiles = fs.readdirSync(__dirname + dir).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require('.' + dir + `${file}`);
    callback(command);
  }
}

 module.exports = loadCommands;
