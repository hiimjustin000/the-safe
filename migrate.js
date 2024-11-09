const fs = require("fs");
const path = require("path");
const daily = require("./daily.json");
const weekly = require("./weekly.json");
const event = require("./event.json");

function newLineForEveryEntryButDontPrettifyEverything(obj) {
    return JSON.stringify(obj).replace(/\},\{/g, "},\n  {").replace("[", "[\n  ").slice(0, -1) + "\n]";
}

const newDaily = [];
const newWeekly = [];
const newEvent = [];

for (const level of daily) {
    newDaily.push({
        id: level.id,
        timelyID: level.dailyID,
        dates: level.date.length > 0 ? [level.date] : [],
        tier: level.tier,
    });
}

for (const demon of weekly) {
    newWeekly.push({
        id: demon.id,
        timelyID: demon.weeklyID,
        dates: demon.dates,
        tier: demon.tier,
    });
}

for (const level of event) {
    newEvent.push({
        id: level.id,
        timelyID: level.eventID,
        dates: level.dates,
        tier: level.tier,
    });
}

fs.writeFileSync(path.resolve(__dirname, "v2", "daily.json"), newLineForEveryEntryButDontPrettifyEverything(newDaily));
fs.writeFileSync(path.resolve(__dirname, "v2", "weekly.json"), newLineForEveryEntryButDontPrettifyEverything(newWeekly));
fs.writeFileSync(path.resolve(__dirname, "v2", "event.json"), newLineForEveryEntryButDontPrettifyEverything(newEvent));