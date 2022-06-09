var eventlist = [];
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const Formatedate = require("date-and-time");

exports.googleCalender = (req, res, next) => {
  res.render("client/pages/googleCalender", {
    title: "GoogleCalender",
    url: req.url,
  });
};

exports.get_events = async (req, res, next) => {
  var tokn = req.body.code;

  // If modifying these scopes, delete token.json.
  const SCOPES = ["https://www.googleapis.com/auth/calendar"];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = "token.json";
  // Load client secrets from a local file.
  await fs.readFile("credentials.json", async (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    // Authorize a client with credentials, then call the Google Calendar API.
    await authorize(JSON.parse(content), await listEvents);
    // console.log("eventlist", eventlist);
    res.send(eventlist);

    eventlist = [];
  });

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  async function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    await fs.readFile(TOKEN_PATH, async (err, token) => {
      if (err) return await getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Lists the next 10 events on the user's primary calendar.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  async function listEvents(auth) {
    const calendar = await google.calendar({ version: "v3", auth });
    calendar.events.list(
      {
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: "startTime",
      },
      (err, res) => {
        if (err) return console.log("The API returned an error: " + err);
        const events = res.data.items;
        if (events.length) {
          // console.log("Upcoming 10 events:", events);
          events.map((event, i) => {
            let startdate = new Date(event.start.dateTime || event.start.date);

            let endtdate = new Date(event.end.dateTime || event.end.date);
            eventlist.push({
              id: event.id,
              title: event.summary,
              start: Formatedate.format(startdate, "YYYY-MM-DD HH:mm:ss"),
              end: Formatedate.format(endtdate, "YYYY-MM-DD HH:mm:ss"),
              email_from: event.creator.email,
              created: event.created,
              htmlLink: event.htmlLink,
              hangoutLink: event.hangoutLink || "",
              description: event.description || "",
            });
          });
        } else {
          console.log("No upcoming events found.");
        }
      }
    );
  }
};

exports.insert_events = async (req, res, next) => {
  var tokn = req.body.code;

  // If modifying these scopes, delete token.json.
  const SCOPES = ["https://www.googleapis.com/auth/calendar"];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = "token.json";
  // Load client secrets from a local file.
  await fs.readFile("credentials.json", async (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    // Authorize a client with credentials, then call the Google Calendar API.
    await authorize(JSON.parse(content), await CreateEvents);
  });

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  async function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    await fs.readFile(TOKEN_PATH, async (err, token) => {
      if (err) return await getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Lists the next 10 events on the user's primary calendar.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  async function CreateEvents(auth) {
    const calendar = await google.calendar({ version: "v3", auth });
    var event = {
      summary: req.body.title,
      location: "",
      description: req.body.description,
      start: {
        dateTime: req.body.startdate,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: req.body.enddate,
        timeZone: "Asia/Kolkata",
      },
      recurrence: ["RRULE:FREQ=DAILY;COUNT=1"],
      attendees: [
        { email: "vnathn.fyntune@gmail.com" },
        // { email: req.body.people },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
    };
    console.log(event);
    calendar.events.insert(
      {
        auth: auth,
        calendarId: "primary",
        resource: event,
      },
      function (err, event) {
        if (err) {
          res.status(201).json({
            status: false,
            body: err,
            msg: "There was an error contacting the Calendar service: ",
          });
        } else {
          res.status(200).json({
            status: true,
            body: event,
            msg: "Event created: ",
          });
        }
      }
    );
  }
};
