module.exports = {
	name: 'stop',
	description: 'Stop command.',
	cooldown: 5,
	execute(message) {
		const { voiceChannel } = message.member;
		if (!voiceChannel) return message.channel.send('Je suis désolé mais vous devez être sur un canal vocal pour jouer de la musique!');
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return message.channel.send('Il n'y a rien que je puisse arrêter de jouer pour vous.');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('La commande d'arrêt a été utilisée!');
	}
};
