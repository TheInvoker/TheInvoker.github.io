importScripts('util.js');

//ball = {x: 260.4154707161251, y: 0.4394247540238234, direction: -380}
//ball = {x: 72.56922164907951, y: 179.6643374311471, direction: 831.1534480432201}
//ball = {x: 30.038738315225697, y: 156.45115421151024, direction: 117.62326437511484}
//ball = {x: 358.27499778992325, y: 22.052537557019512, direction: -70.95792512076213}
//ball = {x: 28.760797892813002, y: 37.765134038679754, direction: 251.75470433315252}

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
        buffer_xs.push([ML_ball_y, ML_ball_direction]);
        buffer_ys.push(ball.y);
        if (buffer_xs.length > 10) {
            postMessage([buffer_xs, buffer_ys]);
            buffer_xs = [];
            buffer_ys = [];
        }
    });
}