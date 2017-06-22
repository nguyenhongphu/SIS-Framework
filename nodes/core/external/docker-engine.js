var Docker = require('dockerode');
//Create docker client
var docker;

function buildAndDeploy(node){
    docker = new Docker({host: node.endpoint, port: 1234});
    docker.pull(node.image, function (err, stream) {
        if (stream !== null) {
            stream.pipe(process.stdout, {end: true});
            stream.on('end', function () {
                createContainerAndStart(node);
            });
        }else{
            createContainerAndStart(node);
        }
    });
}

function createContainerAndStart(node){
    //Create a container from an image
    docker.createContainer({
        Image: node.image,
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash', '-c', node.command],
        OpenStdin: false,
        StdinOnce: false
    }).then(function(container) {
        return container.start();
    }).catch(function(err) {
        console.log(err);
    });
}

//This is mandatory for executing the plugin
exports.deploy = function (node) {
    buildAndDeploy(node);
};