const fs = require("fs");
const path = require("path");
const safeDaily = require("./ignore/safe-daily.json");
const daily = require("./daily-safe.json");

const months = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12
}

// Convert something like "January 1st, 2021" to "2021-01-01"
function dateToIntl(date) {
    const [month, day, year] = date.split(" ");
    return `${year}-${months[month].toString().padStart(2, "0")}-${day.slice(0, -3).padStart(2, "0")}`;
}

const levels = [];
for (const level of daily) {
    const safeLevel = safeDaily.find(l => l.id == level.id);
    if (!safeLevel) {
        console.log(`${level.name} by ${level.creator} is not in safe-daily.json`);
        continue;
    }
    const match = safeLevel.date.match(/[A-Z][a-z]+ \d+[a-z]{2}, \d+/);
    if (!match) {
        console.log(`${level.name} by ${level.creator} has an invalid date`);
        continue;
    }
    levels.push({
        id: level.id,
        dailyID: parseInt(safeLevel.daily.split("#")[1]),
        date: !safeLevel.date.includes("Former") ? dateToIntl(safeLevel.date.match(/[A-Z][a-z]+ \d+[a-z]{2}, \d+/)[0]) : ""
    });
}

fs.writeFileSync(path.resolve(__dirname, "daily-dates.json"), JSON.stringify(levels, null, 2));
