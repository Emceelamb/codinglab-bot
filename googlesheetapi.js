const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

// Load client secrets from a local file.
function fetchGoogle() {
  /* vince's note */
  // return a Promise function back to syncbot.js
  // and unpack the pulled data there
  return new Promise((resolve, reject) => {
    fs.readFile("./secret/google-credentials.json", (err, content) => {
      if (err) return console.log("Error loading client secret file:", err);
      // Authorize a client with credentials, then call the Google Sheets API.

      /* vince's note */
      // the .then() here is unpacking the read content from fs.readFile
      // returned from authorize()
      authorize(JSON.parse(content), datapull).then(unresolvedData => {
        // the unresolved data here is the raw data
        // coming from datapull()
        resolve(unresolvedData);
      });
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, pullData) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.

  /* vince's note */
  // return a Promise function back to fetchGoogle()
  // and unpack the read data there
  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, pullData);

      oAuth2Client.setCredentials(JSON.parse(token));
      const unresolvedData = pullData(oAuth2Client);

      resolve(unresolvedData);
    });
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function datapull(auth) {
  const sheets = google.sheets({ version: "v4", auth });

  /* vince's note */
  // return this unresolved Promise function
  // and unpack it in synbot.js (entry point of the bot)
  return sheets.spreadsheets.values.get({
    spreadsheetId: "1cg9E0APQNpHEHJ3nklFEv_RFF2-h51qdXEe-6h55FiQ",
    range: "bot"
  });
}

exports.fetchGoogle = fetchGoogle;
