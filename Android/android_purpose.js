const scraper = require('google-play-scraper');
const mysql = require('mysql');
const fs = require('fs');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'violet',
    database: 'appinfo'
  });

connection.query(
  `CREATE TABLE IF NOT EXISTS android_purpose (
    id int primary key auto_increment,
    app_name text,
    account_management text,
    advertising_or_marketing text,
    analytics text,
    app_functionality text,
    developer_communications text,
    fraud_prevention_security_and_compliance text,
    personalization text
)`,
  function(err, results) {
    if (err) throw err;
    console.log('Table created');
  }
);

async function main() {
  let urls = fs.readFileSync('Android.txt').toString().split(/\r?\n/);
  var app_name, account_management, advertising_or_marketing,analytics,app_functionality,developer_communications,fraud_prevention_security_and_compliance,personalization;

  for (const url of urls) {
    var re = /=(.*)/; 
    var suffix = url.match(re);
    let privacy = await scraper.datasafety({appId: suffix[1].toString()});
    //console.log(privacy);
    let info = await scraper.app({appId: suffix[1].toString()});
    app_name = info.title
    //console.log(privacy.sharedData);

    let allData = privacy.sharedData.concat(privacy.collectedData);
    let purposes = {
        "Account management": [],
        "Advertising or marketing": [],
        "Analytics": [],
        "App functionality": [],
        "Developer communications": [],
        "Fraud prevention": [],
        "Personalization": []
    };
    
    for (const data of allData) {
        let dataPurposes = data.purpose.split(', ');
        //console.log(dataPurposes)
        for (const purpose of dataPurposes) {
            if (purposes.hasOwnProperty(purpose)) {
                purposes[purpose].push(data.data);
            }
        }
    }

    account_management = [...new Set(purposes["Account management"])];
    advertising_or_marketing = [...new Set(purposes["Advertising or marketing"])];
    analytics = [...new Set(purposes["Analytics"])];
    app_functionality = [...new Set(purposes["App functionality"])];
    developer_communications = [...new Set(purposes["Developer communications"])];
    fraud_prevention_security_and_compliance = [...new Set(purposes["Fraud prevention"])];
    personalization = [...new Set(purposes["Personalization"])];

    let sql = `INSERT INTO android_purpose (app_name, account_management, advertising_or_marketing,analytics,app_functionality,developer_communications,fraud_prevention_security_and_compliance,personalization) 
      VALUES ('${app_name}', '${account_management}', '${advertising_or_marketing}', '${analytics}', 
      '${app_functionality}', '${developer_communications}', '${fraud_prevention_security_and_compliance}', '${personalization}')`;
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log('Data inserted');
    });
  }
  connection.end();
}

main();
