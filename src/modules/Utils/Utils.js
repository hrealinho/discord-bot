/**
 * Commands module for discord bot.
 * command format described at actions.js
 *
 * @author Henrique Realinho
 */
const path = require('path');
const fs = require('fs');
// cmd files dir
const dir = '../commands/';

/**
* Gets the commands from a file describing them.
* @param {function} callback -
*/
function loadCommands(callback) {
  // TODO
  const commandFiles = fs.readdirSync(path.join(__dirname, dir)).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(dir + `${file}`);
    callback(command);
  }
}


/**
 *
 * @param {Object} obj -
 */
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

/**
 * Join the values of args in a string
 * @params {[string]} args -
 */
function join (args) {
   var res = "";
   if (!args || args.length <= 1) return args;

   args.forEach( str => {
       res+=str + " ";

   });
   return res;
}

module.exports = {
    loadCommands,
    isEmpty,
    join
};
