const { lstatSync, readdirSync } = require("fs");
const { join, parse } = require("path");
const { checkIfExists, createIfNotExists, readJson, writeJson } = global.utils.fileManager;

const isDirectory = source => lstatSync(source).isDirectory() && !source.startsWith(".");
const getDirectories = source => readdirSync(source).map(name => join(source, name)).filter(isDirectory).map(directory => parse(directory).name);
const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

exports.initializeModules = async function initializeModules(client) {
    let modules = getDirectories(__dirname + "/");
    await Promise.all(modules.map(async mdl => {
        if (!mdl) return;
        try {
            let moduleDefaults = {
                name: toTitleCase(mdl),
                id: mdl,
                guarded: false,
                description: "No description was specified for this module."
            };
            let indexPath = join(__dirname, mdl, "index.json");
            if (!await checkIfExists(indexPath)) {
                console.log(`${moduleDefaults.name} module does not have an index. Creating ...`);
                await createIfNotExists(indexPath, moduleDefaults);
            }
            let group = await readJson(indexPath);
            if (group.id !== moduleDefaults.id) {
                console.log(`${moduleDefaults.name} module's index does not match. Fixing ...'`);
                let fixedData = {
                    ...moduleDefaults,
                    ...group,
                    id: moduleDefaults.id,
                    description: group.description ? group.description : moduleDefaults.description
                };
                await writeJson(indexPath, fixedData);
                group = fixedData;
            }
            await client.registry.registerGroup(new global.utils.baseModule(client, group));
            readdirSync(join(__dirname, mdl)).map(filename => {
                if (filename.match(/\.js$/) !== null && filename !== "index.js") {
                    client.registry.registerCommand(require(join(__dirname, mdl, filename)));
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }));
};
