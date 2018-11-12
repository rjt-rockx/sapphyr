module.exports = class baseService {
    constructor(client) {
        this.client = client;
        this.enabled = true;
    }

    get id() {
        return this.constructor.name;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
};