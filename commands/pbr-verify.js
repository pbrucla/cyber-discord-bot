const { google } = require("googleapis");

const { JWT } = require("google-auth-library");
const credentials_jwt = require("../credentials.json");

// If modifying these scopes, delete token.json.
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/forms.body.readonly",
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  return new JWT({
    email: credentials_jwt.client_email,
    key: credentials_jwt.private_key,
    scopes: SCOPES,
  });
}

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
