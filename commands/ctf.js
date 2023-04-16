// Use the events information command from the ctftime api
// https://ctftime.org/api/v1/events/?limit={number}&start={timestamp}&finish={timestamp}
// this is gonna grab the events happening two weeks from now?

const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const ctftimeApi = require("../utilities/ctftime-api");
const moment = require("moment");
// this is just a regular slash command that gets ctfs happening within a certain date range.

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ctfs")
    .setDescription("Interact with the CTFTime API")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("get")
        .setDescription("Get CTFs happening within a certain date range")
        .addIntegerOption((option) =>
          option
            .setName("finish")
            .setDescription("How many days after Current Time")
            .setRequired(true)
            .setMinValue(1)
        )
        .addIntegerOption((option) =>
          option
            .setName("start")
            .setDescription("Starting time period")
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName("limit")
            .setDescription("Number of CTFs you want")
            .setRequired(false)
            .setMinValue(1)
        )
    ),
  async execute(interaction) {
    console.log(
      `${interaction.user.username} (${interaction.user.id}) ran /ctfs in ${interaction.channel.name} (${interaction.channel.id})`
    );
    if (interaction.options.getSubcommand() === "get") {
      await interaction.deferReply();
      const start = moment().unix();
      const finish = start + interaction.options.getInteger("finish") * 86400;
      const limit = interaction.options.getInteger("limit") ?? 10;
      console.log("start %d, finish %d, limit %d", start, finish, limit);
      const upcomingEvents = await ctftimeApi.getEvents(start, finish, limit);
      let eventEmbeds = [];
      for (let eventIndex = 0; eventIndex < limit; eventIndex++) {
        const curEvent = upcomingEvents[eventIndex];
        const eventEmbed = new EmbedBuilder()
          .setColor("#FFBA44")
          .setTitle(curEvent.title)
          .setURL(curEvent.ctftime_url);
        if (curEvent.logo) eventEmbed.setThumbnail(curEvent.logo);
        if (curEvent.description)
          eventEmbed.setDescription(curEvent.description);
        if (curEvent.format)
          eventEmbed.addFields({ name: "Format", value: curEvent.format });
        if (curEvent.url)
          eventEmbed.addFields({ name: "Link", value: curEvent.url });
        if (curEvent.ctftime_url)
          eventEmbed.addFields({
            name: "CTFTime URL",
            value: curEvent.ctftime_url,
          });
        eventEmbed.addFields(
          {
            name: "Start",
            value: moment(curEvent.start).format("MMM Do YY hh:mm A Z"),
          },
          {
            name: "Finish",
            value: moment(curEvent.finish).format("MMM Do YY hh:mm A Z"),
          }
        );
        eventEmbeds.push(eventEmbed);
        interaction.followUp({ embeds: [eventEmbed] });
        //console.log(eventEmbeds)
      }
      console.log(eventEmbeds);
      //sample mark interest https://ctftime.org/event/1859?action=participate
    } else {
      await interaction.reply({ content: "An unknown error occurred" });
    }
  },
};
