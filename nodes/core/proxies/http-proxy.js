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
    var http = require('http');
    var sleep = require('sleep');

    //Until we can connect
    function tryUntilSuccess(node, options, callback) {
        var req = http.request(options, function(res) {
            var acc = "";
            res.on("data", function(msg) {
                callback(null,msg);
            });
            res.on("end", function() {
                tryUntilSuccess(node, options, callback);
                sleep.sleep(5);
            });
        });
        req.end();

        req.on('error', function(e) {
            tryUntilSuccess(node, options, callback);
            sleep.sleep(5);
        });
    }

    function HTTPRequest(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var nodeUrl = n.url;
        var nodeMethod = n.method || "GET";

        var options = '{ "hostname": "'+nodeUrl+'", "port": "'+n.port+'", "method": "'+nodeMethod+'" }';
        // Use the standard callback pattern of err in first param, success in second
        tryUntilSuccess(node, JSON.parse(options), function(err, resp) {
            node.status({fill:"green",shape:"dot",text:"connected "});
            node.send(resp);
        });

        this.on("input",function() {
            //HTTP request :)
            var req = http.request(options, function(res) {
                var acc = "";
                res.on("data", function(msg) {
                    node.send(msg);
                });
            });
            req.end();
        });

        this.on("close",function() {
            node.status({});
        });
    }

    RED.nodes.registerType("http proxy",HTTPRequest,{
        credentials: {
            user: {type:"text"},
            password: {type: "password"}
        }
    });

}
