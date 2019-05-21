const Discord = require(`discord.js`);

module.exports.run = async(bot, message, args) => {

    if(!message.guild.member(message.author).hasPermission("BAN_MEMBERS")) return message.channel.send(`Vous n'avez pas la permission !`);

    if(message.mentions.users.size === 0) {
        return message.channel.send(`Vous devez mentionner un utilisateur !`);
    }

    let ban = message.guild.member(message.mentions.users.first());

    if(!ban) {
        return message.channel.send(`Je n'ai pas trouvé l'utilisateur !`);
    }

    if(!message.guild.member(bot.user).hasPermission("BAN_MEMBERS")) return message.channel.send(`Le bot n'a pas la permission !`);

    ban.ban().then(member => {

        message.channel.send(`${member.user.username} est ban ! Par ${message.author.username}`);
        message.mentions.users.first().send(`Vous êtes banni du serveur **${message.guild.name}** par ${message.author.username}`).catch(console.error);
    });
};

module.exports.help = {
    name: "ban"
};