const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
let owners = require('../../localdata/config.json');
let embeds = require('../../utils/otherEmbeds.js');

module.exports = class YesBall extends Command {
    constructor(client){
        super(client, {
            name: 'yesball',
            memberName: 'yesball',
            group: 'fun',
            description: 'Bot answers 8ball with yes, bot owner only.',
            examples: ['_yesball Is Sapphyr Cool?... Sapphyr: Yes.'],
            args: [
                {
                    key: 'ques',
                    prompt: 'The question',
                    type: 'string'
                }
            ]
        })
    }
    async run(msg, { ques }) {
        if(msg.author.id !== "375772663794106368") return msg.reply("You can't do this.");
        let yesOptions = [
            "Yes.",
            "Yup.",
            "Yee.",
            "Yeah.",
            "For sure.",
            "Indeed.",
            "Studies agree.",
            "We all know that, of course it's a yes."
        ];
        let yesIndex = yesOptions[Math.floor(Math.random() * yesOptions.length)];
        return embeds.textEmbed(yesIndex);
    }
}