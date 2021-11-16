const WebSocketServer = require('websocket').server;
const watch = require('node-watch');
const http = require('http');
const csv = require('csv-parser');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const geoTz = require('geo-tz');
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const app = express();
const key = 'AIzaSyD9agllUXdSWHnIYPbbRAFjHZ3hjKa2BV8';
const axios = require('axios');
const {json} = require("express");
const clients = [];
let fileContents = [];
let tZdata = {};
const server = http.createServer();
const restAPIPort = 5050;
const webSocketPort = 3030;
app.use(cors());
//Load the initial data from the CSV file
fs.createReadStream('timezone.csv')
    .pipe(csv())
    .on('data', (data) =>
        fileContents.push(data)
    ).on('end', async () => {
        await formatDate(fileContents);
    });
    fs.createReadStream('tzdata.csv')
    .pipe(csv())
    .on('data', (data) => {
      tZdata[data.TimeZoneName ]= [data.TZShort, data. Offset];
    });

app.get('/get-devices', function(req, res){
    res.send(JSON.stringify(fileContents));
});


app.get('/onedevice',urlencodedParser, function (req, res){
    console.log(req.query.ID);
    let deviceFound = false;
    fileContents.forEach((device)=>{
        if(device['id'] === req.query.ID) {
            deviceFound = true;
            res.send(JSON.stringify(device));
        }
    });
    if(!deviceFound) {
        res.send('Invalid device id');
    }
});

server.listen(webSocketPort, function () {
    console.log((new Date()) + `WebSocket Server is listening on port ${webSocketPort}!`);
});

app.listen(restAPIPort, () => console.log(`REST service is listening on port ${restAPIPort}!`))

wsServer = new WebSocketServer({
    httpServer: server,
});

wsServer.on('request', function (request) {
    console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
    const connection = request.accept(null);
    connection.send(JSON.stringify(fileContents));
    clients.push(connection);
    connection.on('close', function (reasonCode, description) {
        clients.splice(clients.indexOf(connection), 1);
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
});
});

// Watch for the file updates
watch('timezone.csv', function (event, filename) {
    //Load the variable fileContents to a new empty array
    fileContents = [];
    fs.createReadStream('timezone.csv')
        .pipe(csv())
        .on('data', (data) => {
            fileContents.push(data);
        })
        .on('end', async () => {
            await formatDate(fileContents);
            clients.forEach(function (client){
                client.send(JSON.stringify(fileContents));
            })
        });
});

async function formatDate(fileData) {
    for (const data of fileData) {
        let timestamp = data.timestamp_utc;
        let longitude = data.lng;
        let latitude = data.lat;
        let timezone;
        let rdata;
        let timezone1
        const config = {
            method: 'get',
            url: `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude}%2C${longitude}&timestamp=${timestamp}&key=${key}`,
            headers: {}
        };
        await axios(config)
            .then(function (response) {
                rdata = response.data;
                timezone1 = rdata.timeZoneId;

                const date = new Date(timestamp * 1000);
                timezone = geoTz(latitude, longitude);
                // console.log(DateTime.fromISO(date, { zone: timezone }))
                let time = date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: timezone,
                    hour12: false
                });
                let rtimezone = rdata.timeZoneName?rdata.timeZoneName: timezone;
                let offset = tZdata[rtimezone]?tZdata[rtimezone][1]:getoffset(rdata);
                let x = offset.split(':');
                let offsetParsed = x[0].concat(':',x[1]?x[1]:'00');
                let date1 = date.toLocaleDateString('en-GB', {timeZone: timezone});
                data['date_time'] = `${date1} ${time}  ${tZdata[rtimezone]?tZdata[rtimezone][0]:getAbbreviation(rtimezone)} 
                ${offsetParsed} `;
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}

function getAbbreviation(text) {
    if (typeof text != 'string' || !text) {
        return '';
    }
    const acronym = text
        .match(/[\p{Alpha}\p{Nd}]+/gu)
        .reduce((previous, next) => previous + ((+next === 0 || parseInt(next)) ? parseInt(next) : next[0] || ''), '')
        .toUpperCase()
    return acronym;
}

function getoffset(rdata) {
    return (rdata.rawOffset + rdata.dstOffset) / 3600;
}
