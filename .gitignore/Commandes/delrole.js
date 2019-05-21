const Discord = require(`discord.js`);

module.exports.run = async(bot, message, args) => {

    if(!message.guild.member(message.author).hasPermission("MANAGE_ROLES")) {
        return message.channel.send(`Tu n'as pas la permission`);
    }

    if(!message.guild.member(bot.user).hasPermission("MANAGE_ROLES")) {
        return message.channel.send(`Je n'ai pas la permission !`);
    }

    let membre = message.guild.member(message.author);

    let role = message.guild.roles.find(x => x.name === "Membre");

    membre.removeRole(role).catch(console.error);
    message.channel.send(`${membre} n'a maintenant plus le rôle ${role.name}`);

};

module.exports.help = {
    name: "delrole"
}