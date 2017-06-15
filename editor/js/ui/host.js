
RED.host = (function() {

    function init() {
        RED.actions.add("core:create-docker-host",createDockerHost);
        RED.actions.add("core:create-VM-host",createVMHost);
        RED.actions.add("core:create-machine-host",createMachineHost);
    }

    function createDockerHost(){
        RED.view.state(RED.state.HOST_DRAWING);
        console.log("state has changed :)");
    }

    function createVMHost(){
        RED.view.state(RED.state.HOST_DRAWING);
        console.log("state has changed :)");
    }

    function createMachineHost(){
        RED.view.state(RED.state.HOST_DRAWING);
        console.log("state has changed :)");
    }

    return {
        init: init,
        createDockerHost: createDockerHost,
        createVMHost: createVMHost,
        createMachineHost: createMachineHost
    };

})();