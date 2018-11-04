module.exports = class fieldPaginator {
    constructor(channel, member, fields, timeout) {
        this.current = 0;
        this.total = fields.length;
        this.fields = fields;
        this.back = "◀";
        this.next = "▶";
        this.stop = "⏹";
        this.timeout = timeout;

        channel.send({ embed: { fields: fields[0], footer: { text: `Page ${this.current + 1} of ${this.total}` } } }).then(async (msg) => {
            this.message = msg;
            await this.message.react(this.back);
            await this.message.react(this.next);
            if (this.total > 3)
                await this.message.react(this.stop);
            this.collector = this.message.createReactionCollector((reaction, user) => user.id === member.id && user.id !== this.message.author.id, { time: timeout * 1000 });

            this.collector.on("collect", (reaction) => {
                switch (reaction.emoji.toString()) {
                    case this.back:
                        this.current--;
                        if (this.current < 0)
                            this.current = this.total - 1;
                        reaction.remove(member);
                        break;
                    case this.next:
                        this.current++;
                        if (this.current > this.total - 1)
                            this.current = 0;
                        reaction.remove(member);
                        break;
                    case this.stop:
                        this.collector.stop();
                        this.message.clearReactions();
                        break;
                }
                this.refresh();
            });

            this.collector.on("end", () => this.message.clearReactions());

        });

    }

    refresh() {
        this.message.edit({ embed: { fields: this.fields[this.current], footer: { text: `Page ${this.current + 1} of ${this.total}` } } });
    }
};