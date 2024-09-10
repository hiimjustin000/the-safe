const daily = require("./daily.json");
const dailyDates = daily.map(l => l.date);

const duplicatesDaily = [];
for (const date of dailyDates) {
    if (!duplicatesDaily.includes(date)) duplicatesDaily.push(date);
    else console.log(date);
}

const weekly = require("./weekly.json");
const weeklyDates = weekly.map(l => l.dates);

const duplicatesWeekly = [];
for (const dates of weeklyDates) {
    for (const date of dates) {
        if (!duplicatesWeekly.includes(date)) duplicatesWeekly.push(date);
        else console.log(date);
    }
}
