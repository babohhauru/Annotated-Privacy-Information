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
  `CREATE TABLE IF NOT EXISTS android_data (
    id int primary key auto_increment,
    app_name text,
    app_activity text,
    app_info_and_performance text,
    audio_files text,
    calendar text,
    contacts text,
    device_or_other_IDs text,
    files_and_docs text,
    financial_info text,
    health_and_fitness text,
    location text,
    messages text,
    personal_info text,
    photos_and_videos text,
    web_browsing text
)`,
  function(err, results) {
    if (err) throw err;
    console.log('Table created');
  }
);

async function main() {
  let urls = fs.readFileSync('Android.txt').toString().split(/\r?\n/);
  var app_name, app_activity, app_info_and_performance,audio_files,calendar,contacts,device_or_other_IDs,
    files_and_docs,financial_info,health_and_fitness,location,messages,personal_info,photos_and_videos,web_browsing;

    for (const url of urls) {
        var re = /=(.*)/; 
        var suffix = url.match(re);
        let privacy = await scraper.datasafety({appId: suffix[1].toString()});
        //console.log(privacy);
        let info = await scraper.app({appId: suffix[1].toString()});
        app_name = info.title
        //console.log(privacy.sharedData);

        let allData = privacy.sharedData.concat(privacy.collectedData);
        personal_info = [...new Set(allData.filter(item => item.type === 'Personal info').map(item => item.data))];
        app_info_and_performance = [...new Set(allData.filter(item => item.type === 'App info and performance').map(item => item.data))];
        app_activity = [...new Set(allData.filter(item => item.type === 'App activity').map(item => item.data))];
        audio_files = [...new Set(allData.filter(item => item.type === 'Audio files').map(item => item.data))];
        calendar = [...new Set(allData.filter(item => item.type === 'Calendar').map(item => item.data))];
        contacts = [...new Set(allData.filter(item => item.type === 'Contacts').map(item => item.data))];
        device_or_other_IDs = [...new Set(allData.filter(item => item.type === 'Device or other IDs').map(item => item.data))];
        files_and_docs = [...new Set(allData.filter(item => item.type === 'Files and docs').map(item => item.data))];
        financial_info = [...new Set(allData.filter(item => item.type === 'Financial info').map(item => item.data))];
        health_and_fitness = [...new Set(allData.filter(item => item.type === 'Health and fitness').map(item => item.data))];
        messages = [...new Set(allData.filter(item => item.type === 'Messages').map(item => item.data))];
        photos_and_videos = [...new Set(allData.filter(item => item.type === 'Photos and videos').map(item => item.data))];
        web_browsing = [...new Set(allData.filter(item => item.type === 'Web browsing').map(item => item.data))];
        location = [...new Set(allData.filter(item => item.type === 'Location').map(item => item.data))];

        let sql = `INSERT INTO android_data (app_name, app_activity, app_info_and_performance,audio_files,calendar,contacts,device_or_other_IDs,files_and_docs,financial_info,
            health_and_fitness,location,messages,personal_info,photos_and_videos,web_browsing) VALUES ('${app_name}', '${app_activity}', '${app_info_and_performance}', '${audio_files}', 
            '${calendar}', '${contacts}', '${device_or_other_IDs}', '${files_and_docs}', '${financial_info}', '${health_and_fitness}', '${location}', '${messages}', '${personal_info}', 
            '${photos_and_videos}', '${web_browsing}')`;
        connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log('Data inserted');
        });
    }
    connection.end();
}

main();
