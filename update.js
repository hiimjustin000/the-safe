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

const LEVELID = parseInt(process.argv[2]); // -1 for daily, -2 for weekly

const daily = require("./daily.json");
const weekly = require("./weekly.json");

function parseResponse(res) {
    const responses = res.split("#");
    const l = Object.fromEntries(responses[0].split(":").map((e, i, a) => i % 2 == 0 ? [e, a[i + 1]] : null).filter(e => e != null));
    const dailyInfo = {};
    if (LEVELID == -1) {
        dailyInfo.dailyID = parseInt(l[41]);
        const dailyDate = new Date(daily[0].date);
        dailyDate.setUTCDate(dailyDate.getUTCDate() + (dailyInfo.dailyID - daily[0].dailyID));
        dailyInfo.date = dailyDate.getUTCFullYear() + "-" + (dailyDate.getUTCMonth() + 1).toString().padStart(2, "0") + "-" + dailyDate.getUTCDate().toString().padStart(2, "0");
    }
    else if (LEVELID == -2) {
        dailyInfo.weeklyID = parseInt(l[41]) - 100000;
        dailyInfo.dates = weekly[0].dates.map(d => {
            const date = new Date(d);
            date.setUTCDate(date.getUTCDate() + (dailyInfo.weeklyID - weekly[0].weeklyID) * 7);
            return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1).toString().padStart(2, "0") + "-" + date.getUTCDate().toString().padStart(2, "0");
        });
    }
    return {
        id: parseInt(l[1]),
        ...dailyInfo,
        name: l[2],
        creator: responses[3] ? responses[3].split(":")[1] : "",//creators[l[6]].username,
        stars: parseInt(l[18]),
        ...getDifficultyAndFeature(l),
        coins: parseInt(l[37]),
        coinsVerified: parseInt(l[38]) > 0,
        tier: 0
    };
}

fetch("https://www.boomlings.com/database/downloadGJLevel22.php", {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": ""
    },
    body: `gameVersion=22&binaryVersion=42&levelID=${LEVELID}&secret=Wmfd2893gb7`,
}).then(r => r.text()).then(res => {
    console.log(JSON.stringify(parseResponse(res)) + ",");
});
