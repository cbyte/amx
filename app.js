var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var midi = require('easymidi');


var instruments = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];

/*
Log all MIDI devices to the console and select the proper device by accessing
the correct array entry (use outputs[x], where x is the entry number).
On Windows the first device is the 'Microsoft GS Wavetable Synth', which is
useless. Instead, select the second device.
Hint: If there is no second device, the app will crash.
Use a Virtual MIDI device, e.g. loopmidi
*/
var midiDeviceID = 1; // edit ID to use the desired device
var outputs = midi.getOutputs();
console.log('Connected MIDI-interfaces: ' + outputs)

try {
    var output = new midi.Output(outputs[midiDeviceID], false)
    console.log('Using ' + outputs[midiDeviceID] + ' as MIDI-output-interface.')
} catch(e) {
    console.log('MIDI-output ' + midiDeviceID + ' could not be initiated. ' + e)
}

server.listen(80);
console.log('Listening on Port 80.');


app.get('/', function(req,res){
    res.sendFile(__dirname + '/public/index.html');
})

app.use(express.static(__dirname + '/public'));

var lastNote;

io.on('connection', function(socket) {
    console.log(socket.id+" connected");
    socket.assignedInstrument = assignToInstrument(socket.id);
    console.log('Instrument ' + socket.assignedInstrument + ' assigned')

    socket.on('disconnect', function() {
        quitInstrument(socket.id);
    })

    socket.on('orientation', function (data) {
        console.log('received orientation data');
        console.dir(data);

        var currentNote = Math.round(63 + data.pitch/2.8125) // 180/64

        try {
            if (lastNote != currentNote){
                output.send('noteon', {
                    note: currentNote,
                    velocity: 127,
                    channel: socket.assignedInstrument
                })
                output.send('noteoff', {
                    note: lastNote,
                    velocity: 127,
                    channel: socket.assignedInstrument
                })
                lastNote = currentNote;
                console.log('sent noteon');
            }
        } catch(e) {
            console.log('MIDI output not possible: ' + e)
        }
    });

    socket.on('noteoff', function() {
        try {
            output.send('noteoff', {
                note: lastNote,
                velocity: 127,
                channel: socket.assignedInstrument
            })

            lastNote = -1; // reset lastNote
            console.log('sent noteoff');
        } catch(e) {
            console.log('MIDI output not possible: ' + e)
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
        instruments[assigned].push(uid)
    }

    return assigned;
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