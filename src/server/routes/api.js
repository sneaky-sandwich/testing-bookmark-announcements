const express = require("express");
const router = express.Router();
const fs = require("fs")

// var SSE = require('express-sse');
// var sse = new SSE();



var XMLHttpRequest = require('xhr2');
var xhr = new XMLHttpRequest();

const CronJob = require('cron').CronJob;
const CronTime = require('cron').CronTime;
var cronTime = { interval: 1 };
const cronUpdate = new CronJob(`0 */${cronTime.interval} * * * *`, function () {
    var time = new Date();
    console.log(`Cron executed at ${time.toLocaleString()}`);
    loopedCode();
}, null, false);
cronUpdate.setTime(new CronTime(`0 */${cronTime.interval} * * * *`));
cronUpdate.start();
console.log(`Ready... Running an interval of ${cronTime.interval} minute(s).`);


function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

let data = [];
fs.readFile(
      "./data.json",
      (err, res) => {
          if(!err){
              data = JSON.parse(res);
          }
      }
)

router.get("/fics", function(req, res, next) {
    console.log('get "fics" route hit');
    const fics = data.fics;
    res.send({fics})
})

router.get("/webs", function(req, res, next) {
    console.log('get "webs" route hit');
    const webs = data.webs;
    res.send({webs})
})

router.get("/messages", function(req, res, next) {
    console.log('get "messages" route hit');
    const messages = data.messages;
    res.send({messages})
})

router.post("/fics", function (req, res) {
    const url = req.headers.url;
    let title = "";
    let author = "";
    let fandom = "";
    let chapters = "";
    let words = "";
    let updated = "";
    let complete = "";
    let fullHTML = "";
    async function doAjaxThings() {
        // await code here
        let result = await makeRequest("GET", url);
        // code below here will only execute when await makeRequest() finished loading
        fullHTML = result.split("<!--title, author, fandom-->")[1].split("</ol>")[0]
        title = fullHTML.split("<a href=")[1].split(">")[1].split("</a")[0].toLowerCase();
        author = fullHTML.split('<a rel="author" href=')[1].split(">")[1].split("</a")[0].toLowerCase();
        fandom = fullHTML.split('<span class="landmark">Fandoms:</span>')[1].split(">")[1].split("</a")[0].split(" - ")[0].toLowerCase();
        try {
            chapters = fullHTML.split('<dd class="chapters">')[1].split("</dd>")[0].split('">')[1].replace("</a>", "")
        } catch (error) {
            chapters = fullHTML.split('<dd class="chapters">')[1].split("</dd>")[0]
        }
        words = fullHTML.split('<dd class="words">')[1].split("</dd>")[0]
        updated = fullHTML.split('<p class="datetime">')[1].split("</p>")[0].toLowerCase();
        updated = updated.split(" ")[1] + " " + updated.split(" ")[0] + " " + updated.split(" ")[2]
        complete = fullHTML.split('href="/help/symbols-key.html"><span class="complete-')[1].split(" ")[0];        
        let newData = [url, title, author, fandom, chapters, words, updated, complete];
        data.fics.push(newData)
        const fics = data.fics;
        fs.writeFile(
            "./data.json",
            JSON.stringify(data, null, 2),
            (err) => {console.log(err)})
        res.send({fics})
    }

    doAjaxThings();
})

router.post("/webs", function (req, res) {
    const url = req.headers.url;
    let title = "";
    let author = "";
    let genre = "";
    let episodes = "";
    let views = "";
    let updated = "";
    let complete = "";
    let fullHTML = "";
    async function doAjaxThings() {
        // await code here
        let result = await makeRequest("GET", url);
        // code below here will only execute when await makeRequest() finished loading
        fullHTML = result;
        title = fullHTML.split('<h1 class="subj">')[1].split("</h1>")[0].toLowerCase()
        author = fullHTML.split('<div class="author_area">')[1].split("</a>")[0].split(">")[1].toLowerCase()
        genre = fullHTML.split('<h2 class="genre')[1].split("</h2>")[0].split(">")[1].toLowerCase()
        episodes = fullHTML.split('<li class="_episodeItem" id="episode_')[1].split('"')[0];
        views = fullHTML.split('<em class="cnt">')[1].split("</em>")[0]
        updated = fullHTML.split('<li class="_episodeItem" id="episode_')[1].split('<span class="date">')[1].split("</span>")[0].replace(",", "").toLowerCase();
        complete = fullHTML.split('<p class="day_info">')[1].split("</span>")[0];
        if(complete.includes("complete")) {
            complete = "yes"
        } else {
            complete = "no";
        }
        let newData = [url, title, author, genre, episodes, views, updated, complete];
        data.webs.push(newData)
        const webs = data.webs;
        fs.writeFile(
            "./data.json",
            JSON.stringify(data, null, 2),
            (err) => {console.log(err)})
        res.send({webs})
    }

    doAjaxThings();
})

