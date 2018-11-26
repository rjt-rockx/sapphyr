module.exports = class EnableServiceCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "enableservice",
			description: "Enable a service by its ID",
			group: "utils",
			memberName: "enableservice",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "id",
					prompt: "ID of the service",
					type: "string"
				}
			]
		});
	}

	task(ctx) {
		const serviceList = global.services.listServices().map(service => service.id);
		const index = serviceList.map(serviceId => serviceId.toLowerCase()).indexOf(ctx.args.id.toLowerCase());
		if (index < 0) return ctx.send("Service not found.");
		global.services.enableService(serviceList[index]);
		return ctx.send(`Successfully enabled ${serviceList[index]}`);
	}
};
