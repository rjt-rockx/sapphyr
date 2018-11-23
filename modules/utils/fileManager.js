const fs = require("then-fs");
const jsonbs = require("json-bigint")({ storeAsString: true });
const path = require("path");

let checkIfExists = async function (pathToFile) {
    let err;
    try {
        err = await fs.access(path.resolve(pathToFile), fs.constants.F_OK);
        if (!err) return true;
    }
    catch (e) { return false; }
};

let createIfNotExists = async function (pathToFile, defaultData = "") {
    if (path.parse(path.resolve(pathToFile)).ext.toLowerCase() === ".json" && typeof defaultData === "object")
        defaultData = await jsonbs.stringify(defaultData, null, 4);
    if (!await checkIfExists(pathToFile))
        await fs.writeFile(path.resolve(pathToFile), defaultData, { mode: 777 });
    return await readJson(pathToFile);
};

let checkReadable = async function (pathToFile) {
    let err = await fs.access(path.resolve(pathToFile), fs.constants.F_OK | fs.constants.R_OK);
    if (!err) return true;
    return false;
};

let checkWritable = async function (pathToFile) {
    let err = await fs.access(path.resolve(pathToFile), fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
    if (!err) return true;
    return false;
};

let makeWritable = async function (pathToFile) {
    if (!await checkIfExists(pathToFile))
        throw new Error("File does not exist.");
    if (await checkWritable(pathToFile)) return;
    let err = await fs.chmod(path.resolve(pathToFile), 777);
    if (err) throw err;
};

let readFile = async function (pathToFile) {
    if (!await checkReadable(pathToFile))
        throw new Error("File is not readable.");
    let err, data = await fs.readFile(path.resolve(pathToFile), "utf8");
    if (err) throw err;
    return data.toString();
};

let readJson = async function (pathToFile) {
    let data = await readFile(pathToFile);
    if (!data)
        throw new Error("Unable to read file.");
    let jsonData = await jsonbs.parse(data);
    if (!jsonData)
        throw new Error("Unable to parse data as JSON.");
    return jsonData;
};

let writeFile = async function (pathToFile, data = "") {
    if (!await checkWritable(pathToFile))
        throw new Error("File is not writable.");
    let err = await fs.writeFile(path.resolve(pathToFile), data);
    if (err) throw err;
};

let writeJson = async function (pathToFile, data = {}) {
    if (!await checkWritable(pathToFile))
        throw new Error("File is not writable.");
    let jsonData = await jsonbs.stringify(data, null, 4);
    let err = await fs.writeFile(path.resolve(pathToFile), jsonData);
    if (err) throw err;
    return await readJson(pathToFile);
};

exports.checkIfExists = checkIfExists;
exports.createIfNotExists = createIfNotExists;
exports.checkReadable = checkReadable;
exports.checkWritable = checkWritable;
exports.makeWritable = makeWritable;
exports.readFile = readFile;
exports.readJson = readJson;
exports.writeFile = writeFile;
exports.writeJson = writeJson;