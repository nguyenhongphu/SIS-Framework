var Docker = require('dockerode');
//Create docker client
var docker;

function buildAndDeploy(node){
    docker = new Docker({host: node.endpoint, port: node.port});
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
    var port='{ "'+node.exposedport+'/tcp" : [{ "HostIP":"0.0.0.0", "HostPort": "'+node.exposedport+'" }]}';

    var options={
        Image: node.image,
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash', '-c', node.command],
        OpenStdin: false,
        StdinOnce: false,
        ExposedPorts: {
            "8000/tcp": {},
        }
    };
    console.log(port);
    options.HostConfig={};
    options.HostConfig.PortBindings=JSON.parse(port);

    docker.createContainer(options).then(function(container) {
        return container.start();
    }).catch(function(err) {
        console.log(err);
    });


}

//This is mandatory for executing the plugin
exports.deploy = function (node) {
    buildAndDeploy(node);
};