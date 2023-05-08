const { google } = require("googleapis");

const { authorize } = require("../utilities/google-auth");

const config = require("../utilities/config");

module.exports = {
  async checkSubmission(userId) {
    let auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config["pbr"]["application sheet id"],
      range: config["pbr"]["application sheet discordid range"],
    });
    const rows = res.data.values;
    return rows.some((row) => row[0] && row[0].toString() === userId);
  },

  async onMessageInteraction(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (
      interaction.member.roles.cache.some((role) =>
        role.name.startsWith("PBR (ψβρ)")
      )
    ) {
      await interaction.followUp({
        ephemeral: true,
        content: "You already have the PBR role.",
      });
      return;
    }
    const submitted = await this.checkSubmission(interaction.user.id);
    if (submitted) {
      await interaction.member.roles.add(
        interaction.guild.roles.cache.find((role) =>
          role.name.startsWith("PBR (ψβρ)")
        )
      );
      await interaction.followUp({
        ephemeral: true,
        content: "PBR role given! Welcome to PBR!",
      });
    } else {
      await interaction.followUp({
        ephemeral: true,
        content:
          "It does not appear you have submitted the application for this quarter yet.",
      });
    }
  },
};
