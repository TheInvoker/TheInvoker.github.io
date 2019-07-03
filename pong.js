importScripts('util.1.js');

var buffer_xs = [];
var buffer_ys = [];

reset();

setInterval(gLoop, 1);

function gLoop() {
    gameLoop(function() {
        ML_ball_y = ball.y;
        ML_ball_direction = ball.direction;
        ML_prediction_y = Math.random() * game_md.height;
    }, function() {
        buffer_xs.push([ML_ball_y/game_md.height, normalizeDirection(ML_ball_direction)/Math.PI]);
        buffer_ys.push(ball.y/game_md.height);
        if (buffer_xs.length > 100) {
            postMessage([buffer_xs, buffer_ys]);
            buffer_xs = [];
            buffer_ys = [];
        }
    });
}