const { accessSync, readFileSync, writeFileSync, constants } = require("fs");
const jsonbs = require("json-bigint")({ storeAsString: true });
const { resolve, parse } = require("path");
const jsStringify = require("stringify-object");

/**
 * Represents a file.
 */
module.exports = class File {
	/**
	 * Initialize a new file instance.
	 * @param {String} path Path to the file.
	 * @param {Function} [errorHandler=()=>{}] Function to handle errors.
	 * @param {String} [encoding="utf8"] Encoding to open the file with.
	 */
	constructor(path, errorHandler, encoding) {
		if (!path) throw new Error("Invalid file path specified.");
		this.path = resolve(path);
		this._errorHandler = errorHandler || (() => { });
		this.encoding = encoding || "utf8";
		Object.assign(this, parse(this.path));
	}

	/**
	 * Access a file in a given mode.
	 * @param {Number} mode Mode to access the file with.
	 * @returns {Boolean} True if the file could be accessed.
	 */
	_access(mode) {
		try {
			accessSync(this.path, mode);
			return true;
		}
		catch (error) {
			this._errorHandler(error);
			return false;
		}
	}

	/**
	 * Internally read the file with the given encoding.
	 * @returns {String} Data read from the file.
	 */
	_read() {
		try {
			return readFileSync(this.path, { encoding: this.encoding }).toString();
		}
		catch (error) {
			this._errorHandler(error);
		}
	}

	/**
	 * Internally write data to the file with the given encoding.
	 * @param {String} data Data to write to the file.
	 */
	_write(data) {
		try {
			return writeFileSync(this.path, data, { encoding: this.encoding });
		}
		catch (error) {
			this._errorHandler(error);
		}
	}

	/**
	 * Check if the file exists.
	 */
	get exists() {
		return this._access(constants.F_OK);
	}

	/**
	 * Check if the file is readable.
	 */
	get readable() {
		return this._access(constants.R_OK);
	}

	/**
	 * Check if the file is writable.
	 */
	get writable() {
		return this._access(constants.W_OK);
	}

	/**
	 * Shorthand getter to read data from the file.
	 */
	get data() {
		return this.read();
	}

	/**
	 * Shorthand setter to write data to the file.
	 */
	set data(data) {
		this.write(data);
	}

	/**
	 * Read the file and parse data into a JS object if possible.
	 * @returns {(Object|String)} Data read from the file.
	 */
	read() {
		if (!this.readable) throw new Error("File is not readable");
		try {
			if (this.ext.toLowerCase() === ".js")
				return require(this.path);
			if (this.ext.toLowerCase() === ".json")
				return jsonbs.parse(this._read());
			return this._read();
		}
		catch (error) {
			this._errorHandler(error);
			return this._read();
		}
	}

	/**
	 * Write data to a file, optionally stringifying it.
	 * @param {(Object|String)} [data={}] Data to write to the file.
	 * @param {Boolean} [writeAsText=false] Whether to write the data as text or not.
	 * @param {Boolean} [createFile=false] Whether to create the file if it doesn't exist.
	 */
	write(data = {}, writeAsText = false, createFile = false) {
		if (!this.writable && !createFile) throw new Error("File is not writable.");
		try {
			if (!writeAsText) {
				if ((typeof data === "object" || (data.prototype && typeof data.prototype === "object")) && this.ext.toLowerCase() === ".json")
					return this._write(jsonbs.stringify(data, null, "\t"));
				if (this.ext.toLowerCase() === ".js")
					return this._write(`module.exports = ${jsStringify(data, { indent: "\t", singleQuotes: false })};`);
				else return this._write(data);
			}
		}
		catch (error) {
			this._errorHandler(error);
		}
	}
};