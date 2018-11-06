const { Command } = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class FakeBan extends Command {
    constructor(client){
        super(client, {
            name: 'fakeban',
            group: 'fun',
            memberName: 'fakeban',
            examples: ['_fakeban @user LoLoLoLoL'],
            description: 'Fake ban a guild member.',
            args: [
                {
                    key: 'fUser',
                    prompt: 'Who to fake ban?',
                    type: 'user'
                },
                {
                    key: 'reason',
                    prompt: 'Reason for the fake ban.',
                    type: 'string'
                }
            ]
        })
    }
    async run(msg, { fUser, reason }){
        console.log(fUser);
        let fakeEmbed = new Discord.RichEmbed()
        .setTitle(`User Banned.`)
        .setDescription(`${fUser} has been banned from ${msg.guild.name}.`)
        .addField("Action by:", msg.author.tag)
        .addField("Banned User:", fUser)
        .addField("Reason", reason);
        msg.delete();
        msg.channel.send(fakeEmbed).then(msg.channel.send(`**${fUser}** has left the guild.`));
        fUser.send(`Lmao! You got ~~fake~~ banned from ${msg.guild.name}!`);
    }
}
