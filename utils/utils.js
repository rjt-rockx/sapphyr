var log = require("fancy-log");
exports.logAsync = async (data) => log(await data);