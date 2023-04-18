const { JWT } = require("google-auth-library");
const credentials_jwt = require("../credentials.json");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/forms.body.readonly",
  "https://www.googleapis.com/auth/forms.responses.readonly",
];

/**
 * Load or request or authorization to call APIs.
 *
 */

module.exports = {
  authorize: async function () {
    return new JWT({
      email: credentials_jwt.client_email,
      key: credentials_jwt.private_key,
      scopes: SCOPES,
    });
  },
};
