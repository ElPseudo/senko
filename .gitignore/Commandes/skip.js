module.exports = {
	name: 'skip',
	description: 'Skip command.',
	cooldown: 5,
	execute(message) {
		const { voiceChannel } = message.member;
		if (!voiceChannel) return message.channel.send('Je suis désolé mais vous devez être sur un canal vocal pour jouer de la musique!');
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return message.channel.send('Il n'y a rien que je puisse sauter pour vous.');
		serverQueue.connection.dispatcher.end('La commande de saut a été utilisée!');
	}
};
