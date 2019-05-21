const Discord = require('discord.js');
var bot = new Discord.Client();

const fs = require(`fs`);

bot.login(process.env.TOKEN);
var prefix = ("!");

bot.on("guildMemberAdd", member => {

    const channel = member.guild.channels.find("name", "home-🏛");
    if(!channel) return;
    channel.send(`Bienvenue **${member}**, sur **${member.guild.name}**, veuillez lire les règles https://thumbs.gfycat.com/GrimMealyBuckeyebutterfly-size_restricted.gif`)
})

bot.on('message', message => {

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
            return 
        }
    }
);

bot.commands = new Discord.Collection();

fs.readdir("./Commandes/", (error, f) => {
    if(error) console.log(error);

    let commandes = f.filter(f => f.split(".").pop() === "js");
    if(commandes.length <= 0) return console.log("Aucune commande trouvée !");

    commandes.forEach((f) => {

        let commande = require(`./Commandes/${f}`);
        console.log(`${f} commande chargée !`);

        bot.commands.set(commande.help.name, commande);
    });
});

fs.readdir("./Events/", (error, f) => {
    if(error) console.log(error);
    console.log(`${f.length} events en chargement`);

    f.forEach((f) => {
        const events = require(`./Events/${f}`);
        const event = f.split(".")[0];

    bot.on(event, events.bind(null, bot));
    });
});
