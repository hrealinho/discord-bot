const { prefix } = require('../../config.json');

module.exports = {
 name: 'ban',
 usage: '`' + prefix + 'ban <user tag>`',
 description: 'bans a user if you have permissions',
 guildOnly: true,
 args: true,
 cooldown: 20,
 execute(arguments, message, queue) {
   if(!message.guild || !message.guild.roles.some(r=>["admin", "Administrator", "Admin"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

    const member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable)
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    const reason = arguments.slice(1).join(' ');
    if(!reason) reason = "No reason provided";

    member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));

    return message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
 }
}
