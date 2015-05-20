var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var midi = require('easymidi');

/*
Log all MIDI devices to the console and select the proper device by accessing
the correct array entry (use outputs[x], where x is the entry number).
On Windows the first device is the 'Microsoft GS Wavetable Synth', which is
useless. Instead, select the second device.
Hint: If there is no second device, the app will crash.
Use a Virtual MIDI device, e.g. loopmidi
*/
var outputs = midi.getOutputs();
console.log(outputs);
var output = new midi.Output(outputs[1], false);

server.listen(2222)
console.log('Listening on Port 2222.')


app.get('/', function(req,res){
	res.sendFile(__dirname + '/public/index.html');
})

app.use(express.static(__dirname + '/public'));

var lastNote;
var counter = 0;

io.on('connection', function(socket) {
	socket.on('orientation', function (data) {
		if (lastNote != Math.round(63 + data.pitch/(180/64))){
			counter = 0;
			console.log('received orientation data');
			console.dir(data);
			// adjust the expression pedal value of the whammy
			output.send('noteon', {
				note: Math.round(63 + data.pitch/(180/64)),
				//value: Math.round(data.yaw/(360/127)),
				velocity: 127,
				channel: 0
			})
			output.send('noteoff', {
				note: lastNote,
				//value: Math.round(data.yaw/(360/127)),
				velocity: 127,
				channel: 0
			})
			lastNote = Math.round(63 + data.pitch/(180/64));
			console.log('sent noteon');
		} else {
			counter++;
			if (counter > 100){
				counter = 0;
				output.send('noteoff', {
					note: lastNote,
					//value: Math.round(data.yaw/(360/127)),
					velocity: 127,
					channel: 0
				})
				console.log('sent noteoff');
			}
		}
	});
});
