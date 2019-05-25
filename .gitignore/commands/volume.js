module.exports = {
	name: 'volume',
	description: 'Volume command.',
	cooldown: 5,
	execute(message, args) {
		const { voiceChannel } = message.member;
		if (!voiceChannel) return message.channel.send('Je suis désolé mais vous devez être sur un canal vocal pour jouer de la musique!');
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return message.channel.send(`Il n'y a rien qui joue.`);
		if (!args[0]) return message.channel.send(`Le volume actuel est: **${serverQueue.volume}**`);
		serverQueue.volume = args[0]; // eslint-disable-line
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 5);
		return message.channel.send(`Je règle le volume à: **${args[0]}**`);
	}
};
