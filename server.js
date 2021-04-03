'use strict';

var express = require('express');
var path = require("path");
var http = require("http");


// start express module
var app = express();
app.use(express.static(path.join(__dirname, '')));

var httpServer = http.createServer(app);

httpServer.listen(process.env.PORT || 3000, function () {
    var host = httpServer.address().address;
    var port = httpServer.address().port;

    console.log('Site started at https://%s:%s', host, port);
});