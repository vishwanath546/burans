const { google } = require("googleapis");
let data = {
  type: "service_account",
  project_id: "titanium-vim-352312",
  private_key_id: "692ea2586e8629f7193d294b4c1e13ff3effa89a",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDO4QuNpwaYQ+FU\nUHYraPBYXU/5vxz47bBtMqF1fCXNSHlEYFZqKPhA7VC5mRqxh0gn2/NCmocHdxWT\nxnzNx/u2aZZYdeI7MkFL/wfgSgwPvEmPQFFR09a/Q/TpT1MNaShhh6VZ9WTN/eUI\n8lTiJkYLOLDMKZ8T+XDPz62Mk88PjuMyekDXBNzljX/aDHsZHBW0FSWW4+4mNTTw\nvWMKr3RAbC9FNJcRupHZPfvaX3ttDtrmLRPuBTvpUqsh44GAfbI31xHE/BmgaoIr\nV2hmR1zKur4nefJ9x6HU8RE89e9eJFqA+/dOB5IeFRKmdgpGQlJK6uVCwT7/BVYN\nXyExxejPAgMBAAECggEAVBOU2PBRF0+7A0OiCtlemGLv7k1zzlz3DyH9CVy3ljrG\ngfnvFLzqy6RG4u7ssMqMkhprPh3EE84bWE/aB92nGEbIIdJi63DspaCTiF0/kqOQ\nd6YJhopj456QKcOhurkKfrycgDdhTPBLBTxLMA+i9suG2qptqrX82ZAK9a9afvT1\nOXFC4sdmmBKF4c1zw7d+oEzMTd5wN0KuzFsksf7BXL+djfc2f/3eWDwpmF5WIYAz\nUpz+WK/o3+tUmB1Kt3nhw7I3CrBxQXOTo48PoWGOZNcdbSO5/ddogFEsPXs0WTfH\nhwDiLaCEhP0eqnk0WToCSAuNbRakqlP+AJfz+gD1xQKBgQD2HN5eDx6s+W/ekpax\nDQ0TeCq+XELmpAOZcQ1C9YRurJ7Tt03hb/m8LIMIpEcV8O2NQH0xzeUfqB94eS2Q\nEjjNY4Oxfka41oyZQSZmZdJN6z+v9MRbfFy6YrvWSKhxJ4gaCRC8IhytvGKnCHhQ\nRYitygXQ2c7sQVFF6ahf9ykxlQKBgQDXMK4ccL+C6Ln96Z015uhGh/zBbWtN9HAr\nMRW+T+3TfcXKV3B5CdQwbmOwIbbuGJWdamZSRFvSYbHfrsMmqrI+Hs+ZTX6T/s3m\nncg64j3NnvBRs+IEqKQdImMDurrTmAcGUMk/YtnJcLV8KGY5vJ0tgu3mDUe3CJJF\nMxGfRE0f0wKBgQDtx5p32bfTevNAYPRCfs+BXfo+DLl+SDxKBVXAuaCHpTOWbWVL\nR3pK+d5nfQBJDIsWi5Xphnm2CiLNrJX+ufwzQ9A6rjv53R/d+Xn2OK3lJkJT5/HG\nSfL1COtd7rj/CiiOru+CNJrsqDPQGXjUZTnWXncb/zPSQpEZMNTCUvNzuQKBgQCQ\nMcuJvTdnNiFjdoZk1xywHnGM/5AWxYPgPVzvkMmxnSbLZno0cRShe2cLYBwfQZQH\nzoNP/wR0Xgh99bJJF7qmi6jadiYqb2Rzcyj35CA7x5QLe3kpXAPUjfVBS3/jR4z1\ne27PLaL4K7FAyCVv7OZ517EoJZ/3kyPIgOb/DRqNBwKBgBYjl3Murk46GOzWwWID\n5vlBbp2UkxFk/zF4TBPOVZdh3ENBhy3ucwBcmW3GgoD+mDUNeA3nfLT4IuzsReYO\n2YOsmQmYGem9uKA+1wEKA6NVHMDZbP+3QO07yu4J4uftH8tC2tBWL6MbFPuZWQYc\nmyuKZ6LhvhvtdO5Lw1HUlQvJ\n-----END PRIVATE KEY-----\n",
  client_email: "calender-node@titanium-vim-352312.iam.gserviceaccount.com",
  client_id: "111268461323824368502",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/calender-node%40titanium-vim-352312.iam.gserviceaccount.com",
};
// Provide the required configuration
const CREDENTIALS = data;
const calendarId = "vnijampurkar0408@gmail.com";

// Google calendar API settings
const SCOPES = "https://www.googleapis.com/auth/calendar";
const calendar = google.calendar({ version: "v3" });

const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  null,
  CREDENTIALS.private_key,
  SCOPES
);

// Your TIMEOFFSET Offset
const TIMEOFFSET = "+05:30";

// Get date-time string for calender
const dateTimeForCalander = (newdate = "") => {
  let date = new Date();
  if (newdate != "") {
    date = new Date(newdate);
  }

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }
  let day = date.getDate();
  if (day < 10) {
    day = `0${day}`;
  }
  let hour = date.getHours();
  if (hour < 10) {
    hour = `0${hour}`;
  }
  let minute = date.getMinutes();
  if (minute < 10) {
    minute = `0${minute}`;
  }

  let newDateTime = `${year}-${month}-${day}T${hour}:${minute}:00.000${TIMEOFFSET}`;

  let event = new Date(Date.parse(newDateTime));

  let startDate = event;
  // Delay in end time is 1
  let endDate = new Date(
    new Date(startDate).setHours(startDate.getHours() + 1)
  );

  return {
    start: startDate,
    end: endDate,
  };
};

// Insert new event to Google Calendar
const insertEvent = async (event) => {
  try {
    let response = await calendar.events.insert({
      auth: auth,
      calendarId: calendarId,
      resource: event,
    });

    if (response["status"] == 200 && response["statusText"] === "OK") {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(`Error at insertEvent --> ${error}`);
    return 0;
  }
};

let dateTime = dateTimeForCalander();
console.log(dateTime);

// Event for Google Calendar
let event = {
  summary: `This is the summary.`,
  description: `This is the description.`,
  start: {
    dateTime: dateTime["start"],
    timeZone: "Asia/Kolkata",
  },
  end: {
    dateTime: dateTime["end"],
    timeZone: "Asia/Kolkata",
  },
};

// insertEvent(event)
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// Get all the events between two dates
const getEvents = async (dateTimeStart, dateTimeEnd) => {
  try {
    let response = await calendar.events.list({
      auth: auth,
      calendarId: calendarId,
      timeMin: dateTimeStart,
      timeMax: dateTimeEnd,
      timeZone: "Asia/Kolkata",
    });

    let items = response["data"]["items"];
    return items;
  } catch (error) {
    console.log(`Error at getEvents --> ${error}`);
    return 0;
  }
};

let start = dateTimeForCalander("2022-06-01");
let end = dateTimeForCalander("2022-06-30");

getEvents(start, end)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });

// Delete an event from eventID
const deleteEvent = async (eventId) => {
  try {
    let response = await calendar.events.delete({
      auth: auth,
      calendarId: calendarId,
      eventId: eventId,
    });

    if (response.data === "") {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(`Error at deleteEvent --> ${error}`);
    return 0;
  }
};

let eventId = "hkkdmeseuhhpagc862rfg6nvq4";

deleteEvent(eventId)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
