const WebSocketServer = require('websocket').server;
const watch = require('node-watch');
const http = require('http');
const csv = require('csv-parser');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const Router = require('./routes');
const geoTz = require('geo-tz')
const key = 'AIzaSyD9agllUXdSWHnIYPbbRAFjHZ3hjKa2BV8';
const axios = require('axios');
const clients = [];
let fileContents = [];
var dateContents = [];

//Load the initial data from the CSV file
fs.createReadStream('timezone.csv')
    .pipe(csv())
    .on('data', async (data) => {data['fdata'] = await formatDate(data);
   // console.log(data);
    fileContents.push(data)});
    // fileContents.push(data))

const server = http.createServer();
server.listen(3030, function () {
    console.log((new Date()) + ' Server is listening on port 3030');
});

wsServer = new WebSocketServer({
    httpServer: server,
});

wsServer.on('request', function (request) {
    console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
    const connection = request.accept(null);
    connection.send(JSON.stringify(fileContents));
    clients.push(connection);
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
});

// Watch for the file updates
watch('timezone.csv',  async function(event, filename) {
    //Load the variable fileContents to a new empty array
    fileContents = [];
    fs.createReadStream('timezone.csv')
        .pipe(csv())
        .on('data', async (data) =>  {
            //data['fdata'] =  await formatDate(data);
           // console.log(data);
            fileContents.push(data)})
        .on('end',  ()=>{
          getLocations();
            // after reading update all the clients from clients array with the new data.
              //clients.forEach(function (client){
                // client.send(JSON.stringify(fileContents));
           // })
        });
});

function getLocations() {

  for(var i = 0; i < fileContents.length; i++) {
      formatDate1(fileContents[i]);
  }

  console.log(dateContents);

  // let count = 0;

  // while(count < 5) {
  //     for(let i = 0; i < fileContents.length ; i++) {
  //       console.log(fileContents[i].fdata);      
  //     }
  // }
//
 // console.log(count);
  

  // if(i === fileContents.length) {
  //   fileContents.forEach(function(element){
  //     console.log(element);
  //   });
  //   test = false;
  // }
}



async function formatDate1(data) {
    let timestamp = data.timestamp_utc;
    let longitude = data.lng;
    let lattitude = data.lat;
   let timezone;
   let rdata;
   let timezone1
  var config = {
    method: 'post',
    url: `https://maps.googleapis.com/maps/api/timezone/json?location=${lattitude}%2C${longitude}&timestamp=${timestamp}&key=${key}`,
    headers: { }
  };
  await axios(config)
  .then(function (response) {
   // console.log(response.data);
    rdata = response.data
    timezone1 = rdata.timeZoneId

    const date = new Date(timestamp*1000);
    timezone = geoTz(lattitude, longitude);
    // console.log(DateTime.fromISO(date, { zone: timezone }))
    const nDate = date.toLocaleString('en-GB', {
      timeZone: timezone
    });
    let time = date.toLocaleTimeString('en-GB',{  hour: '2-digit', minute: '2-digit' , timeZone: timezone ,hour12: false });
    let date1 = date.toLocaleDateString()
    var time1 = date.toTimeString('en-US',{ timeZone: timezone});

    let formattedDate = `${date1} ${time1} ${timezone} ${getAbbreviation(rdata.timeZoneName)} ${getoffset(rdata)}`;
    data['fdata'] = formattedDate;
    dateContents.push(formattedDate);
  })
  .catch(function (error) {
    console.log(error);
  });
//return `${date1} ${time1} ${timezone} ${getAbbreviation(rdata.timeZoneName)} ${getoffset(rdata)}`;
}


async function formatDate(data)
 {
    let timestamp = data.timestamp_utc;
    let longitude = data.lng;
    let lattitude = data.lat;
   let timezone;
   let rdata;
   let timezone1
  var config = {
    method: 'get',
    url: `https://maps.googleapis.com/maps/api/timezone/json?location=${lattitude}%2C${longitude}&timestamp=${timestamp}&key=${key}`,
    headers: { }
  };
  await axios(config)
  .then(function (response) {
   // console.log(response.data);
    rdata = response.data
    timezone1 = rdata.timeZoneId
  })
  .catch(function (error) {
    console.log(error);
  });
  const date = new Date(timestamp*1000);
  timezone = geoTz(lattitude, longitude);
  // console.log(DateTime.fromISO(date, { zone: timezone }))
  const nDate = date.toLocaleString('en-GB', {
    timeZone: timezone
  });
  let time = date.toLocaleTimeString('en-GB',{  hour: '2-digit', minute: '2-digit' , timeZone: timezone ,hour12: false });
  let date1 = date.toLocaleDateString()
  var time1 = date.toTimeString('en-US',{ timeZone: timezone});
return `${date1} ${time1} ${timezone} ${getAbbreviation(rdata.timeZoneName)} ${getoffset(rdata)}`;
}
function getAbbreviation(text) {
    if (typeof text != 'string' || !text) {
      return '';
    }
    const acronym = text
      .match(/[\p{Alpha}\p{Nd}]+/gu)
      .reduce((previous, next) => previous + ((+next === 0 || parseInt(next)) ? parseInt(next): next[0] || ''), '')
      .toUpperCase()
    return acronym;
  }
  function getoffset(rdata) {
    return (rdata.rawOffset+rdata.dstOffset)/3600;
  }