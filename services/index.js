// export all files in this folder under their filename
require("fs").readdirSync(__dirname + "/").forEach(function (filename) {
    if (filename.match(/\.(js|json)$/) !== null && filename !== "index.js") {
        let name = filename.replace(new RegExp(/\.(js|json)$/, "g"), "");
        exports[name] = require("./" + name);
    }
});