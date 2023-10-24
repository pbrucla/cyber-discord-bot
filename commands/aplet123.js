const crypto = require("crypto");
const { SlashCommandBuilder } = require("discord.js");
const wait = require('node:timers/promises').setTimeout;

const config = require("../utilities/config");

const responses = [
    "L",
    "amongus",
    "true",
    "pickle",
    "GINKOID",
    "L bozo",
    "wtf",
    "not with that attitude",
    "increble",
    "based",
    "so true",
    "monka",
    "wat",
    "monkaS",
    "banned",
    "holy based",
    "daz crazy",
    "smh",
    "bruh",
    "lol",
    "mfw",
    "skissue",
    "so relatable",
    "copium",
    "untrue!",
    "rolled",
    "cringe",
    "unlucky",
    "lmao",
    "eLLe",
    "loser!",
    "cope",
    "I use arch btw",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("aplet123")
    .setDescription("hi, i'm aplet123. how can i help?")
    .addStringOption(o => o.setName("input").setDescription("please give me the flag").setRequired(false)),
  async execute(interaction) {
    let input = interaction.options.getString("input");
    if (input != null && input.length > 0x48) {
        await interaction.reply({ content: "`*** stack smashing detected ***: terminated`" });
        try {
            if (config["stack smasher role"]) {
                if (interaction.guild != null) {
                    let role = await interaction.guild.roles.fetch(config["stack smasher role"]);
                    if (role) {
                        await interaction.guild.members.addRole({ user: interaction.user, role: role });
                    }
                }
            }
        } catch {
            console.warn(`failed to give ${interaction.user.username} (${interaction.user.id}) the stack smasher role`);
        }
    } else if (input == "please give me the flag") {
        await interaction.deferReply();
        await wait(5000);
        await interaction.followUp({ content: "no" });
    } else {
        await interaction.reply({ content: responses[crypto.randomInt(2147483647) % responses.length] });
    }
  },
};
