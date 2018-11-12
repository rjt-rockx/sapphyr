module.exports = class EnableServiceCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "serviceinfo",
            description: "Get information about a service",
            group: "utils",
            memberName: "serviceinfo",
            userPermissions: ["ADMINISTRATOR"],
            args: [
                {
                    key: "id",
                    prompt: "ID of the service",
                    type: "string",
                }
            ]
        });
    }

    async task(ctx) {
        let serviceList = global.services.listServices().map(service => service.id);
        let index = serviceList.map(serviceId => serviceId.toLowerCase()).indexOf(ctx.args.id.toLowerCase());
        if (index < 0)
            return ctx.send("Service not found.");
        let serviceInfo = global.services.getServiceInfo(serviceList[index]);
        return ctx.embed({
            title: serviceInfo.name,
            description: serviceInfo.description,
            fields: [
                {
                    name: "Enabled",
                    value: serviceInfo.enabled ? "True" : "False"
                }
            ]
        });
    }
};
