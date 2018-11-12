module.exports = class baseService {
    constructor(client) {
        this.client = client;
    }

    get id() {
        return this.constructor.name;
    }
};