module.exports = {
	name: "Art Channel Service",
	description: "Reacts with an upvote on artwork submissions.",
	type: "event",
	on: {
		message: async function (message) {
			if (message.channel.id === message.guild.channels.find("name", "art").id && message.attachments.size > 0)
				message.react("🔺");
		}
	}
};