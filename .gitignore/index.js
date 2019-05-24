const Client = require('discord.js');
var bot = new Discord.Client();

var prefix = ("!");
const ytdl = require('ytdl-core');
const fs = require(`fs`);

const client = new Client({ disableEveryone: true });

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => console.log(`Yo c'est parti!`));

client.on('disconnect', () => console.log(`Je viens de déconnecter, faire en sorte que vous sachiez, je vais me reconnecter maintenant...`));

client.on('reconnecting', () => console.log(`Je me reconnecte maintenant!`));

client.on('message', async msg => {
    if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(PREFIX)) return undefined;
    const args = msg.content.split(' ');

    if (msg.content.startsWith(`${PREFIX}play`)) {
        const voiceChannel = msg.member.voiceChannel;
        if (!voiceChannel) return msg.channel.send('Je suis désolé mais vous devez être dans un canal vocal pour jouer de la musique!');
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has('CONNECT')) {
            return msg.channel.send(`Je ne peux pas me connecter à votre canal vocal, assurez-vous que j'ai les autorisations appropriées!`);
        }
        if (!permissions.has('SPEAK')) {
            return msg.channel.send(`Je ne peux pas parler dans ce canal vocal, assurez-vous que j'ai les autorisations appropriées!`);
        }

        try {
            var connection = await voiceChannel.join();
        } catch (error) {
            console.error(`Je ne peux pas rejoindre le canal vocal: ${error}`);
            return msg.channel.send(`Je ne peux pas rejoindre le canal vocal: ${error}`);
        }

        const dispatcher = connection.playStream(ytdl(args[1]))
            .on('end', () => {
                console.log('chanson terminée!');
                voiceChannel.leave();
            })
            .on('error', error => {
                console.error(error);
            });
        dispatcher.setVolumeLogarithmic(5 / 5);
    } else if (msg.content.startsWith(`${PREFIX}stop`)) {
        if (!msg.member.voiceChannel) return msg.channel.send(`vous n'êtes pas dans un canal vocal!`);
        msg.member.voiceChannel.leave();
        return undefined;
    }
});

bot.login(process.env.TOKEN);

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
