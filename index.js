const { Client, Util } = require('discord.js');
const { TOKEN, PREFIX, GOOGLE_API_KEY } = require('./config');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');

const client = new Client({ disableEveryone: true });

const youtube = new YouTube(GOOGLE_API_KEY);

const queue = new Map();

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => console.log(`Yo c'est parti!`));

client.on('disconnect', () => console.log(`Je viens de déconnecter, faire en sorte que vous sachiez, je vais me reconnecter maintenant...`));

client.on('reconnecting', () => console.log(`Je me reconnecte maintenant!`));

client.on('message', async msg => { //eslint-disable-line
    if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(PREFIX)) return undefined;
    const args = msg.content.split(' ');
    const searchString = args.slice(1).join(' ');
    const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
    const serverQueue = queue.get(msg.guild.id);

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

        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist =  await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
                await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
            }
            return msg.channel.send(`Playlist: **${playlist.title}** a été ajouté à la file d'attente!`);
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    let index = 0;
                    msg.channel.send(`
__**sélection de la chanson:**__

${videos.map(video2 => `**${++index} -** ${video2.title}`).join(`\n`)}

Veuillez fournir une valeur pour sélectionner l'un des résultats de la recherche, allant de 1 à 10.
                    `);
                    // eslint-disable-next-line max-depth
                    try {
                        var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
                            maxMatches: 1,
                            time: 10000,
                            errors: ['time']
                        });
                    } catch (err) {
                        console.error(err);
                        return msg.channel.send('Aucune valeur ou valeur invalide entrée, annulant la sélection de vidéo.');
                    }
                    const videoIndex = parseInt(response.first().content);
                    var video = await  youtube.getVideoByID(videos[videoIndex - 1].id);
                } catch (err) {
                    console.error(err);
                    return msg.channel.send(`Je n'ai pu obtenir aucun résultat de recherche.`);
                }
            }

            return handleVideo(video, msg, voiceChannel);
        }
    } else if (msg.content.startsWith(`${PREFIX}skip`)) {
        if (!msg.member.voiceChannel) return msg.channel.send(`Vous n'êtes pas dans un canal vocal!`);
        if (!serverQueue) return msg.channel.send(`Il n'y a rien que je puisse sauter pour vous.`);
        serverQueue.connection.dispatcher.end('La commande de saut a été utilisée!');
        return undefined;
    } else if (msg.content.startsWith(`${PREFIX}stop`)) {
        if (!msg.member.voiceChannel) return msg.channel.send(`Vous n'êtes pas dans un canal vocal!`);
        if (!serverQueue) return msg.channel.send(`Il n'y a rien que je puisse arrêter pour vous.`);
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end(`La commande d'arrêt a été utilisée!`);
        return undefined;
    } else if (msg.content.startsWith(`${PREFIX}volume`)) {
        if (!msg.member.voiceChannel) return msg.channel.send(`Vous n'êtes pas dans un canal vocal!`);
        if (!serverQueue) return msg.channel.send(`Il n'y a rien qui joue.`);
        if (!args[1]) return msg.channel.send(`le volume actuel est: **${serverQueue.volume}**`);
        serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
        return msg.channel.send(`Je règle le volume sur: **${args[1]}**`);
    } else if (msg.content.startsWith(`${PREFIX}np`)) {
        if (!serverQueue) return msg.channel.send(`Il n'y a rien qui joue.`);
        return msg.channel.send(`Lecture en cours: **${serverQueue.songs[0].title}**`);
    } else if (msg.content.startsWith(`${PREFIX}queue`)) {
        if (!serverQueue) return msg.channel.send(`Il n'y a rien qui joue.`);
        return msg.channel.send(`
__**file d'attente de la chanson:**__

${serverQueue.songs.map(song => `**-** ${song.title}`).join(`\n`)}

**Lecture en cours:** ${serverQueue.songs[0].title}
        `);
    } else if (msg.content.startsWith(`${PREFIX}pause`)) {
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return msg.channel.send('Mis en pause la musique pour vous!');
        }
        return msg.channel.send(`Il n'y a rien qui joue.`);
    } else if (msg.content.startsWith(`${PREFIX}resume`)) {
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            return msg.channel.send(`A repris la musique pour vous!`);
        }
        return msg.channel.send(`Il n'y a rien qui joue.`);
    }

    return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
    const serverQueue = queue.get(msg.guild.id);
    console.log(video);
        const song = {
            id: video.id,
            title: Util.escapeMarkdown(video.title),
            url: `https://www.youtube.com/watch?v=${video.id}`
        };
        if (!serverQueue) {
            const queueConstruct = {
                textChannel: msg.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };
            queue.set(msg.guild.id, queueConstruct);

            queueConstruct.songs.push(song);

            try {
                var connection = await voiceChannel.join();
                queueConstruct.connection = connection;
                play(msg.guild, queueConstruct.songs[0]);
            } catch (error) {
                console.error(`Je ne peux pas rejoindre le canal vocal: ${error}`);
                queue.delete(msg.guild.id);
                return msg.channel.send(`Je ne peux pas rejoindre le canal vocal: ${error}`);
            }
        } else {
            serverQueue.songs.push(song);
            console.log(serverQueue.songs);
            if (playlist) return undefined;
            else return msg.channel.send(`**${song.title}** a été ajouté à la file d'attente!`);
        }
        return undefined;
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    console.log(serverQueue.songs);

    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
        .on('end', reason => {
            if (reason === 'Flux ne génère pas assez rapidement.') console.log('Chanson terminée.');
            else console.log(reason);
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

    serverQueue.textChannel.send(`Commencer à jouer: **${song.title}**`);
}

client.login(TOKEN);
