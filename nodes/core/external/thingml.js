/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/


module.exports = function(RED) {
    "use strict";
    var SerialPort = require('serialport');
    var sport;

    function connect(node){
        sport = new SerialPort(node.port, function (err) {
            if (err) {
                console.log('Error serial: ', err.message);
                node.status({fill:"red",shape:"dot",text:"error "});
                setTimeout(function () {
                    connect(node);
                },5000)
            }else{
                console.log('Connected to '+node.port);
                node.status({fill:"green",shape:"dot",text:"connected "});
            }
        });
    }


    // The main node definition - most things happen in here
    function thingmlNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);
        this.port=n.port;

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        connect(node);

        // respond to inputs....
        this.on('input', function (msg) {
            var m=Buffer.from(msg.payload+"");
            sport.write(m,function(err){
                if (err) {
                    return console.log('Error on write: ', err.message);
                }
                console.log('message written');
            });
        });

        sport.on('data', function (data) {
            var msg={};
            msg.payload=data+"";
            node.send(msg);
        });

        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("thingml",thingmlNode);

}
