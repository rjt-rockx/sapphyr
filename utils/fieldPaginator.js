const { RichEmbed } = require("discord.js");
const chunk = (a, l) => a.length === 0 ? [] : [a.slice(0, l)].concat(chunk(a.slice(l), l));

module.exports = class fieldPaginator {
	constructor(channel, member, fields, timeout, options) {
		this.back = "◀";
		this.next = "▶";
		this.stop = "⏹";
		this.timeout = timeout;
		this.member = member;
		if (!options) options = {};
		if (options.numberFields)
			fields = fields.map((field, index) => ({ ...field, name: `${index + 1}. ${field.name}` }));
		if (typeof options.chunkSize !== "number" || options.chunkSize < 1 || options.chunkSize > 12)
			options.chunkSize = 5;
		if (typeof options.defaultPage !== "number" || !(options.defaultPage >= 0 && options.defaultPage <= fields.length))
			options.defaultPage = 0;
		this.current = options.defaultPage;
		this.fields = chunk(fields, options.chunkSize);
		this.total = this.fields.length;
		this.embedTemplate = typeof options.embedTemplate === "object" ? options.embedTemplate : {};

		channel.send(new RichEmbed({
			...this.embedTemplate,
			fields: this.fields[this.current],
			footer: this.footer
		})).then(async msg => {
			this.message = msg;
			if (this.total < 2) return;
			await this.message.react(this.back);
			await this.message.react(this.next);
			if (this.total > 2) await this.message.react(this.stop);
			this.collector = this.message.createReactionCollector((reaction, user) => reaction.me && user.id === this.member.id && user.id !== this.message.author.id, { time: this.timeout * 1000 });

			this.collector.on("collect", reaction => {
				switch (reaction.emoji.toString()) {
					case this.back: {
						this.current--;
						if (this.current < 0) this.current = this.total - 1;
						reaction.remove(member);
						break;
					}
					case this.next: {
						this.current++;
						if (this.current > this.total - 1) this.current = 0;
						reaction.remove(member);
						break;
					}
					case this.stop: {
						this.collector.stop();
						break;
					}
				}
				this.refresh();
			});

			this.collector.on("end", () => this.message.clearReactions());
		});
	}

	refresh() {
		this.message.edit(new RichEmbed({ ...this.embedTemplate, fields: this.fields[this.current], footer: this.footer }));
		this.collector.client.clearTimeout(this.collector._timeout);
		this.collector._timeout = this.collector.client.setTimeout(() => this.collector.stop("time"), this.timeout * 1000);
	}

	get footer() {
		return { text: `Page ${this.current + 1} of ${this.total}` };
	}
};
