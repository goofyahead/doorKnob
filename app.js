// var Gpio = require('onoff').Gpio;
var moment = require('moment');
var express = require('express');
var ursa = require('ursa');
var http = require('http');
var https = require('https');
var colors = require('colors');
var fs = require('fs');
var privateKey  = fs.readFileSync(__dirname + '/sslcert/server.key', 'utf8');
var certificate = fs.readFileSync(__dirname + '/sslcert/server.crt', 'utf8');

var redis = require("redis"),
	client = redis.createClient();

var security = require('./routes/security')({redis : client});

var HTTPS_PORT = 443;
var HTTP_PORT = 80;

var credentials = {key: privateKey, cert: certificate};
var app = express();

// your express configuration here

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// BCM GPIO NOTATION
// var step = new Gpio(23,'out');
// var direction = new Gpio(24,'out');
// var sleep = new Gpio(25, 'out');

var keyPosition = 0;
var opentotal = 265;
var TWO_TURNS = 200 * 3; // two turns on a 1:3 gear of a 200 steps

// sleep.writeSync(0); // start sleeping

// Toggle the state of the LED on GPIO #14 every 200ms.
// Here synchronous methods are used. Asynchronous methods are also available.

app.get('/challenge/:user', function (req, res) {
	var name = req.params.user;
	var session = crypto.randomBytes(12).toString('hex').toString().toUpperCase();

	console.log("session generated" + session);
	client.setex('user_session_' + name, TTL, session, redis.print);

	console.log(fs.readFileSync(__dirname + '/keys/' + name + '.pub'));
	var keyFromFile = ursa.createPublicKey(fs.readFileSync(__dirname + '/keys/' + name + '.pub'));
	var challenge = keyFromFile.encrypt(session , ursa.BASE64, ursa.BASE64, ursa.RSA_PKCS1_PADDING);
	console.log(challenge.toString('BASE64'));
	res.send(challenge.toString('BASE64'));
});

app.get('/open', security.authorize, function(req, res){
	// sleep.writeSync(1); // wake up
	// direction.writeSync(1);
	var limitOpen = (TWO_TURNS * keyPosition) + opentotal;
	var countopen = 0;

	ivopen = setInterval(function () {
		if (countopen >= limitOpen) {
			clearInterval(ivopen);
			console.log('Opening');
			setTimeout(function () {
				// direction.writeSync(0);
				var countZero = 0;
				// go to zero
				ivgotozero = setInterval(function () {
					if (countZero >= opentotal) {
						keyPosition = 0;
						clearInterval(ivgotozero);
						console.log('Door in normal position again');
						// sleep.writeSync(0);
					} else {
						// step.writeSync(step.readSync() ^ 1);
						// step.writeSync(step.readSync() ^ 1);
						countZero++;
					}
				}, 5);
			}, 3000);
		} else {
			// step.writeSync(step.readSync() ^ 1);
			// step.writeSync(step.readSync() ^ 1);
			countopen++;
		}
	}, 5);

	res.send('opening');
});

app.post('/keys', function (req, res){
	var keyToAdd = req.body.key;
	var name = req.body.name;
	var pemKey = header + keyToAdd + ending;

	redisClient.get('admin', function (reply) {
		if (!reply) {
			var ursaKey = ursa.createPublicKey(new Buffer(pemKey), ursa.BASE64);
			fs.writeFileSync('./keys/' + name + '.pub', ursaKey.toPublicPem());

			console.log(ursaKey.toPublicPem().toString());
			redisClient.set('admin', name, redis.print);
			redisClient.set('key_' + name, 0, redis.print);
			res.send(200, {message : "key added as admin"});
		} else {
			res.send(404, {message : "admin already exist require access"});
		}
	});

	
});

app.get('/close', function(req, res){
	// sleep.writeSync(1); // wake up
	// direction.writeSync(0);
	var limitClose = (TWO_TURNS * (2 - keyPosition));

	var count = 0;
	iv = setInterval(function () {

		if (count >= limitClose) {
			keyPosition = 2;
			clearInterval(iv); // Stop blinking
			console.log('Ts: ', moment().format('mm:ss'),'count:', count);
			// sleep.writeSync(0);
		} else {
			// step.writeSync(step.readSync() ^ 1);
			// step.writeSync(step.readSync() ^ 1);
			count++;
		}
	}, 5);

	res.send('closing');
});

httpServer.listen(HTTP_PORT);
httpsServer.listen(HTTPS_PORT);
console.log('Listening on ports ', colors.green(HTTP_PORT), colors.red(HTTPS_PORT));

function exit() {
	// step.unexport();
	// direction.unexport();
	// sleep.unexport();
	process.exit();
}

process.on('SIGINT', exit);
