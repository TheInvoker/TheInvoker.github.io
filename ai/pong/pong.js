var main_width = 400;
var main_height = 300;
var scores = [0, 0];
var map = {38: false,40: false,87: false,83: false};

var game_board, paddle, paddles, ball; 

function resetBoardData() {
	var r_angle = Math.random() * 360;
	
	game_board = {
		'width' : main_width,
		'height' : main_height
	};
	paddle = {
		'width' : 10,
		'height' : 40,
		'speed' : 5
	};
	paddles = [
		{
			'x' : 10,
			'y' : game_board.height/2 - paddle.height/2
		},
		{
			'x' : game_board.width - paddle.width - 10,
			'y' : game_board.height/2 - paddle.height/2
		}
	];
	ball = {
		'radius' : 10,
		'x' : game_board.width/2,
		'y' : game_board.height/2,
		'angle' : r_angle,
		'o_angle' : r_angle,
		'speed' : 5
	};
}

function drawGame() {
	// clear board
	ctx.clearRect(0,0,game_board.width,game_board.height);
	
	// draw board
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,game_board.width,game_board.height); 
	
	// draw paddles
	ctx.fillStyle = "white";
	for(var i=0; i<paddles.length; i+=1) {
		ctx.fillRect(paddles[i].x,paddles[i].y,paddle.width,paddle.height); 
	}
	
	// draw ball
	ctx.fillStyle = "cyan";
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();
	
	// draw score
	ctx.fillStyle = "white";
	ctx.font = "30px Arial";
	ctx.fillText(scores[0] + " - " + scores[1],game_board.width/2 - 30, 40);
}

function checkForWin() {
	if (ball.x + ball.radius < 0) {
		scores[1] += 1;
		console.log('Right wins!');
		resetBoardData();
		return;
	} else if (ball.x - ball.radius > game_board.width) {
		scores[0] += 1;
		console.log('Left wins!');
		resetBoardData();
		return;
	}
}


function moveBall() {
	var nballx = ball.x + Math.cos(ball.angle * (Math.PI/180)) * ball.speed;
	var nbally = ball.y - Math.sin(ball.angle * (Math.PI/180)) * ball.speed;
	
	if (ball.y - ball.radius < 0 && ball.angle == ball.o_angle) {
		ball.angle = 360 - ball.angle;
		return;
	} else if (ball.y + ball.radius > game_board.height && ball.angle == ball.o_angle) {
		ball.angle = 360 - ball.angle;
		return;
	} else if (collides ({ x:paddles[0].x, y:paddles[0].y, w:paddle.width, h:paddle.height },{ x:nballx, y:nbally, r:ball.radius }, true)) {
		ball.angle = 180 - ball.angle;
		return;
	} else if (collides ({ x:paddles[1].x, y:paddles[1].y, w:paddle.width, h:paddle.height },{ x:nballx, y:nbally, r:ball.radius }, true)) {
		ball.angle = 180 - ball.angle;
		return;
	} else {
		ball.o_angle = ball.angle;
	}
	
	ball.x = nballx;
	ball.y = nbally;
}

// http://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle
function collides(rect, circle, collide_inside)
{
    // compute a center-to-center vector
    var half = { x: rect.w/2, y: rect.h/2 };
    var center = {
        x: circle.x - (rect.x+half.x),
        y: circle.y - (rect.y+half.y)};

    // check circle position inside the rectangle quadrant
    var side = {
        x: Math.abs (center.x) - half.x,
        y: Math.abs (center.y) - half.y};
    if (side.x >  circle.r || side.y >  circle.r) // outside
        return false; 
    if (side.x < -circle.r && side.y < -circle.r) // inside
        return collide_inside;
    if (side.x < 0 || side.y < 0) // intersects side or corner
        return true;

    // circle is near the corner
    return side.x*side.x + side.y*side.y  < circle.r*circle.r;
}

function movePaddle() {
    if (map['38']) {
        // up right player - up arrow
		paddles[1].y = Math.max(paddles[1].y - paddle.speed, 0);
    }
    if (map['40']) {
        // down right player - down arrow
		paddles[1].y = Math.min(paddles[1].y + paddle.speed, game_board.height - paddle.height);
    }
    
	if (map['87']) {
       // up left player - W
		paddles[0].y = Math.max(paddles[0].y - paddle.speed, 0);
    }
    if (map['83']) {
       // down left player - S
		paddles[0].y = Math.min(paddles[0].y + paddle.speed, game_board.height - paddle.height);
    }
}

var canvas = document.createElement('canvas');
canvas.width = main_width;
canvas.height = main_height;
var ctx = canvas.getContext("2d");
document.body.appendChild(canvas);


resetBoardData();
function gameLoop() {
	checkForWin();
	moveBall();
	movePaddle();
	drawGame();
	requestAnimationFrame(gameLoop);
}
gameLoop();

// listen for key presses
$(document).keydown(function(e) {
    if (e.keyCode in map) {
        map[e.keyCode] = true;
    }
}).keyup(function(e) {
    if (e.keyCode in map) {
        map[e.keyCode] = false;
    }
});