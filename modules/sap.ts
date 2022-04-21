const request = require("request");
request(
  "https://sapui5.hana.ondemand.com/versionoverview.html",
  function (error, response, body) {
    console.error("error:", error); // Print the error if one occurred
    console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
    console.log("body:", body); // Print the HTML for the Google homepage.
  }
);
