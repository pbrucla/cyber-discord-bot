const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const google = require("@googleapis/forms");
const { JWT } = require("google-auth-library");
const credentials_jwt = require("../credentials.json");

async function authorize() {
  return new JWT({
    email: credentials_jwt.client_email,
    key: credentials_jwt.private_key,
    scopes: ["https://www.googleapis.com/auth/forms.body.readonly"],
  });
}
async function getFormData(formID) {
  const auth = await authorize();
  const forms = google.forms({
    version: "v1",
    auth: auth,
  });
  console.log("'" + formID + "'");
  const res = await forms.forms.get({ formId: formID });
  console.log(res.data.items);
  return res.data;
}

rl.question("formID: ", (r) => getFormData(r.trim()));
