module.exports = {
	name: 'np',
	description: 'Now playing command.',
	cooldown: 5,
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return message.channel.send('Il n'y a rien qui joue.');
		return message.channel.send(`🎶 Lecture en cours: **${serverQueue.songs[0].title}**`);
	}
};
