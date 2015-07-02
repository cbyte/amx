var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var midi = require('easymidi');

var instruments = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
var instrumentNames = ['SPACE', 'MAD', 'POING', 'BUBBLES', 'WARP', 'CHAKRA', 'ORGANA', 'UNSTABLE', 'AMNESIA', 'ATMOS', 'AZTEC', 'BEACH', 'TERRA', 'ETHER', 'FINE', 'FOREST'];

/*
Log all MIDI devices to the console and select the proper device by accessing
the correct device (set midiDEviceID = x, where x is the device you want to
use). On Windows the first device is the 'Microsoft GS Wavetable Synth' which
is useless. Instead, select at least the second device.
Hint: If there is no second device, the app will not be able to send MIDI data.
Use a Virtual MIDI device, e.g. loopmidi
*/
var midiDeviceID = 1; // edit ID here to use the desired device
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
io.set('heartbeat timeout', 10000);
io.set('heartbeat interval', 1000);

app.use(express.static(__dirname + '/public'));

app.get('/*', function(req,res){
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
    console.log(socket.id+" connected");


    socket.on('hello-world', function(desiredInstrument){
        console.log(socket.id +' wants '+desiredInstrument);
        socket.assignedInstrument = assignToInstrument(socket.id, desiredInstrument);
        socket.lastNote = -1;
        console.log('Instrument ' + (socket.assignedInstrument+1) + ' assigned');

        console.log('user joined');
        console.dir(instruments);

        if(socket.assignedInstrument>=0) {
            socket.emit('instrument-granted', instrumentNames[socket.assignedInstrument]);
        } else {
            socket.emit('instrument-granted', 'no instrument available<br/><br/>try again later :)');
        }
    });

    socket.on('disconnect', function() {
        // turn all notes off on the instrument's channel
        try {
            output.send('cc', {
                controller: 123,
                value: 0,
                channel: socket.assignedInstrument
            });
            console.log('sent all notes off on channel ' + (socket.assignedInstrument+1));
        } catch (e) {
            console.log('MIDI output not possible: ' + e);
        }
        quitInstrument(socket.id); // remove instrument assignment
    });

    socket.on('orientation', function (data) {
        console.log('received orientation data');
        console.dir(data);

        var currentNote = 84 + Math.round(data.pitch/6); // 180/64
        var velocity = 63 - Math.round(data.roll/2.8125);

        try {
            if (socket.lastNote != currentNote){
                output.send('noteon', {
                    note: currentNote,
                    velocity: velocity,
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
            console.log('sent all notes off on channel ' + (socket.assignedInstrument+1));
            socket.lastNote = -1; // reset lastNote
        } catch(e) {
            console.log('MIDI output not possible: ' + e);
        }
    });
});

function assignToInstrument(uid, desired) {
    if(desired!='') {
        for(var i in instrumentNames) {
            if(desired.toLowerCase()==instrumentNames[i].toLowerCase() && instruments[i]==null) {
                instruments[i] = uid;
                return parseInt(i);
            }
        }
    }

    solvable = false;
    for(var i in instruments) {
        if(instruments[i]==null) {
            solvable = true;
        }
    }
    if(!solvable) {
        return -1;
    }

    while(true) {
        var id = Math.floor(Math.random()*16);
        if(instruments[id]==null) {
            instruments[id] = uid;
            return id;
        }
    }
}

function quitInstrument(uid) {
    for(var i in instruments) {
        if(uid==instruments[i]) {
            instruments[i] = null;
            break;
        }
    }

    console.log('user left');
    console.dir(instruments);
}
