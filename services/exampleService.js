module.exports = class ExampleService extends global.utils.baseService {
    constructor(client) {
        super(client);
    }

    onGuildCreate() {
        console.log("hello");
    }
};