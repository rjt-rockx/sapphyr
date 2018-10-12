const { Command } = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class EightBallCommand extends Command {
    constructor(client){
        super(client, {
            name: '8ball',
            group: 'fun',
            memberName: '8ball',
            description: 'Bot replies with random yes or no response in many varients.',
            examples: ['_8ball is sapphyr awesome?']
        })
    }
    async run(msg){
        let choices = [
            "Yes.",
            "No.",
            "Maybe.",
            "Studies agree.",
            "Studies do not agree.",
            "Yup.",
            "Indeed.",
            "For sure.",
            "Umm...no.",
            "Nope.",
            "Really, no, just no.",
            "No u.",
            "Nah."
        ];
        let choicesIndex = choices[Math.floor(Math.random() * choices.length)];
        let responseEmbed = new Discord.RichEmbed()
        .setDescription(choicesIndex);
        msg.channel.send(responseEmbed);
    }
}