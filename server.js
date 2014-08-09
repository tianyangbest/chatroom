/**
 * Created by Yang on 2014/8/9.
 */
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var chatserver = require('./lib/chat_server');
var cache = {};
function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200,
        {"content-type": mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exists) {
           if (exists) {
               fs.readFile(absPath, function(err, data) {
                  if(err) {
                      send404(response);
                  } else {
                      cache[absPath] = data;
                      sendFile(response, absPath, data);
                  }
               });
           } else {
               send404(response);
           }
        });
    }
}

var server = http.createServer(function(request, response) {
   var filePath = false;
    if (request.url == '/') {
        filepath = 'public/index.html';
    } else {
        filepath = 'public' + request.url;
    }
    var absPath = './' + filepath;
    serveStatic(response, cache, absPath);
});

chatserver.listen(server);
server.listen(3000, function() {
    console.log("Server listening on port 3000.");
});