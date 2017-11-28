//This function call ThingML for compilation
//It generates Arduino sketches
//output streams are redirected
var spawn = require('child_process').spawn;
var fs = require('fs');
var os = require('os');


function compileThingML(node) {
    var output = 'generated';
    var java;

    var hasError = false;

    if (node.source === '') {
        if (!fs.existsSync(output)) {
            console.log('Creating ' + output + ' folder...');
            fs.mkdirSync(output);
        }

        fs.writeFile(node.name + '.thingml', node.code, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });


        java = spawn('java', [
            '-jar', './lib/thingml/ThingML2CLI.jar',
            '-c', node.target,
            '-s', node.name + '.thingml',
            '-o', output
        ]);
    } else {
        java = spawn('java', [
            '-jar', './lib/thingml/ThingML2CLI.jar',
            '-c', node.target,
            '-s', node.source,
            '-o', output
        ]);
    }

    java.stdout.setEncoding('utf8');
    java.stdout.on('data', (data) => {
        data.trim().split('\n').forEach(line => {
            if (line.startsWith('[WARNING]')) {
                console.log('[WARNING]' + line);
            } else if (line.startsWith('[ERROR]')) { //ideally, that should arrive on stderr
                hasError = true;
                console.log('[ERROR]' + line);
            } else {
                console.log('[INFO]' + line);
            }
        });
    });


    java.on('error', (err) => {
        hasError = true;
        console.log('Something went wrong with the compiler!');
    });

    java.on('exit', (code) => {
        if (hasError) {
            console.log('Cannot complete because of errors!');
        } else {
            console.log('Done!');
            if (node.target.indexOf("arduino") >= 0) {
                compileAndUpload(node);
            }
        }
    });

}

//This function calls Arduino ID to compile Arduino sketches
// and to deploy them
function compileAndUpload(node) {

    /*if(node.libraries !== "") {
        var tab = node.libraries.split(',');
        for(var i in tab) {
            var arduinoLibraries = spawn('/Applications/Arduino.app/Contents/MacOS/Arduino', [
                '--install-library', tab[i]
            ]);
        }
    }*/


    //We Should install libaries first
    var path_to_ardui = "";
    if (os.platform === "darwin") {
        path_to_ardui = '/Applications/Arduino.app/Contents/MacOS/Arduino';
    } else {
        path_to_ardui = 'arduino';
    }

    var tab = JSON.parse(node.libraries);
    installLibraries(node, path_to_ardui, tab, 0);

}

function installLibraries(node, path_to_ardui, tab, k) {
    if (node.libraries !== undefined && node.libraries !== "") {
        console.log(JSON.stringify(tab));
        if (k < tab.length) {
            console.log("installing library");
            var install = spawn(path_to_ardui, [
                '--install-library', tab[k]
            ]);
            install.stderr.setEncoding('utf8');
            install.stderr.on('data', (data) => {
                data.trim().split('\n').forEach(line => {
                    console.log('[WARNING]' + line);
                });
            });

            install.on('error', (err) => {
                console.log('Something went wrong with the compiler!' + err);
            });

            install.on('exit', (code) => {
                console.log('Done!');
                installLibraries(node, path_to_ardui, tab, k + 1);
            });
        } else {
            upload(node, path_to_ardui);
        }

    } else {
        upload(node, path_to_ardui);
    }

}


function upload(node, path_to_ardui) {
    var board = 'arduino:avr:' + node.ardtype;
    if (node.cpu.indexOf("") < 0) {
        board += +':cpu=' + node.cpu;
    }
    var arduino = spawn(path_to_ardui, [
        '--board', board,
        '--port', node.port,
        '--upload', 'generated/' + node.name + '/' + node.name + '.ino',
    ]);

    arduino.stdout.setEncoding('utf8');
    arduino.stdout.on('data', (data) => {
        data.trim().split('\n').forEach(line => {
            console.log('[INFO]' + line);
        });
    });


    arduino.stderr.setEncoding('utf8');
    arduino.stderr.on('data', (data) => {
        data.trim().split('\n').forEach(line => {
            console.log('[WARNING]' + line);
        });
    });

    arduino.on('error', (err) => {
        console.log('Something went wrong with the compiler!' + err);
    });

    arduino.on('exit', (code) => {
        console.log('Done!');
        //TODO: add feedback process done
    });
}


exports.deploy = function (node) {
    compileThingML(node);
};