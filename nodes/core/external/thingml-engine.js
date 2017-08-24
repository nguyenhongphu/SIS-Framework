//This function call ThingML for compilation
//It generates Arduino sketches
//output streams are redirected
var spawn = require('child_process').spawn;
var fs = require('fs');

function compileThingML(node){
    var output='generated';
    var java;

    var hasError=false;

    if(node.source === '') {
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
            '-s', node.name+'.thingml',
            '-o', output
        ]);
    }else{
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
        console.log('[WARNING]'+line);
    } else if (line.startsWith('[ERROR]')) {//ideally, that should arrive on stderr
        hasError = true;
        console.log('[ERROR]'+line);
    } else {
        console.log('[INFO]'+line);
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
    if(node.target.indexOf("arduino") >=0){
        compileAndUpload(node);
    }
}
});

}

//This function calls Arduino ID to compile Arduino sketches
// and to deploy them
function compileAndUpload(node){
    var board='arduino:avr:'+node.ardtype;
    if(node.cpu.indexOf("") < 0){
        board+=+':cpu='+node.cpu;
    }

    if(node.libraries !== "") {
        var arduinoLibraries = spawn('/Applications/Arduino.app/Contents/MacOS/Arduino', [
            '--install-library', node.libraries
        ]);
    }

    //We Should install libaries first
    var arduino = spawn('/Applications/Arduino.app/Contents/MacOS/Arduino', [
        '--board', board,
        '--port', node.port,
        '--upload', 'generated/'+node.name+'/'+node.name+'.ino',
    ]);

    arduino.stdout.setEncoding('utf8');
    arduino.stdout.on('data', (data) => {
        data.trim().split('\n').forEach(line => {
        console.log('[WARNING]'+line);
});
});


    arduino.stderr.setEncoding('utf8');
    arduino.stderr.on('data', (data) => {
        data.trim().split('\n').forEach(line => {
        console.log('[ERROR]'+line);
});
});

    arduino.on('error', (err) => {
        console.log('Something went wrong with the compiler!');
});

    arduino.on('exit', (code) => {
        console.log('Done!');
});

}

exports.deploy = function (node) {
    compileThingML(node);
};