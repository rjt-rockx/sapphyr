module.exports = class guildDataHandler {
    constructor(datahandler, id) {
        this.datahandler = datahandler;
        this.id = id;
    }

    async reload() {
        return this.guild = await this.datahandler.getOrAddGuild({ id: this.id });
    }

    async get(setting) {
        await this.reload();
        if (typeof setting === "undefined")
            return this.guild;
        if (setting === "_id") return;
        return this.guild[setting];
    }

    async set(setting, value) {
        await this.reload();
        let data = setting;
        if (typeof setting === "undefined") return;
        if (["string", "number"].includes(typeof setting)) {
            if (typeof value === "undefined") return;
            if (setting === "_id") return;
            data = {};
            data[setting] = value;
        }
        delete data["_id"];
        await this.datahandler.editGuild(this.guild, data);
        return await this.reload();
    }

    async remove(setting) {
        let data = {};
        await this.reload();
        if (typeof setting === "undefined") return;
        if (["string", "number"].includes(typeof setting)) {
            if (setting === "_id") return;
            data[setting] = null;
        }
        await this.datahandler.editGuild(this.guild, data, true);
        return await this.reload();
    }
};