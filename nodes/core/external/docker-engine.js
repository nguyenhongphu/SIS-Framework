var Docker = require('dockerode');
function buildAndDeploy(node){
    //Create docker client
    var docker = new Docker({host: node.endpoint, port: 3000});

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

    docker.run('ubuntu', ['bash', '-c', 'uname -a'], process.stdout, function (err, data, container) {
        console.log(data.StatusCode);
    });

    docker.buildImage({
        context: '',
        src: ['Dockerfile', node.build]
    }, {t: node.image}, function (err, response) {
        console.log(err);
    });

}

//This is mandatory for executing the plugin
exports.deploy = function (node) {
    buildAndDeploy(node);
};