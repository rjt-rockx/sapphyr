module.exports = {
	name: "Art Channel Service",
	description: "Reacts with an upvote on artwork submissions.",
	type: "event",
	on: {
		message: async function (message) {
			if (message.guild.channels.find(c => c.name === "art")) {
				if (message.channel.id === message.guild.channels.find(c => c.name === "art").id && message.attachments.size > 0) {
					message.react("🔺");
				}
			}
		}
	}
};
