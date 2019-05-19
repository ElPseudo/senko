const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.TOKEN);
var prefix = ("!");

client.on("guildMemberAdd", member =>{

    const channel = member.guild.channels.find("name", "home-🏛");
    if(!channel) return;
    channel.send(`Bienvenue **${member}**, sur **${member.guild.name}**, veuillez lire les règles https://thumbs.gfycat.com/GrimMealyBuckeyebutterfly-size_restricted.gif`)
})

Client.on('message', message => {

    if (message.content.startsWith(prefix + "sondage")) {
        let args = message.content.split(" ").slice(1);
        let thingToEcho = args.join(" ")
        var embed = new Discord.RichEmbed()
            .setDescription("Sondage")
            .addField(thingToEcho, "Répondre avec :white_check_mark: ou :x:")
            .setColor("0xB40404")
            .setTimestamp()
        message.guild.channels.find("name", "sondage-📊").sendEmbed(embed)
        .then(function (message) {
            message.react("✅")
            message.react("❌")
        }).catch(function() {
        });
        }else{
            return message.reply("Tu n'as pas la permission.")
        }
    }
})
