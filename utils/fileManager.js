const fs = require("then-fs");
const jsonbs = require("json-bigint")({ storeAsString: true });
const path = require("path");

const checkIfExists = async function (pathToFile) {
	let err;
	try {
		err = await fs.access(path.resolve(pathToFile), fs.constants.F_OK);
		if (!err) return true;
	} catch (e) { return false; }
};

const createIfNotExists = async function (pathToFile, defaultData = "") {
	if (path.parse(path.resolve(pathToFile)).ext.toLowerCase() === ".json" && typeof defaultData === "object") defaultData = await jsonbs.stringify(defaultData, null, 4);
	if (!await checkIfExists(pathToFile)) await fs.writeFile(path.resolve(pathToFile), defaultData, { mode: 777 });
	return readJson(pathToFile);
};

const checkReadable = async function (pathToFile) {
	const err = await fs.access(path.resolve(pathToFile), fs.constants.F_OK | fs.constants.R_OK);
	if (!err) return true;
	return false;
};

const checkWritable = async function (pathToFile) {
	const err = await fs.access(path.resolve(pathToFile), fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
	if (!err) return true;
	return false;
};

const makeWritable = async function (pathToFile) {
	if (!await checkIfExists(pathToFile)) throw new Error("File does not exist.");
	if (await checkWritable(pathToFile)) return;
	const err = await fs.chmod(path.resolve(pathToFile), 777);
	if (err) throw err;
};

const readFile = async function (pathToFile) {
	if (!await checkReadable(pathToFile)) throw new Error("File is not readable.");
	const data = await fs.readFile(path.resolve(pathToFile), "utf8");
	return data.toString();
};

const readJson = async function (pathToFile) {
	const data = await readFile(pathToFile);
	if (!data) throw new Error("Unable to read file.");
	const jsonData = await jsonbs.parse(data);
	if (!jsonData) throw new Error("Unable to parse data as JSON.");
	return jsonData;
};

const writeFile = async function (pathToFile, data = "") {
	if (!await checkWritable(pathToFile)) throw new Error("File is not writable.");
	const err = await fs.writeFile(path.resolve(pathToFile), data);
	if (err) throw err;
};

const writeJson = async function (pathToFile, data = {}) {
	if (!await checkWritable(pathToFile)) throw new Error("File is not writable.");
	const jsonData = await jsonbs.stringify(data, null, 4);
	const err = await fs.writeFile(path.resolve(pathToFile), jsonData);
	if (err) throw err;
	return readJson(pathToFile);
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
