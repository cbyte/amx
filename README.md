# amx
Ambient Musix

pre-alpha!

# Prerequisites for easymidi
## OSX
Some version of Xcode (or Command Line Tools)
Python (for node-gyp)

## Windows
Microsoft Visual C++ (e.g. by installing Visual Studio 2013 Community Edition)
Python (for node-gyp)

## Linux
A C++ compiler
You must have installed and configured ALSA. Without it this module will NOT build.
Install the libasound2-dev package.
Python (for node-gyp)

# Configuration
## MIDI device
Use the app with the MIDI device of your choice. The standard device used is the second system device. You can change this selection in the file 'app.js'.
Of course, you can use a virtual MIDI device such as loopMIDI (on Windows).

## Server address
To make sure, the client can connect to the server, edit the address in the file 'public/index.js'.
