const fs = require("fs");
const path = require("path");
const daily = require("./daily.json");
const weekly = require("./weekly.json");

function newLineForEveryEntryButDontPrettifyEverything(obj) {
    return JSON.stringify(obj).replace(/\},\{/g, "},\n  {").replace("[", "[\n  ").slice(0, -1) + "\n]";
}

fetch("https://docs.google.com/spreadsheets/d/1qKlWKpDkOpU1ZF6V6xGfutDY2NvcA8MNPnsv6GBkKPQ/gviz/tq?tqx=out:csv&sheet=GDDL").then(r => r.text()).then(csv => {
    const lines = csv.replace(/\r/g, "").split("\n").map(l => l.slice(1, -1).split('","'));
    const header = lines.shift();
    const data = lines.map(l => Object.fromEntries(l.map((e, i) => [header[i], e])));

    for (const level of daily) {
        const gddl = data.find(d => d["ID"] == level.id);
        if (gddl) level.tier = !Number.isNaN(parseFloat(gddl["Tier"])) ? Math.round(parseFloat(gddl["Tier"])) : 0;
        else level.tier = 0;
    }
    
    for (const demon of weekly) {
        const gddl = data.find(d => d["ID"] == demon.id);
        if (gddl) demon.tier = !Number.isNaN(parseFloat(gddl["Tier"])) ? Math.round(parseFloat(gddl["Tier"])) : 0;
        else demon.tier = 0;
    }

    fs.writeFileSync(path.resolve(__dirname, "daily.json"), newLineForEveryEntryButDontPrettifyEverything(daily));
    fs.writeFileSync(path.resolve(__dirname, "weekly.json"), newLineForEveryEntryButDontPrettifyEverything(weekly));
});
