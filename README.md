# Zukunftsmusik
Zukunftsmusik (part of the German idiom *Zukunftsmusik sein*, somewhat comparable to the idiom *to be still a long way off*, consisting of the words *Zukunft = future* and *Musik = music*) is an interactive installation that aims provide an environment where the visitors can create unique soundscapes together - by moving their smartphones every user can actively manipulate the ambients sounds. In their role as performers, the participants themselves become a part of this artistic experience.
This project is being developed in the course *Computer- und Medienkunst* at the University of Lubeque by master's degree students of the major *Digital Media*.


# How does it work?
Zukunftsmusik does not require an additional smartphone app. Instead, you only have to visit a website on your smartphone to jump right in. The website is a webapp that is being used to access your device's orientation sensors. When tapping on the screen, the webapp transmits these orientation information to the server which subsequently generates MIDI messages according to the device's orientation. The MIDI messages are sent to electronic instruments that can be controlled by MIDI messages. As a result, you can easily create sounds by moving your smartphone around while simultaneously tapping on its screen.

Of course, there are a few things to consider:

1. The server has to be accessible by the smartphone, meaning that they must have access to a mutual network.
2. The smartphone has to come with the required orientation sensors. Also, the browser has to allow access to these sensors.
3. Currently, the system is restricted to a total maximum of 16 simultaneous users. The data is transmitted on a single MIDI port, each instrument is assigned to one of the 16 MIDI channels.


# Usage
## Installation
This package runs on node.js, hence your can install this package by running `npm start`.

### Prerequisites for easymidi
For the installation, a few things are required depending on the OS you are using.

#### OSX
Some version of Xcode (or Command Line Tools)
Python (for node-gyp)

#### Windows
Microsoft Visual C++ (e.g. by installing Visual Studio 2013 Community Edition)
Python (for node-gyp)

#### Linux
A C++ compiler
You must have installed and configured ALSA. Without it this module will NOT build.
Install the libasound2-dev package.
Python (for node-gyp)

## Configuration
### MIDI device
Use the app with the MIDI device of your choice. The standard device used is the second system device. You can change this selection in the file 'app.js' by modifying the variable `midiDeviceID`.
Of course, you can use a virtual MIDI device (such as loopMIDI on Windows).
Connect your instruments to your MIDI device and you're ready to run the server.

## Run the server
After the system is installed and configured, you can start the server by running `npm start`.

## Create your soundscapes
Once the server has started then you can connect to the server by visiting `server-ip` or `server-ip/instrument-name` in your smartphone's browser, where server-ip is the IP address of the computer the server is running on, and the instrument-name is the name of the instrument you want to use. An instrument can only be assigned to one user at the same time. If the instrument already has been assigned, a different instrument will be randomly assigned to your smartphone. This will also happen if you choose to not specify an instrument name.

## Known issues
The IE11 on Windows Phone 8.1 currently has a bug which prevents playing an instrument as long as your finger is touching the phone's screen. Independently from your actions, the browser will fire the *pointerUp* event after a short amount of time even when the finger has not been lifted from the screen. This event triggers the noteOff message.
