module.exports = class globalDatahandler {
	/**
     * Initialize a globalDataHandler.
     * @param {Object} datahandler A datahandler instance to use.
     */
	constructor(datahandler) {
		this.datahandler = datahandler;
	}

	/**
     * Get the latest data stored globally.
     * @returns Global data.
     */
	async reload() {
		const { _id, ...data } = await this.datahandler.getOrCreateGlobal();
		return this.globalData = data;
	}

	/**
     * Get global data, or the data stored under a key if specified.
     * @param {string} [key] Key under which the data is stored.
     * @returns Global data.
     */
	async get(key) {
		await this.reload();
		if (!["string", "number"].includes(typeof key)) return this.globalData;
		if (key === "_id") return;
		return this.globalData[key];
	}

	/**
     * Set global data for a key or multiple keys.
     * @param {string|Object} keyOrObject Key to store the data under, or object containing key/value pairs.
     * @param {*} [value] Data to store under the key if a key is specified.
     * @returns Global data.
     */
	async set(keyOrObject, value) {
		await this.reload();
		let data = keyOrObject;
		if (typeof keyOrObject === "undefined") return;
		if (["string", "number"].includes(typeof keyOrObject)) {
			if (typeof value === "undefined") return;
			if (keyOrObject === "_id") return;
			data = {};
			data[keyOrObject] = value;
		}
		delete data._id;
		await this.datahandler.editGlobal(data);
		return this.reload();
	}

	/**
     * Remove global data for a key or multiple keys.
     * @param {string|Object} keyOrObject Key the data is stored under, or multiple keys in an object.
     * @returns Global data.
     */
	async remove(keyOrObject) {
		let data = keyOrObject;
		await this.reload();
		if (typeof keyOrObject === "undefined") return;
		if (["string", "number"].includes(typeof keyOrObject)) {
			data = {};
			data[keyOrObject] = null;
		}
		delete data._id;
		await this.datahandler.editGlobal(data, true);
		return this.reload();
	}
};
