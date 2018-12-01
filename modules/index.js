const { lstatSync, readdirSync } = require("fs");
const { join, parse } = require("path");
const log = require("fancy-log");

const isDirectory = source => lstatSync(source).isDirectory() && !source.startsWith(".");
const getDirectories = source => readdirSync(source).map(name => join(source, name)).filter(isDirectory).map(directory => parse(directory).name);
const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

exports.initializeModules = async function initializeModules(client) {
	for (const moduleName of getDirectories(__dirname + "/")) {
		if (!moduleName) continue;
		try {
			const defaults = {
				name: toTitleCase(moduleName),
				id: moduleName,
				guarded: false,
				description: "No description was specified for this module."
			};
			const index = new global.utils.file(join(__dirname, moduleName, "index.json"));
			if (!index.exists) {
				log(`${defaults.name} module does not have an index. Creating ...`);
				index.write(defaults, false, true);
			}
			if (index.data.id !== defaults.id) {
				log(`${defaults.name} module's index does not match. Fixing ...`);
				index.data = {
					...defaults,
					...index.data,
					id: defaults.id
				};
			}
			await client.registry.registerGroup(new global.utils.baseModule(client, index.data));
			for (const file of readdirSync(join(__dirname, moduleName)))
				if (file.match(/\.js$/) !== null && file !== "index.js")
					client.registry.registerCommand(require(join(__dirname, moduleName, file)));
		}
		catch (error) {
			log.error(error);
		}
	}
};
