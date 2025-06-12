const fs = require('fs')
const https = require('https');

const thisYear = new Date().getFullYear()
const startTimeOfThisYear = new Date(`${thisYear}-01-01T00:00:00+00:00`).getTime()
const endTimeOfThisYear = new Date(`${thisYear}-12-31T23:59:59+00:00`).getTime()
const progressBarRatio = (Date.now() - startTimeOfThisYear) / (endTimeOfThisYear - startTimeOfThisYear)
const progressPercentage = (progressBarRatio * 100).toFixed(2)

let updatedText = ''

const city = 'Bandung';
const weatherUrl = `https://wttr.in/${city}?format=v2`;

const progressBarOfThisYear = () => {
    const progressBarCapacity = 30
    const passedProgressBarIndex = parseInt(progressBarRatio * progressBarCapacity)
    const progressBar =
        '█'.repeat(passedProgressBarIndex) +
        '▁'.repeat(progressBarCapacity - passedProgressBarIndex)
    return `|${progressBar}|`
}

const setWeatherInformation = () => {
    https.get(weatherUrl, resp => {
        let data = "";

        // A chunk of data has been recieved.
        resp.on("data", chunk => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
            let extractTextPre = data.substring(
                data.indexOf("<pre>") + 1,
                data.lastIndexOf("</pre>")
            );

            extractTextPre = extractTextPre.replace("Now:</font>", "Last Update:</font>")

            const cleanWeatherInformation = ['<', extractTextPre.trim(), '</pre>'].join('')

            updatedText = updatedText.replace("<MASK_WEATHER/>", cleanWeatherInformation)
            console.log(updatedText)

            // write file
            try {
                fs.writeFileSync('./README.md', updatedText);
            } catch (err) {
                console.error(err);
            }

        });
    }).on("error", err => {
        console.log("Error: " + err.message);
    });
}

fs.readFile('./TEMPLATE.md', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const yearProgressText = `⏳ Year progress ${progressBarOfThisYear()} ${progressPercentage} %`

    updatedText = data.replace("<MASK_PROGRESS_BAR/>", yearProgressText)

    setWeatherInformation()

});
