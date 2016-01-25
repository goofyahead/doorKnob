var Gpio = require('onoff').Gpio;
var moment = require('moment');
var express = require('express');
var app = express();

// BCM GPIO NOTATION
var step = new Gpio(23,'out');
var direction = new Gpio(24,'out');


// Toggle the state of the LED on GPIO #14 every 200ms.
// Here synchronous methods are used. Asynchronous methods are also available.

app.get('/open', function(req, res){
	direction.writeSync(0);

	var countopen = 0;
	ivopen = setInterval(function () {
		step.writeSync(step.readSync() ^ 1);
		step.writeSync(step.readSync() ^ 1);
		countopen++;
		if (countopen == 200) {
			clearInterval(ivopen); // Stop blinking
			step.writeSync(0);  // Turn LED off.
			console.log('Ts: ', moment().format('mm:ss'),'count:', countopen);
		}
	}, 10);

	res.send('opening');
});

app.get('/close', function(req, res){

	direction.writeSync(1);

	var count = 0;
	iv = setInterval(function () {
		step.writeSync(step.readSync() ^ 1);
		step.writeSync(step.readSync() ^ 1);
		count++;
		if (count == 200) {
		clearInterval(iv); // Stop blinking
		step.writeSync(0);  // Turn LED off.
		console.log('Ts: ', moment().format('mm:ss'),'count:', count);
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
