const util = require("util"),
    discord = require("discord.js"),
    tags = require("common-tags"),
    escapeRegex = require("escape-string-regexp"),
    nl = "!!NL!!",
    nlPattern = new RegExp(nl, "g");

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
					type: "string"
				}
			]
		});

        this.lastResult = null;
	}

	async task(ctx) {

        const message = ctx.message,
            client = ctx.client,
            objects = ctx.client.registry.evalObjects,
            lastResult = this.lastResult;
		const doReply = val => {
			if(val instanceof Error) {
				ctx.reply(`Callback error: \`${val}\``);
			} else {
				const result = this.makeResultMessages(val, process.hrtime(this.hrStart));
				if(Array.isArray(result)) {
					for(const item of result) ctx.send(item);
				} else {
					ctx.send(result);
				}
			}
        };
        
		let hrDiff;
		try {
			const hrStart = process.hrtime();
			this.lastResult = eval(ctx.args.script);
			hrDiff = process.hrtime(hrStart);
		} catch(err) {
			return ctx.send(`Error while evaluating: \`${err}\``);
		}

		this.hrStart = process.hrtime();
		const result = this.makeResultMessages(this.lastResult, hrDiff, ctx.args.script, ctx);
		if(Array.isArray(result)) {
			return result.map(item => ctx.reply(item));
		} else {
			return ctx.send(result);
		}
	}

	makeResultMessages(result, hrDiff, input = null, ctx) {
		const inspected = util.inspect(result, { depth: 0 })
			.replace(nlPattern, "\n")
			.replace(this.sensitivePattern(ctx), "--snip--");
		const split = inspected.split("\n");
		const last = inspected.length - 1;
		const prependPart = inspected[0] !== "{" && inspected[0] !== "[" && inspected[0] !== "'" ? split[0] : inspected[0];
		const appendPart = inspected[last] !== "}" && inspected[last] !== "]" && inspected[last] !== "'" ?
			split[split.length - 1] :
			inspected[last];
		const prepend = `\`\`\`javascript\n${prependPart}\n`;
		const append = `\n${appendPart}\n\`\`\``;
		if(input) {
			return discord.splitMessage(tags.stripIndents`
				*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ""}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append });
		} else {
			return discord.splitMessage(tags.stripIndents`
				*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ""}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append });
		}
	}

	sensitivePattern(ctx) {
		if(!this._sensitivePattern) {
			const client = ctx.client;
			let pattern = "";
			if(client.token) pattern += escapeRegex(client.token);
			Object.defineProperty(this, "_sensitivePattern", { value: new RegExp(pattern, "gi") });
		}
		return this._sensitivePattern;
	}
};
