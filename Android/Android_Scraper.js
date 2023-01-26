const scraper = require('google-play-scraper');
const mysql = require('mysql');
const fs = require("fs");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'violet',
    database: 'appinfo'
  });

connection.query(
  `CREATE TABLE IF NOT EXISTS android_app_data (
    id int primary key auto_increment,
    app_name text,
    data_shared text,
    data_collected text
)`,
  function(err, results) {
    if (err) throw err;
    console.log('Table created');
  }
);

async function main() {
  let urls = fs.readFileSync("Android.txt").toString().split(/\r?\n/);
  var app_name, data_shared, data_collected;

  for (const url of urls) {
    var re = /=(.*)/; 
    var suffix = url.match(re);
    let privacy = await scraper.datasafety({appId: suffix[1].toString()});
    let info = await scraper.app({appId: suffix[1].toString()});
    app_name = info.title
    //console.log(privacy.sharedData);
    console.log(privacy.sharedData.data);
    let uniqueSharedTypes = [...new Set(privacy.sharedData.map(x => x.type))];
    //console.log(uniqueSharedTypes);
    let uniqueCollectedTypes = [...new Set(privacy.collectedData.map(x => x.type))];
    //console.log(uniqueCollectedTypes);

    let sql = `INSERT INTO android_app_data (app_name, data_shared, data_collected) VALUES ('${app_name}', '${uniqueSharedTypes}', '${uniqueCollectedTypes}')`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log('Data inserted');
    });
}
  connection.end();
}

main();
