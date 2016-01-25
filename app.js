var Gpio = require('onoff').Gpio;
var moment = require('moment');
var express = require('express');
var app = express();

// BCM GPIO NOTATION
var step = new Gpio(23,'out');
var direction = new Gpio(24,'out');

var keyPosition = 0;
var opentotal = 120;

// Toggle the state of the LED on GPIO #14 every 200ms.
// Here synchronous methods are used. Asynchronous methods are also available.

app.get('/open', function(req, res){
	direction.writeSync(1);
	var limitOpen = (200 * keyPosition) + opentotal;
	var countopen = 0;

	ivopen = setInterval(function () {
		if (countopen >= limitOpen) {
			clearInterval(ivopen); // Stop blinking
			console.log('Opening');
			setTimeout(function () {
				direction.writeSync(0);
				var countZero = 0;
				// go to zero
				ivgotozero = setInterval(function () {
					if (countZero >= opentotal) {
						keyPosition = 0;
						clearInterval(ivgotozero); // Stop blinking
						console.log('Door in normal position again');
					} else {
						step.writeSync(step.readSync() ^ 1);
						step.writeSync(step.readSync() ^ 1);
						countZero++;
					}
				}, 10);
			}, 3000);
		} else {
			step.writeSync(step.readSync() ^ 1);
			step.writeSync(step.readSync() ^ 1);
			countopen++;
		}
	}, 10);

	res.send('opening');
});

app.get('/close', function(req, res){

	direction.writeSync(0);
	var limitClose = (200 * (2 - keyPosition));

	var count = 0;
	iv = setInterval(function () {

		if (count >= limitClose) {
			keyPosition = 2;
			clearInterval(iv); // Stop blinking
			console.log('Ts: ', moment().format('mm:ss'),'count:', count);
		} else {
			step.writeSync(step.readSync() ^ 1);
			step.writeSync(step.readSync() ^ 1);
			count++;
		}
	}, 10);

	res.send('closing');
});

app.listen(3000);

function exit() {
	step.unexport();
	direction.unexport();
	process.exit();
}

process.on('SIGINT', exit);
