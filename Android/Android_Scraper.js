var scraper = require('google-play-scraper');

const fs = require("fs");
let urls = fs.readFileSync("Android.txt").toString().split(/\r?\n/);
for (const url of urls) {
    // console.log(url);
    var re = /=(.*)/; 
    var suffix = url.match(re);
    // console.log(suffix[1].toString());
    scraper.app({appId: suffix[1].toString()}).then(console.log, console.log);
    scraper.datasafety({appId: suffix}).then(console.log);
}