const loopedCode = () => {
    let worksToCheck = [];
    worksToCheck = worksToCheck.concat(data.fics);
    worksToCheck = worksToCheck.concat(data.webs);
    let messagesToSend = []
    async function doAjaxThings(url, i) {
        // await code here
        let result = await makeRequest("GET", url);
        // code below here will only execute when await makeRequest() finished loading
        let color = "";
        let updated = "";
        let title = "";
        let count = "";
        let done = "";
        if(url.includes("archiveofourown.org")) {
            result = result.split("<!--title, author, fandom-->")[1].split("</ol>")[0]
            try {
                count = result.split('<dd class="chapters">')[1].split("</dd>")[0].split('">')[1].replace("</a>", "")
            } catch (error) {
                count = result.split('<dd class="chapters">')[1].split("</dd>")[0]
            }
        } else {
            count = result.split('<li class="_episodeItem" id="episode_')[1].split('"')[0];
        }
        if(parseInt(count) != parseInt(worksToCheck[i][4].split("/")[0])) {
            console.log("fic updating ...")
            let updatedData = [];
            if(url.includes("archiveofourown.org")) {
                fullHTML = result;
                title = fullHTML.split("<a href=")[1].split(">")[1].split("</a")[0].toLowerCase();
                let author = fullHTML.split('<a rel="author" href=')[1].split(">")[1].split("</a")[0].toLowerCase();
                let fandom = fullHTML.split('<span class="landmark">Fandoms:</span>')[1].split(">")[1].split("</a")[0].split(" - ")[0].toLowerCase();
                try {
                    chapters = fullHTML.split('<dd class="chapters">')[1].split("</dd>")[0].split('">')[1].replace("</a>", "")
                } catch (error) {
                    chapters = fullHTML.split('<dd class="chapters">')[1].split("</dd>")[0]
                }
                let words = fullHTML.split('<dd class="words">')[1].split("</dd>")[0]
                updated = fullHTML.split('<p class="datetime">')[1].split("</p>")[0].toLowerCase();
                updated = updated.split(" ")[1] + " " + updated.split(" ")[0] + " " + updated.split(" ")[2]
                let complete = fullHTML.split('href="/help/symbols-key.html"><span class="complete-')[1].split(" ")[0];

                updatedData = [url, title, author, fandom, chapters, words, updated, complete];
                color = "#9C1111"
                count = count.split("/")[0]
                done = complete;
            } else {
                let fullHTML = result;
                title = fullHTML.split('<h1 class="subj">')[1].split("</h1>")[0].toLowerCase()
                let author = fullHTML.split('<div class="author_area">')[1].split("</a>")[0].split(">")[1].toLowerCase()
                let genre = fullHTML.split('<h2 class="genre')[1].split("</h2>")[0].split(">")[1].toLowerCase()
                let episodes = fullHTML.split('<li class="_episodeItem" id="episode_')[1].split('"')[0];
                let views = fullHTML.split('<em class="cnt">')[1].split("</em>")[0]
                updated = fullHTML.split('<li class="_episodeItem" id="episode_')[1].split('<span class="date">')[1].split("</span>")[0].replace(",", "").toLowerCase();
                let complete = fullHTML.split('<p class="day_info">')[1].split("</span>")[0];
                if(complete.includes("complete")) {
                    complete = "yes"
                } else {
                    complete = "no";
                }
                updatedData = [url, title, author, genre, episodes, views, updated, complete];
                color = "#00d463"
                done = complete;
            }
            console.log(title)
            worksToCheck[i] = updatedData;

            let newMessage = {
                url: url,
                color: color,
                date: updated,
                num: count,
                wtitle: title,
                complete: done
            }
            messagesToSend.push(newMessage)
        }
        if(i == worksToCheck.length - 1) {
            const fics = worksToCheck.filter(e => e[0].includes("archiveofourown"))
            const webs = worksToCheck.filter(e => e[0].includes("webtoons"))
            const messages = messagesToSend.concat(data.messages)
            data.fics = fics;
            data.webs = webs;
            data.messages = messages;
            fs.writeFile(
                "./data.json",
                JSON.stringify(data, null, 2),
                (err) => {if(err)console.log("error" + err)})
        }

    }

    for(let i = 0; i < worksToCheck.length; i++) {
        let url = worksToCheck[i][0];
        doAjaxThings(url, i);
    }
}







module.exports = router;