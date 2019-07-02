// configuration
var game_md = {
    width : 400,
    height : 200,
    paddle : {
        width : 20,
        height : 40,
        speed : 5
    }
};
var paddles = [
    {
        x:0,
        points:0
    },
    {
        x:game_md.width - game_md.paddle.width,
        points:0
    }
];
var ball_md = {
    radius : 10,
    speed : 5
};
var ball = {};

//ball = {x: 260.4154707161251, y: 0.4394247540238234, direction: -380}
//ball = {x: 72.56922164907951, y: 179.6643374311471, direction: 831.1534480432201}
//ball = {x: 30.038738315225697, y: 156.45115421151024, direction: 117.62326437511484}
//ball = {x: 358.27499778992325, y: 22.052537557019512, direction: -70.95792512076213}
//ball = {x: 28.760797892813002, y: 37.765134038679754, direction: 251.75470433315252}

var ML_ball_y = ball.y;
var ML_ball_direction = ball.direction;
var ML_prediction_y = 0;

function reset() {
    paddles.map(function(paddle) {
        paddle.y = game_md.height/2 - game_md.paddle.height/2;
    });
    ball.x = Math.floor(game_md.width/2) - ball_md.radius;
    ball.y = Math.floor(game_md.height/2) - ball_md.radius; 
    ball.direction = Math.random()*Math.PI;

    ML_ball_y = ball.y;
    ML_ball_direction = ball.direction;
    ML_prediction_y = 0;

    /*
    ball.x = 100;
    ball.y = 40; 
    ball.direction = 3.5;

    ball.x = 100;
    ball.y = 40; 
    ball.direction = 6.1;

    ball.x = 100;
    ball.y = 150; 
    ball.direction = 0.2;

    ball.x = 200;
    ball.y = 150; 
    ball.direction = 2.8;

    ball.x = 80;
    ball.y = 150; 
    ball.direction = 2.8;
    
    ball.x = 60;
    ball.y = 150; 
    ball.direction = 2.5;
    */
}


function gameLoop(onEnemyHitPaddle, train) {
    var dx = Math.cos(ball.direction)*ball_md.speed;
    var dy = Math.sin(ball.direction)*ball_md.speed;
    ball.x += dx;
    ball.y -= dy;

    var nai = paddles[0];
    if (nai.y > ball.y+ball_md.radius * 2 && nai.y - game_md.paddle.speed >= 0) {
        nai.y -= game_md.paddle.speed;
    } else if (nai.y + game_md.paddle.height < ball.y && nai.y + game_md.paddle.height + game_md.paddle.speed < game_md.height) {
        nai.y = Math.min(nai.y + game_md.paddle.speed, game_md.height-game_md.paddle.height-1);
    }

    var mlai = paddles[1];
    if (mlai.y > ML_prediction_y && mlai.y - game_md.paddle.speed >= 0) {
        mlai.y -= game_md.paddle.speed;
    } else if (mlai.y + game_md.paddle.height < ML_prediction_y && mlai.y + game_md.paddle.height + game_md.paddle.speed < game_md.height) {
        mlai.y = Math.min(mlai.y + game_md.paddle.speed, game_md.height-game_md.paddle.height-1);
    }

    var hitPaddle = paddles.find(function(paddle) {
        var circle={x:ball.x+ball_md.radius, y:ball.y+ball_md.radius, r:ball_md.radius};
        var rect={x:paddle.x, y:paddle.y, w:game_md.paddle.width, h:game_md.paddle.height};
        return RectCircleColliding(circle, rect);
    });
    
    if (hitPaddle) {
        if (hitPaddle == nai) {
            onEnemyHitPaddle(ball.y, ball.direction);
        }
        reverseUntilNoCollision(hitPaddle);   
    }

    if (ball.y < 0 || ball.y+ball_md.radius*2 >= game_md.height) {                                         // up/bottom wall
        ball.direction = 2*Math.PI - ball.direction; 
    } else if (ball.x+ball_md.radius*2 < 0) {                                                              // left exit
        paddles[1].points++;
        reset();
    } else if (ball.x >= game_md.width) {                                                                  // right exit
        train();
        paddles[0].points++;
        reset();
    } else if (hitPaddle) {
                                                                                                            // corners
        if (pointDistance(ball.x + ball_md.radius, ball.y + ball_md.radius, hitPaddle.x, hitPaddle.y) <= ball_md.radius+1) { 
            ball.direction += Math.PI;
        } else if (pointDistance(ball.x + ball_md.radius, ball.y + ball_md.radius, hitPaddle.x+game_md.paddle.width, hitPaddle.y) <= ball_md.radius+1) {
            ball.direction += Math.PI;
        } else if (pointDistance(ball.x + ball_md.radius, ball.y + ball_md.radius, hitPaddle.x, hitPaddle.y+game_md.paddle.height) <= ball_md.radius+1) {
            ball.direction += Math.PI;
        } else if (pointDistance(ball.x + ball_md.radius, ball.y + ball_md.radius, hitPaddle.x+game_md.paddle.width, hitPaddle.y+game_md.paddle.height) <= ball_md.radius+1) {
            ball.direction += Math.PI;
        } else if ((ball.y > hitPaddle.y + game_md.paddle.height) || (ball.y + ball_md.radius*2 < hitPaddle.y)) { // top/bottom of paddle 
            ball.direction = 2*Math.PI - ball.direction;
        } else {                                                                                                  // left/right of paddle
            ball.direction = (Math.PI*2) - (ball.direction - Math.PI);
        }
    }
}

function reverseUntilNoCollision(paddle) {
    while (1) {
        var dx = Math.cos(ball.direction-Math.PI);
        var dy = Math.sin(ball.direction-Math.PI);
        ball.x += dx;
        ball.y -= dy;

        var circle={x:ball.x+ball_md.radius, y:ball.y+ball_md.radius, r:ball_md.radius};
        var rect={x:paddle.x, y:paddle.y, w:game_md.paddle.width, h:game_md.paddle.height};
        var hit = RectCircleColliding(circle, rect);

        if (!hit) {
            break;
        }
    }
}

function RectCircleColliding(circle, rect){
    var distX = Math.abs(circle.x - rect.x-rect.w/2);
    var distY = Math.abs(circle.y - rect.y-rect.h/2);

    if (distX > (rect.w/2 + circle.r)) { return false; }
    if (distY > (rect.h/2 + circle.r)) { return false; }

    if (distX <= (rect.w/2)) { return true; } 
    if (distY <= (rect.h/2)) { return true; }

    var dx=distX-rect.w/2;
    var dy=distY-rect.h/2;
    return (dx*dx+dy*dy<=(circle.r*circle.r));
}

function pointDistance(x1,y1,x2,y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    var c = Math.sqrt( a*a + b*b );
    return c;
}