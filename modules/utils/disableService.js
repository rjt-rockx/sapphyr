module.exports = class DisableServiceCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "disableservice",
			description: "Disable a service by its ID",
			group: "utils",
			memberName: "disableservice",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "id",
					prompt: "ID of the service",
					type: "string",
				},
			],
		});
	}

	task(ctx) {
		let serviceList = global.services.listServices().map(service => service.id);
		let index = serviceList.map(serviceId => serviceId.toLowerCase()).indexOf(ctx.args.id.toLowerCase());
		if (index < 0) return ctx.send("Service not found.");
		global.services.disableService(serviceList[index]);
		return ctx.send(`Successfully disabled ${serviceList[index]}`);
	}
};
