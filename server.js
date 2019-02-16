var five = require('johnny-five');
var express = require('express');
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://iot.eclipse.org');

var board = new five.Board({ 'port': 'COM3' });
var app = express();

var led;
var distance;
var lastStatus;
board.on('ready', function () {
    led = new five.Led(13);

    
    var proximity = new five.Proximity({
        controller: "HCSR04",
        pin: 7
    });

    proximity.on("change", function () {
        //console.log("The obstruction has moved.", this.cm);
        distance = this.cm;
        var currStatus;


        if (distance < 30) {
            currStatus = 'Busy';
            led.on();
        } else {
            currStatus = 'Free';
            led.off();

        }

        if(lastStatus != currStatus){
            lastStatus = currStatus;
            console.log('Mudou status');
            client.publish('distance14', currStatus);
        }

        
    });
});

app.post('/led/turnOn', function (req, res) {
    led.on();
    res.sendStatus(200);
});

app.post('/led/turnOff', function (req, res) {
    led.off();
    res.sendStatus(200);
});

app.post('/led/blink', function (req, res) {
    led.blink();
    res.sendStatus(200);
});

app.post('/led/stopBlink', function (req, res) {
    led.stop();
    res.sendStatus(200);
});

app.get('/checkSpot', function (req, res) {
    console.log('the distance is', distance);
    if (distance < 30) {

        res.send('Not free');
    } else {
        res.send('Is Free');
    }
});

app.listen(3000, function () {
    console.log('Listening on port ${3000}')
});