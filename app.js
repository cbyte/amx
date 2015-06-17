var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var midi = require('easymidi');


var instruments = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];

/*
Log all MIDI devices to the console and select the proper device by accessing
the correct device (set midiDEviceID = x, where x is the device you want to
use). On Windows the first device is the 'Microsoft GS Wavetable Synth' which
is useless. Instead, select at least the second device.
Hint: If there is no second device, the app will not be able to send MIDI data.
Use a Virtual MIDI device, e.g. loopmidi
*/
var midiDeviceID = 2; // edit ID here to use the desired device
var outputs = midi.getOutputs();
console.log('Connected MIDI-interfaces: ' + outputs);

try {
    var output = new midi.Output(outputs[midiDeviceID], false);
    console.log('Using ' + outputs[midiDeviceID] + ' as MIDI-output-interface.');
} catch(e) {
    console.log('MIDI-output ' + midiDeviceID + ' could not be initiated. ' + e);
}

server.listen(80);
console.log('Listening on Port 80.');
io.set('heartbeat timeout', 10);

app.get('/', function(req,res){
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
    console.log(socket.id+" connected");
    socket.assignedInstrument = assignToInstrument(socket.id);
    socket.lastNote = -1;
    console.log('Instrument ' + socket.assignedInstrument + ' assigned');

    socket.on('disconnect', function() {
        // turn all notes off on the instrument's channel
        try {
            output.send('cc', {
                controller: 123,
                value: 0,
                channel: socket.assignedInstrument
            });
            console.log('sent all notes off on channel ' + socket.assignedInstrument);
        } catch (e) {
            console.log('MIDI output not possible: ' + e);
        }
        quitInstrument(socket.id); // remove instrument assignment
    });

    socket.on('orientation', function (data) {
        console.log('received orientation data');
        console.dir(data);

        var currentNote = Math.round(63 + data.pitch/2.8125); // 180/64

        try {
            if (socket.lastNote != currentNote){
                output.send('noteon', {
                    note: currentNote,
                    velocity: 127,
                    channel: socket.assignedInstrument
                });
                output.send('noteoff', {
                    note: socket.lastNote,
                    velocity: 0,
                    channel: socket.assignedInstrument
                });
                socket.lastNote = currentNote;
                console.log('sent noteon');
            }
        } catch(e) {
            console.log('MIDI output not possible: ' + e);
        }
    });

    socket.on('noteoff', function() {
        try {
             output.send('cc', {
                controller: 123,
                value: 0,
                channel: socket.assignedInstrument
            });
            console.log('sent all notes off on channel ' + socket.assignedInstrument);
            socket.lastNote = -1; // reset lastNote
        } catch(e) {
            console.log('MIDI output not possible: ' + e);
        }
    });
});

function assignToInstrument(uid) {
    var assigned = -1;

    for(var instrument in instruments) {
        if(instruments[instrument].length>0) {
            continue;
        }
        instruments[instrument] = [uid];
        assigned = instrument;
        break;
    }

    if(assigned<0) {
        assigned = Math.floor(Math.random()*16);
        instruments[assigned].push(uid);
    }

    return parseInt(assigned);
}

function quitInstrument(uid) {
    for(var instrument in instruments) {
        for(var user in instruments[instrument]) {
            if(uid===instruments[instrument][user]) {
                delete instruments[instrument][user];
            }
        }
    }
}
