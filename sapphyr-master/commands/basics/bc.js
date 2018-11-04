exports.run = async (client,msg,args) => {
  const sendDel = await msg.channel.send("Deleting bot messages...");

  msg.channel.fetchMessages().then(messages => {
        const botMessages = messages.filter(msg => msg.author.bot);
        msg.channel.bulkDelete(botMessages);
        // messagesDeleted = botMessages.array().length;
  });
  msg.channel.send(":white_check_mark: I've deleted all the bot messages I could find.");
};
exports.help = {
  name: "bc"
};
