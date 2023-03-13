const { Events } = require("discord.js");
const path = require("node:path");
const fs = require("node:fs");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isMessageComponent()) return;

    // Load commands and find one that matches button
    const customId = interaction.customId.split("--", 2)[0];
    console.log(customId);

    const commandsPath = path.join(__dirname, "../commands");
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => {
      return file.endsWith(".js") && file.split(".js")[0] === customId;
    });

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const event = require(filePath);
      if (event.onMessageInteraction) {
        await event.onMessageInteraction(interaction);
        console.debug("Interaction sent to " + file);
      }
    }
  },
};
