var Gpio = require('onoff').Gpio;
var moment = require('moment');

// BCM GPIO NOTATION
var step = new Gpio(23,'out');
var direction = new Gpio(24,'out');


// Toggle the state of the LED on GPIO #14 every 200ms.
// Here synchronous methods are used. Asynchronous methods are also available.

console.log('Ts: ', moment().format('mm:ss'));
direction.writeSync(0);

var count = 0;
iv = setInterval(function () {
	console.log('stat to: ', step.readSync());
  	step.writeSync(step.readSync() ^ 1);
	step.writeSync(step.readSync() ^ 1);
	count++;
}, 10);

// Stop blinking the LED and turn it off after 5 seconds.
setTimeout(function () {
  clearInterval(iv); // Stop blinking
  step.writeSync(0);  // Turn LED off.
  console.log('Ts: ', moment().format('mm:ss', 'count:', count));
}, 2000);


function exit() {
	step.unexport();
	direction.unexport();
	process.exit();
}

process.on('SIGINT', exit);
