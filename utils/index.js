const fs = require("fs");

let utils = {};

fs.readdirSync(__dirname + "/").forEach(filename => {
    if (filename.match(/\.js$/) !== null && filename !== "index.js") {
        let name = filename.replace(new RegExp(/\.js$/, "g"), "");
        utils[name] = require("./" + name);
    }
});

module.exports = utils;