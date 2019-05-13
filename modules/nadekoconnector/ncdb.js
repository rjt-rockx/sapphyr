module.exports = class NadekoDbConnector extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "ncdbset",
			description: "Sets the NadekoDbConnector configuration for this guild.",
			group: "nadekoconnector",
			memberName: "ncdbset",
			aliases: ["nadekodbset"],
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["ADMINISTRATOR"],
			args: [
				{
					key: "databasePath",
					prompt: "Absolute path to the database file of the bot.",
					type: "string"
				},
				{
					key: "credentialsPath",
					prompt: "Absolute path to the credentials file of the bot.",
					type: "string"
				}
			]
		});
	}

	async task(ctx) {
		const file = global.utils.file;
		const database = new file(ctx.args.databasePath);
		if (!database.exists)
			return ctx.send("Database does not exist at the given path.");
		if (!database.readable || !database.writable)
			return ctx.send("Database cannot be accessed.");
		const credentials = new file(ctx.args.credentialsPath);
		if (!credentials.exists)
			return ctx.send("Credentials does not exist at the given path.");
		if (!credentials.readable)
			return ctx.send("Credentials cannot be accessed.");
		try {
			const tryNcdb = new global.utils.nadekoDatabaseConnector(ctx.args.databasePath, ctx.args.credentialsPath);
			tryNcdb.initialize();
			tryNcdb.getBotInfo();
		}
		catch (err) {
			console.err(err);
			return ctx.send("Unable to initialize NadekoDbConnector.");
		}
		await ctx.db.set("nadekoconnector", { enabled: false });
		await ctx.db.set("nadekoDbConnector", {
			databasePath: ctx.args.databasePath,
			credentialsPath: ctx.args.credentialsPath,
			enabled: true
		});
		await ctx.message.channel.send("NadekoDbConnector configuration stored.");
	}
};
