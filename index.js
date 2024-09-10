const fs = require("fs");
const path = require("path");

let intervalID = 0;

const totalData = [];

function getDifficultyAndFeature(level) {
    const denominator = Number(level[8]);
    const numerator = Number(level[9]);
    const isDemon = Number(level[17]) > 0;
    const isAuto = Number(level[25]) > 0;
    const demonDifficulty = Number(level[43]);
    let difficulty = 0;
    let feature = 0;
    if (isDemon) difficulty = demonDifficulty > 0 ? demonDifficulty + 4 : 6;
    else if (isAuto) difficulty = -1;
    else if (denominator <= 0) difficulty = 0;
    else difficulty = Math.floor(numerator / denominator);

    const isFeatured = Number(level[19]) > 0;
    const epicFeature = Number(level[42]);
    if (isFeatured) feature = epicFeature > 0 ? epicFeature + 1 : 1;
    else feature = 0;

    return { difficulty, feature };
}

function parseResponse(res) {
    const responses = res.split("#");
    const levels = responses[0].split("|").map(l => Object.fromEntries(l.split(":").map((e, i, a) => i % 2 == 0 ? [e, a[i + 1]] : null).filter(e => e != null)));
    const creators = Object.fromEntries(responses[1].split("|").map(c => c.split(":")).map(c => [c[0], { player: c[0], username: c[1], account: c[2] }]));
    return levels.map(l => ({
        id: parseInt(l[1]),
        name: l[2],
        creator: creators[l[6]].username,
        stars: parseInt(l[18]),
        ...getDifficultyAndFeature(l),
        coins: parseInt(l[37]),
        coinsVerified: parseInt(l[38]) > 0,
    }));
}

const TYPE = 21; // Daily 21, Weekly 22
const INTERVAL = 2000; // Daily 2 seconds, Weekly 1.5 seconds (The limit is 1 request per second, but it's better to be safe)
const NAME = "daily-safe.json"; // daily-safe.json, weekly-safe.json

fetch("https://www.boomlings.com/database/getGJLevels21.php", {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": ""
    },
    body: `gameVersion=22&binaryVersion=42&type=${TYPE}&secret=Wmfd2893gb7`,
}).then(r => r.text()).then(res => {
    const count = parseInt(res.split("#")[3].split(":")[0]);
    const data = parseResponse(res);
    let i = 1;
    totalData.push(...data);
    console.log(`Page ${i} done!`);
    intervalID = setInterval(() => {
        fetch("https://www.boomlings.com/database/getGJLevels21.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": ""
            },
            body: `gameVersion=22&binaryVersion=42&type=${TYPE}&secret=Wmfd2893gb7&page=${i++}`,
        }).then(r2 => r2.text()).then(res2 => {
            const data2 = parseResponse(res2);
            const offset = parseInt(res2.split("#")[3].split(":")[1]);
            totalData.push(...data2);
            console.log(`Page ${i} done!`);
            if (offset + 10 >= count) {
                clearInterval(intervalID);
                fs.writeFileSync(path.join(__dirname, NAME), JSON.stringify(totalData).replace(/\},\{/g, "},\n  {").replace(/\[/g, "[\n  ").replace(/\]/g, "\n]"), "utf8");
                console.log("Done!");
            }
        }).catch(console.error);
    }, INTERVAL);
});
