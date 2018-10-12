const { Command } = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class ClearCommand extends Command {
    constructor(client){
        super(client, {
            name: 'clear',
            group: 'moderation',
            description: 'Clear num messages.',
            examples: ['_clear 50 // Clear 50 messages'],
            memberName: 'clear',
            userPermissions: ["MANAGE_MESSAGES"],
            args: [
                {
                key: 'delNumber',
                prompt: 'Amount of messages to delete',
                type: 'string'
                }
            ]
        })
        }
        async run(msg, { delNumber }){
            let deletedEmbed = new Discord.RichEmbed()
            .setDescription(`:white_check_mark: | Successfully deleted ${delNumber} messages.`);
            delNumber = parseInt(delNumber);
            try {
            await msg.channel.bulkDelete(delNumber);
            msg.say(deletedEmbed).then(msg => msg.delete(2000));
            }catch(e) {
                console.error(e.stack);
            }
        }
    }