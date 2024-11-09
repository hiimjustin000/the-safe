const fs = require("fs");
const path = require("path");
const daily = require("./v2/daily.json");
const weekly = require("./v2/weekly.json");
const event = require("./v2/event.json");

const LEVELID = parseInt(process.argv[2]); // -1 for daily, -2 for weekly, -3 for event

function parseResponse(res) {
    const responses = res.split("#");
    const l = Object.fromEntries(responses[0].split(":").map((e, i, a) => i % 2 == 0 ? [e, a[i + 1]] : null).filter(e => e != null));
    const dailyInfo = {};
    if (LEVELID == -1) {
        dailyInfo.timelyID = parseInt(l[41]);
        const dailyDate = new Date(daily[0].dates[0]);
        dailyDate.setUTCDate(dailyDate.getUTCDate() + (dailyInfo.timelyID - daily[0].timelyID));
        dailyInfo.dates = [dailyDate.getUTCFullYear() + "-" + (dailyDate.getUTCMonth() + 1).toString().padStart(2, "0") + "-" + dailyDate.getUTCDate().toString().padStart(2, "0")];
    }
    else if (LEVELID == -2) {
        dailyInfo.timelyID = parseInt(l[41]) - 100000;
        dailyInfo.dates = weekly[0].dates.map(d => {
            const date = new Date(d);
            date.setUTCDate(date.getUTCDate() + (dailyInfo.timelyID - weekly[0].timelyID) * 7);
            return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1).toString().padStart(2, "0") + "-" + date.getUTCDate().toString().padStart(2, "0");
        });
    }
    else if (LEVELID == -3) {
        dailyInfo.timelyID = parseInt(l[41]) - 200000;
        dailyInfo.dates = [];
    }
    return {
        id: parseInt(l[1]),
        ...dailyInfo,
        tier: 0
    };
}

function newLineForEveryEntryButDontPrettifyEverything(obj) {
    return JSON.stringify(obj).replace(/\},\{/g, "},\n  {").replace("[", "[\n  ").slice(0, -1) + "\n]";
}

fetch("https://www.boomlings.com/database/downloadGJLevel22.php", {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": ""
    },
    body: `gameVersion=22&binaryVersion=42&levelID=${LEVELID}&secret=Wmfd2893gb7`,
}).then(r => r.text()).then(res => {
    console.log(JSON.stringify(parseResponse(res)));
    if (LEVELID == -1)
        fs.writeFileSync(path.join(__dirname, "v2", "daily.json"), newLineForEveryEntryButDontPrettifyEverything([parseResponse(res), ...daily]));
    else if (LEVELID == -2)
        fs.writeFileSync(path.join(__dirname, "v2", "weekly.json"), newLineForEveryEntryButDontPrettifyEverything([parseResponse(res), ...weekly]));
    else if (LEVELID == -3)
        fs.writeFileSync(path.join(__dirname, "v2", "event.json"), newLineForEveryEntryButDontPrettifyEverything([parseResponse(res), ...event]));
});
