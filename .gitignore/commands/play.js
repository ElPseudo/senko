const { Util } = require('discord.js');
const ytdl = require('ytdl-core');
const ytdlDiscord = require('ytdl-core-discord');

module.exports = {
	name: 'play',
	description: 'Play command.',
	usage: '[command name]',
	args: true,
	cooldown: 5,
	async execute(message, args) {
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
                const video2 = await youtube.getVideoByID(video.id); 
                await handleVideo(video2, msg, voiceChannel, true); 
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
