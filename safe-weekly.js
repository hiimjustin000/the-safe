const fs = require("fs");
const path = require("path");
const safeWeekly = require("./ignore/safe-weekly.json");
const weekly = require("./weekly-safe.json");

const months = {
    "Jan": 1,
    "Feb": 2,
    "Mar": 3,
    "March": 3,
    "Apr": 4,
    "May": 5,
    "Jun": 6,
    "June": 6,
    "Jul": 7,
    "Aug": 8,
    "Sep": 9,
    "Oct": 10,
    "Nov": 11,
    "Dec": 12
}

// Convert something like "Jan 1st, 2021" to "2021-01-01"
function dateToIntl(date) {
    const [month, day, year] = date.split(" ");
    if (!months[month]) console.log(month);
    return `${year}-${months[month].toString().padStart(2, "0")}-${day.slice(0, -3).padStart(2, "0")}`;
}

function timelineToIntlArray(timeline) {
    const [lower, upper] = timeline.split(" - ").map(dateToIntl);
    const result = [];
    for (let i = new Date(lower); i < new Date(upper); i.setDate(i.getDate() + 1)) {
        result.push(i.toISOString().slice(0, 10));
    }
    return result;
}

const levels = [];
for (const level of weekly) {
    const safeLevel = safeWeekly.find(l => l.id == level.id);
    if (!safeLevel) {
        console.log(`${level.name} by ${level.creator} is not in safe-weekly.json`);
        continue;
    }
    const match = safeLevel.date.match(/[A-Z][a-z]+ \d+[a-z]{2}, \d+ - [A-Z][a-z]+ \d+[a-z]{2}, \d+/);
    if (!match) {
        console.log(`${level.name} by ${level.creator} has an invalid date`);
        // try to accomodate for it being only one date
        const singleMatch = safeLevel.date.match(/[A-Z][a-z]+ \d+[a-z]{2}, \d+/);
        if (singleMatch) {
            console.log(`Single date found: ${singleMatch[0]}`);
            levels.push({
                id: level.id,
                weeklyID: parseInt(safeLevel.daily.split("#")[1]),
                dates: [dateToIntl(singleMatch[0])]
            });
        }
        continue;
    }
    levels.push({
        id: level.id,
        weeklyID: parseInt(safeLevel.daily.split("#")[1]),
        dates: timelineToIntlArray(safeLevel.date.match(/[A-Z][a-z]+ \d+[a-z]{2}, \d+ - [A-Z][a-z]+ \d+[a-z]{2}, \d+/)[0]),
    });
}

fs.writeFileSync(path.resolve(__dirname, "weekly-dates.json"), JSON.stringify(levels, null, 2));
