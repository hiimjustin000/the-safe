const fs = require("fs");
const path = require("path");
const dailyDates = require("./daily-dates.json");
const dailySafe = require("./daily-safe.json");
const weeklyDates = require("./weekly-dates.json");
const weeklySafe = require("./weekly-safe.json");

const daily = [];
for (const level of dailySafe) {
    const date = dailyDates.find(l => l.id == level.id);
    if (!date) {
        console.log(`${level.name} is not in daily-safe.json`);
        continue;
    }
    daily.push({
        id: level.id,
        dailyID: date.dailyID,
        date: date.date,
        name: level.name,
        creator: level.creator,
        stars: level.stars,
        difficulty: level.difficulty,
        feature: level.feature,
        coins: level.coins,
        coinsVerified: level.coinsVerified
    });
}

const weekly = [];
for (const level of weeklySafe) {
    const date = weeklyDates.find(l => l.id == level.id);
    if (!date) {
        console.log(`${level.name} is not in weekly-safe.json`);
        continue;
    }
    weekly.push({
        id: level.id,
        weeklyID: date.weeklyID,
        dates: date.dates,
        name: level.name,
        creator: level.creator,
        stars: level.stars,
        difficulty: level.difficulty,
        feature: level.feature,
        coins: level.coins,
        coinsVerified: level.coinsVerified
    });
}

function newLineForEveryEntryButDontPrettifyEverything(obj) {
    return JSON.stringify(obj).replace(/\},\{/g, "},\n  {").replace("[", "[\n  ").slice(0, -1) + "\n]";
}

fs.writeFileSync(path.resolve(__dirname, "daily.json"), newLineForEveryEntryButDontPrettifyEverything(daily));
fs.writeFileSync(path.resolve(__dirname, "weekly.json"), newLineForEveryEntryButDontPrettifyEverything(weekly));
