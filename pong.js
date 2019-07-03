importScripts('util.js');

var buffer_xs = [];
var buffer_ys = [];

reset();

setInterval(gLoop, 1);

var buffer = [];

function gLoop() {
    gameLoop(function() {
        buffer.push([ball.x, ball.y, ball.direction]);
        ML_prediction_y = Math.random() * game_md.height;
    }, function() {

    }, function() {
        buffer.map(function(item) {
            buffer_xs.push([item[0]/game_md.width, item[1]/game_md.height, normalizeDirection(item[2])/Math.PI]);
            buffer_ys.push(ball.y/game_md.height);
        });
        buffer = [];
        if (buffer_xs.length > 100) {
            postMessage([buffer_xs, buffer_ys]);
            buffer_xs = [];
            buffer_ys = [];
        }
    });
}