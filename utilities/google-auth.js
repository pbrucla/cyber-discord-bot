import { JWT } from "google-auth-library"
import credentials_jwt from "../credentials.json" with { type: "json" };

const SCOPES = [
  "https://www.googleapis.com/auth/drive"
];

export async function authorize() {
    return new JWT({
      email: credentials_jwt.client_email,
      key: credentials_jwt.private_key,
      scopes: SCOPES,
    });
}

