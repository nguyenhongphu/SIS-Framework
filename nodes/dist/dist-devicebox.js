module.exports = function(RED) {
    "use strict";
    function DeviceBoxNode(n) {
        RED.nodes.createNode(this, n);
        this.type = "devicebox";
        this.deviceId = n.deviceId; // || settings.device
        this.x = n.x;
        this.y = n.y;
        this.width = n.width;
        this.height = n.height;
    }

    RED.nodes.registerType("devicebox", DeviceBoxNode);
}