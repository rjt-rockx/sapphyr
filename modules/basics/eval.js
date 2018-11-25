const { inspect } = require("util"), { splitMessage } = require("discord.js"), { stripIndents } = require("common-tags"),
	escapeRegex = require("escape-string-regexp");
const nlPattern = new RegExp("!!NL!!", "g");

module.exports = class EvalCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "eval",
			group: "basics",
			memberName: "eval",
			description: "Executes JavaScript code.",
			details: "Only the bot owner(s) may use this command.",
			ownerOnly: true,
			args: [
				{
					key: "script",
					prompt: "What code would you like to evaluate?",
					type: "string",
				},
			],
		});
		this.lastResult = null;
	}

	task(ctx) {
		if (ctx.msg.content.includes("token") || ctx.msg.content.includes("config") || ctx.msg.content.includes("password")) {
			return ctx.send("Yea no. Don't be an idiot. We don't use code like that here.");
		}
		this.doReply = val => {
			if (val instanceof Error) { return ctx.send(`Callback error: \`${val}\``); } else {
				const result = this.makeResultMessages(val, process.hrtime(this.hrStart), null, ctx);
				return Array.isArray(result) ? result.map(item => ctx.send(item)) : ctx.send(result);
			}
		};

		let hrDiff;
		try {
			const hrStart = process.hrtime();
			this.lastResult = eval(ctx.args.script);
			hrDiff = process.hrtime(hrStart);
		} catch (err) {
			return ctx.send(`Error while evaluating: \`${err}\``);
		}

		this.hrStart = process.hrtime();
		const result = this.makeResultMessages(this.lastResult, hrDiff, ctx.args.script, ctx);
		return Array.isArray(result) ? result.map(item => ctx.send(item)) : ctx.send(result);
	}

	makeResultMessages(result, hrDiff, input = null, ctx) {
		let inspected = inspect(result, { depth: 0 })
			.replace(nlPattern, "\n");
		for (const pattern of this.getSensitivePatterns(ctx)) inspected = inspected.replace(pattern, "[CENSORED]");
		const split = inspected.split("\n");
		const lastInspected = inspected[inspected.length - 1];
		const prependPart = inspected[0] !== "{" && inspected[0] !== "[" && inspected[0] !== "'" ? split[0] : inspected[0];
		const appendPart = lastInspected !== "}" && lastInspected !== "]" && lastInspected !== "'" ? split[split.length - 1] : lastInspected;
		const prepend = `\`\`\`js\n${prependPart}\n`;
		const append = `\n${appendPart}\n\`\`\``;
		if (input) {
			return splitMessage(stripIndents`
				*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ""}${hrDiff[1] / 1000000}ms.*
				\`\`\`js
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append });
		} else {
			return splitMessage(stripIndents`
				*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ""}${hrDiff[1] / 1000000}ms.*
				\`\`\`js
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append });
		}
	}

	getSensitivePatterns(ctx) {
		if (!this._sensitivePattern || !Array.isArray(this._sensitivePattern)) {
			this._sensitivePattern = [];
			if (ctx.client.token) this._sensitivePattern.push(new RegExp(escapeRegex(ctx.client.token), "gi"));
			if (ctx.nadekoConnector) this._sensitivePattern.push(new RegExp(escapeRegex(ctx.nadekoConnector.password), "gi"));
		}
		return this._sensitivePattern;
	}
};
