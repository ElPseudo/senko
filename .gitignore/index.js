const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.TOKEN);
var prefix = ("!");

client.on("guildMemberAdd", member =>{

    const channel = member.guild.channels.find("name", "home-🏛");
    if(!channel) return;
    channel.send(`Bienvenue **${member}**, sur **${member.guild.name}**, veuillez lire les règles https://thumbs.gfycat.com/GrimMealyBuckeyebutterfly-size_restricted.gif`)
})
