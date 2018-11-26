const { readdirSync } = require("fs"), { join } = require("path"), { mongoUrl } = require("../localdata/config");
const onText = str => str.replace(/\w\S*/g, txt => "on" + txt.charAt(0).toUpperCase() + txt.substr(1));
const everyText = str => str.replace(/\w\S*/g, txt => "every" + txt.charAt(0).toUpperCase() + txt.substr(1));
const deepProps = x => x && x !== Object.prototype && Object.getOwnPropertyNames(x).concat(deepProps(Object.getPrototypeOf(x)) || []);
const deepFunctions = x => deepProps(x).filter(name => typeof x[name] === "function");
const userFunctions = x => new Set(deepFunctions(x).filter(name => name !== "constructor" && !~name.indexOf("__")));
const camelCase = data => data.replace(/(_\w)/g, text => text[1].toUpperCase());
const camelCaseKeys = obj => {
	var newObj = {};
	for (const data in obj) {
		if (obj.hasOwnProperty(data))
			newObj[camelCase(data)] = obj[data];
	}
	return newObj;
};
const intervals = {
	minute: 60,
	fiveMinutes: 300,
	fifteenMinutes: 900,
	halfAnHour: 1800,
	hour: 3600,
	day: 86400
};
module.exports = class serviceHandler {
	constructor(client) {
		this.client = client;
		this.services = [];
		this.events = [
			"channelCreate",
			"channelDelete",
			"channelPinsUpdate",
			"channelUpdate",
			"emojiCreate",
			"emojiDelete",
			"emojiUpdate",
			"guildBanAdd",
			"guildBanRemove",
			"guildCreate",
			"guildDelete",
			"guildIntegrationsUpdate",
			"guildMemberAdd",
			"guildMemberRemove",
			"guildMemberSpeaking",
			"guildMemberUpdate",
			"guildUpdate",
			"message",
			"messageDelete",
			"messageDeleteBulk",
			"messageReactionAdd",
			"messageReactionRemove",
			"messageReactionRemoveAll",
			"messageUpdate",
			"presenceUpdate",
			"raw",
			"roleCreate",
			"roleDelete",
			"roleUpdate",
			"typingStart",
			"typingStop",
			"userUpdate",
			"voiceStateUpdate",
			"webhookUpdate"
		];
	}

	checkIfValid(service) {
		return service.prototype instanceof global.utils.baseService;
	}

	addService(service) {
		if (!this.checkIfValid(service)) return;
		const serviceToAdd = new service(this.client);
		if (this.services.some(existingService => existingService.id === serviceToAdd.id)) return;
		this.services.push(serviceToAdd);
	}

	addServicesIn(folder) {
		for (const filename of readdirSync(folder))
			if (filename.match(/\.js$/) !== null && filename !== "index.js") {
				const service = require(join(folder, filename));
				this.addService(service);
			}
	}

	listServices() {
		return this.services.map(service => { return { id: service.id, enabled: service.enabled }; });
	}

	enableService(id) {
		for (const service of this.services)
			if (service.id === id && !service.enabled)
				service.enable();
	}

	disableService(id) {
		for (const service of this.services)
			if (service.id === id && service.enabled)
				service.disable();
	}

	getServiceInfo(id) {
		for (const service of this.services)
			if (service.id === id)
				return {
					name: service.name,
					description: service.description,
					enabled: service.enabled
				};
	}

	removeService(service) {
		this.services = this.services.filter(existingService => existingService.id !== service.id);
	}

	removeAllServices() {
		this.services = [];
	}

	async runClientEvent(event, args) {
		for (const service of this.services)
			if (typeof service[onText(event)] === "function" && service.enabled) {
				const context = await fetchContext(this.client, event, args);
				if (typeof context !== "undefined")
					service[onText(event)](context);
			}
	}

	async runTimedEvent(event, args) {
		for (const service of this.services)
			if (typeof service[everyText(event)] === "function" && service.enabled) {
				const context = await fetchContext(this.client, event, args);
				if (typeof context !== "undefined")
					service[everyText(event)](context);
			}
	}

	registerClientEvents() {
		this.usedEvents = this.services.reduce((events, service) => events.concat([...userFunctions(service)]), [])
			.filter(eventName => eventName.startsWith("on") || eventName.startsWith("every"))
			.sort().filter((eventName, index, self) => self.indexOf(eventName) === index);
		this.clientEvents = this.events.filter(event => this.usedEvents.includes(onText(event)));
		for (const event of this.clientEvents)
			this.client.on(event, (...args) => this.runClientEvent(event, args));
	}

	registerTimedEvents() {
		this.timedEvents = Object.keys(intervals).filter(interval => this.usedEvents.includes(everyText(interval)));
		for (const event of this.timedEvents)
			setInterval(() => this.runTimedEvent(event, []), intervals[event] * 1000);
	}

	initialize(folder) {
		this.addServicesIn(folder);
		this.registerClientEvents();
		this.registerTimedEvents();
	}
};

const fetchContext = async function (client, event, args) {
	let context = { client };
	await attachDatahandler(client, context);
	if (Object.keys(intervals).includes(event)) {
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
	else if (event === "message" || event === "messageDelete" || event === "messageReactionRemoveAll") {
		[context.message] = args;
		getUser(context);
		getChannel(context);
		await getGuild(context);
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
	}
	else if (event == "messageUpdate") {
		[context.oldMessage, context.newMessage] = args;
		getMessage(context);
		getChannel(context);
		await getGuild(context);
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
	}
	else if (event === "userUpdate") {
		[context.oldUser, context.newUser] = args;
		getUser(context);
	}
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
		if (context.message && context.message.author)
			context.user = context.message.author;
		if (context.newUser)
			context.user = context.newUser;
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
	if (typeof client.datahandler === "undefined") {
		client.datahandler = new global.utils.datahandler(mongoUrl ? mongoUrl : undefined);
		await client.datahandler.initialize();
	}
	context.globalDb = new global.utils.globalDatahandler(client.datahandler);
	await context.globalDb.reload();
};

const attachGuildDatahandler = async (context) => {
	if (context.guild) {
		context.db = new global.utils.guildDatahandler(context.client.datahandler, context.guild.id);
		const nc = await context.db.get("nadekoconnector");
		if (typeof nc === "object" && nc.enabled === true)
			context.nadekoConnector = new global.utils.nadekoConnector(nc.address, nc.password);
	}
};
