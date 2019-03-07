const { mongoUrl } = require("../localdata/config"),
	{ RichEmbed } = require("discord.js"),
	datahandler = require("./datahandler.js"),
	guildDatahandler = require("./guildDatahandler.js"),
	globalDatahandler = require("./globalDatahandler.js"),
	nadekoConnector = require("./nadekoConnector.js");

const timedEvents = ["minute", "fiveMinutes", "fifteenMinutes", "halfAnHour", "hour", "day"];

const camelCase = data => data.replace(/(_\w)/g, text => text[1].toUpperCase());
const camelCaseKeys = obj => {
	var newObj = {};
	for (const data in obj) {
		if (obj.hasOwnProperty(data))
			newObj[camelCase(data)] = obj[data];
	}
	return newObj;
};

const fetchContext = async function (client, event, args) {
	let context = { client };
	await attachDatahandler(client, context);
	if (timedEvents.includes(event)) {
		context.currentTime = new Date(Date.now());
		return context;
	}
	if (event === "channelCreate" || event === "channelDelete") {
		[context.channel] = args;
		await getGuild(context);
	}
	else if (event === "channelPinsUpdate") {
		[context.channel, context.time] = args;
		await getGuild(context);
	}
	else if (event === "channelUpdate") {
		[context.oldChannel, context.newChannel] = args;
		getChannel(context);
		await getGuild(context);
	}
	else if (event === "emojiCreate" || event === "emojiDelete") {
		[context.emoji] = args;
		await getGuild(context);
	}
	else if (event === "emojiUpdate") {
		[context.oldEmoji, context.newEmoji] = args;
		await getGuild(context);
	}
	else if (event === "guildBanAdd" || event === "guildBanRemove") {
		[context.guild, context.user] = args;
		await attachGuildDatahandler(context);
	}
	else if (event === "guildCreate" || event === "guildDelete") {
		[context.guild] = args;
		await attachGuildDatahandler(context);
	}
	else if (event === "guildMemberAdd" || event === "guildMemberRemove") {
		[context.member] = args;
		getUser(context);
		await getGuild(context);
	}
	else if (event === "guildMemberUpdate" || event === "presenceUpdate" || event === "voiceStateUpdate") {
		[context.oldMember, context.newMember] = args;
		getUser(context);
		await getGuild(context);
		getMember(context);
	}
	else if (event === "guildMemberSpeaking") {
		[context.member, context.speaking] = args;
		getUser(context);
		await getGuild(context);
	}
	else if (event === "guildUpdate") {
		[context.oldGuild, context.newGuild] = args;
		await getGuild(context);
	}
	else if (event === "commandMessage") {
		[context.message, context.arguments, context.fromPattern] = args;
		getUser(context);
		getChannel(context);
		await getGuild(context);
		getMember(context);
	}
	else if (event === "message" || event === "messageDelete" || event === "messageReactionRemoveAll") {
		[context.message] = args;
		getUser(context);
		getChannel(context);
		await getGuild(context);
		getMember(context);
	}
	else if (event === "messageDeleteBulk") {
		[context.messages] = args;
		getChannel(context);
		await getGuild(context);
	}
	else if (event === "messageReactionAdd" || event === "messageReactionRemove") {
		[context.reaction, context.user] = args;
		getMessage(context);
		getChannel(context);
		await getGuild(context);
		getMember(context);
	}
	else if (event == "messageUpdate") {
		[context.oldMessage, context.newMessage] = args;
		getMessage(context);
		getChannel(context);
		await getGuild(context);
		getMember(context);
	}
	else if (event === "raw") {
		const [{ d, t }] = args;
		if (d && t)
			context = {
				...context,
				data: camelCaseKeys(d),
				type: camelCase(t.toLowerCase())
			};
	}
	else if (event === "roleCreate" || event === "roleDelete") {
		[context.role] = args;
		await getGuild(context);
	}
	else if (event === "roleUpdate") {
		[context.oldRole, context.newRole] = args;
		context.role = context.newRole;
		await getGuild(context);
	}
	else if (event === "typingStart" || event === "typingStop") {
		[context.channel, context.user] = args;
		await getGuild(context);
		getMember(context);
	}
	else if (event === "userUpdate") {
		[context.oldUser, context.newUser] = args;
		getUser(context);
	}
	attachExtras(context);
	return context;
};

const getMessage = context => {
	if (context.reaction && context.reaction.message)
		context.message = context.reaction.message;
	if (context.newMessage)
		context.message = context.newMessage;
};

const getUser = context => {
	if (!context.user) {
		if (context.member && context.member.user)
			context.user = context.member.user;
		if (context.newMember && context.newMember.user)
			context.user = context.newMember.user;
		if (context.message)
			context.user = context.message.author;
		if (context.newUser)
			context.user = context.newUser;
	}
};

const getMember = context => {
	if (!context.member) {
		if (context.newMember)
			context.member = context.newMember;
		if (context.guild && context.user && !context.member)
			if (context.guild.members.has(context.user.id))
				context.member = context.guild.members.get(context.user.id);
	}
};

const getChannel = context => {
	if (context.message && context.message.channel)
		context.channel = context.message.channel;
	if (context.newChannel)
		context.channel = context.newChannel;
	if (context.messages)
		context.channel = context.messages.first().channel;
};

const getGuild = async context => {
	if (!context.guild) {
		if (context.channel && context.channel.guild)
			context.guild = context.channel.guild;
		if (context.emoji && context.emoji.guild)
			context.guild = context.emoji.guild;
		if (context.newEmoji && context.newEmoji.guild)
			context.guild = context.newEmoji.guild;
		if (context.member)
			context.guild = context.member.guild;
		if (context.newMember && context.newMember.guild)
			context.guild = context.newMember.guild;
		if (context.newGuild)
			context.guild = context.newGuild;
		if (context.role)
			context.guild = context.role.guild;
	}
	if (context.guild) {
		await attachGuildDatahandler(context);
	}
};

const attachDatahandler = async (client, context) => {
	if (!client.datahandler) {
		client.datahandler = new datahandler(mongoUrl);
		await client.datahandler.initialize(client);
	}
	context.globalDb = new globalDatahandler(client.datahandler);
	await context.globalDb.reload();
};

const attachGuildDatahandler = async context => {
	if (context.guild) {
		context.db = new guildDatahandler(context.client.datahandler, context.guild.id);
		const nc = await context.db.get("nadekoconnector");
		if (typeof nc === "object" && nc.enabled === true)
			context.nadekoConnector = new nadekoConnector(nc.address, nc.password);
	}
};

const attachExtras = async context => {
	if (context.message) {
		context.react = (...data) => context.message.react(...data);
		context.msg = context.message;
		context.send = (...data) => context.message.channel.send(...data);
		context.embed = data => data instanceof RichEmbed ? context.send(data) : context.send(new RichEmbed(data));
		if (context.message.command)
			context.command = context.message.command;
	}
	if (context.user) {
		context.dm = (...data) => context.user.send(...data);
		context.dmEmbed = data => data instanceof RichEmbed ? context.dm(data) : context.dm(new RichEmbed(data));
	}
	if (context.channel) {
		context.selfDestruct = (data, seconds = 10) => context.channel.send(data).then(msg => msg.delete(seconds * 1000));
	}
	if (context.arguments)
		context.args = context.arguments;
};

module.exports = fetchContext;