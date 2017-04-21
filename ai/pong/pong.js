var main_width = 400;
var main_height = 300;
var scores = [0, 0];
var map = {38: false,40: false,87: false,83: false};
var game_board, paddle, paddles, ball; 
var balInfo = {};
var startTime = new Date();
var trainingLength = 0;

setInterval(function() {
	scores = [0, 0];
	startTime = new Date();
}, 1000 * 60);


// NN
var trainingDB = [];
var learningRate = .3;
var Layer = synaptic.Layer;
var Network = synaptic.Network;

// create the network
var inputLayer = new Layer(2);
var hiddenLayer = new Layer(3);
var hiddenLayer2 = new Layer(3);
var outputLayer = new Layer(1);

inputLayer.project(hiddenLayer);
hiddenLayer.project(hiddenLayer2);
hiddenLayer2.project(outputLayer);

var myNetwork = new Network({
	input: inputLayer,
	hidden: [hiddenLayer, hiddenLayer2],
	output: outputLayer
});


function resetBoardData() {
	
	var items = [135 + Math.random()*90];//, Math.random()*45, 315+Math.random()*45];
	var r_angle = items[Math.floor(Math.random()*items.length)];
	
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
		'speed' : 5,
		'speed2' : 9
	};
}

function drawGame() {
	// clear board
	ctx.clearRect(0,0,game_board.width,game_board.height);
	
	
	// draw board
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,game_board.width,game_board.height); 
	
	// draw paddles
	ctx.fillStyle = "#dadada";
	for(var i=0; i<paddles.length; i+=1) {
		ctx.fillRect(paddles[i].x,paddles[i].y,paddle.width,paddle.height); 
	}
	
	// draw ball
	ctx.fillStyle = "#dadada";
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();
	
	
	// draw score
	ctx.fillStyle = "black";
	ctx.font = "20px Arial";
	ctx.fillText("Started " + formatDate(startTime),game_board.width/2 - 70, 40);
	ctx.fillText(scores[0] + " - " + scores[1] + " (" + (100 * (scores[1]/scores[0])).toFixed(2) + ")",game_board.width/2 - 70, 60);
	ctx.fillText(getDateDiff(startTime, new Date()), game_board.width/2 - 70, 80);
	ctx.fillText(trainingLength + " training size", game_board.width/2 - 70, 100);
}

function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}
function getDateDiff(date_now, date_future) {
	// get total seconds between the times
	var delta = Math.abs(date_future - date_now) / 1000;

	// calculate (and subtract) whole days
	var days = Math.floor(delta / 86400);
	delta -= days * 86400;

	// calculate (and subtract) whole hours
	var hours = Math.floor(delta / 3600) % 24;
	delta -= hours * 3600;

	// calculate (and subtract) whole minutes
	var minutes = Math.floor(delta / 60) % 60;
	delta -= minutes * 60;

	// what's left is seconds
	var seconds = delta % 60;  // in theory the modulus is not required	
	
	return hours + "h " + minutes + "m " + Math.floor(seconds) + "s";
}

function checkForWin(event) {
	if (ball.x + ball.radius < 0) {
		scores[1] += 1;
		console.log('Right wins!');
		resetBoardData();
	} else if (ball.x - ball.radius > game_board.width) {
		
		if (balInfo.hasOwnProperty('y')) {
			trainingDB.push([balInfo.y/game_board.height, balInfo.angle/360, ball.y/game_board.height]);
			trainingLength += 1;
		}
		
		scores[0] += 1;
		console.log('Left wins!');
		resetBoardData();
	}
}

function moveBall(event) {
	var nballx = ball.x + Math.cos(ball.angle * (Math.PI/180)) * ball.speed;
	var nbally = ball.y - Math.sin(ball.angle * (Math.PI/180)) * ball.speed;
	
	if (ball.y - ball.radius < 0 && ball.angle == ball.o_angle) { // hit top wall
		ball.angle = 360 - ball.angle;
		return;
	} else if (ball.y + ball.radius > game_board.height && ball.angle == ball.o_angle) { // hit bottom wall
		ball.angle = 360 - ball.angle;
		return;
	} else if (collides ({ x:paddles[0].x, y:paddles[0].y, w:paddle.width, h:paddle.height },{ x:nballx, y:nbally, r:ball.radius }, true) && ball.angle == ball.o_angle) { // hit left player paddle
		
		var d1 = distance(nballx, nbally, paddles[0].x+paddle.width/2, paddles[0].y);
		var d2 = distance(nballx, nbally, paddles[0].x+paddle.width/2, paddles[0].y+paddle.height);
		
		var a = angle(paddles[0].x+paddle.width/2, -(paddles[0].y+paddle.height/2), nballx, -nbally);
		if (a < 0) a = 360 + a;
		
		if (a > 90 && a < 270) {
			var r = ((Math.random()*2)-1) * 3;
			ball.angle = 360 - ball.angle + r;
		} else if (d1 <= ball.radius*1.5 || d2 <= ball.radius*1.5) {
			var r = ((Math.random()*2)-1) * 5;
			ball.angle = a + r;
			ball.speed = ball.speed2;
		} else {
			var r = ((Math.random()*2)-1) * 3;
			ball.angle = 180 - ball.angle + r;
			if (ball.angle < 0) ball.angle = 360+ball.angle;
		}
		
		balInfo.y = nbally;
		balInfo.angle = ball.angle;
		
		return;
	} else if (collides ({ x:paddles[1].x, y:paddles[1].y, w:paddle.width, h:paddle.height },{ x:nballx, y:nbally, r:ball.radius }, true) && ball.angle == ball.o_angle) {  // hit right player paddle
		
		var d1 = distance(nballx, nbally, paddles[1].x+paddle.width/2, paddles[1].y);
		var d2 = distance(nballx, nbally, paddles[1].x+paddle.width/2, paddles[1].y+paddle.height);
		
		var a = angle(paddles[1].x+paddle.width/2, -(paddles[1].y+paddle.height/2), nballx, -nbally);
		if (a < 0) a = 360 + a;
		
		if (a < 90 || a > 270) {
			var r = ((Math.random()*2)-1) * 3;
			ball.angle = 360 - ball.angle + r;
		} else if (d1 <= ball.radius*1.5 || d2 <= ball.radius*1.5) {	
			var r = ((Math.random()*2)-1) * 5;
			ball.angle = a + r;
			ball.speed = ball.speed2;
		} else {
			var r = ((Math.random()*2)-1) * 3;
			ball.angle = 180 - ball.angle + r;
			if (ball.angle < 0) ball.angle = 360+ball.angle;
		}
		
		if (balInfo.hasOwnProperty('y')) {
			trainingDB.push([balInfo.y/game_board.height, balInfo.angle/360, ball.y/game_board.height]);
			trainingLength += 1;
		}
		
		return;
	} else {
		ball.o_angle = ball.angle;
	}
	
	ball.x = nballx;
	ball.y = nbally;
}



function angle(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
}

function distance(x1, y1, x2, y2) {
	var a = x1 - x2;
	var b = y1 - y2;
	var c = Math.sqrt( a*a + b*b );
	return c;
}

// http://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle
function collides(rect, circle, collide_inside) {
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




function moveRightPlayerUp() {
	paddles[1].y = Math.max(paddles[1].y - paddle.speed, 0);
}
function moveRightPlayerDown() {
	paddles[1].y = Math.min(paddles[1].y + paddle.speed, game_board.height - paddle.height);
}
function moveLeftPlayerUp() {
	paddles[0].y = Math.max(paddles[0].y - paddle.speed, 0);
}
function moveLeftPlayerDown() {
	paddles[0].y = Math.min(paddles[0].y + paddle.speed, game_board.height - paddle.height);
}

function movePaddle() {
    if (map['38']) {
        // up right player - up arrow
	moveRightPlayerUp();
    }
    if (map['40']) {
        // down right player - down arrow
	moveRightPlayerDown();
    }
    
    if (map['87']) {
        // up left player - W
	moveLeftPlayerUp();
    }
    if (map['83']) {
        // down left player - S
	moveLeftPlayerDown();
    }
}




var canvas = document.createElement('canvas');
canvas.width = main_width;
canvas.height = main_height;
var ctx = canvas.getContext("2d");
document.body.appendChild(canvas);











function gameLoop(event) {
	checkForWin(event);
	moveBall(event);
	movePaddle();
	drawGame();
	
	// naive left player ai
	if (ball.y < paddles[0].y) moveLeftPlayerUp();
	else if (ball.y > paddles[0].y + paddle.height) moveLeftPlayerDown();
	else {
		if (ball.y < paddles[0].y + paddle.height/2) moveLeftPlayerUp();
		else if (ball.y > paddles[0].y + paddle.height/2) moveLeftPlayerDown();
	}

	// machine learning right player ai
	if (balInfo.hasOwnProperty('y')) {
		var predictedYPos = myNetwork.activate([balInfo.y/game_board.height, balInfo.angle/360]) * game_board.height;
	} else {
		var predictedYPos = game_board.height/2 - paddle.height/2;
	}
	moveToPredicted(predictedYPos);
}

function moveToPredicted(predictedYPos) {
	var a = predictedYPos - paddles[1].y;
	if (a < 0) moveRightPlayerUp();
	else if (a > 0) moveRightPlayerDown();	
}

function receiveMessage(event) {
	if (event.data.id == 0) {
		resetBoardData();
	   	setInterval(gameLoop, 0, event);
		setInterval(function(event) {
			event.source.postMessage({'id':0,'message':trainingDB}, event.origin); // send all your collected training data to master brain
			event.source.postMessage({'id':1}, event.origin); // request for updated master brain
			trainingDB.length = 0;	
		}, 1000 * 60, event);
		myNetwork = Network.fromJSON(event.data.message); // overwrite your brain with a copy of master brain
	} else if (event.data.id == 1) {
		myNetwork = Network.fromJSON(event.data.message); // overwrite your brain with a copy of master brain
	}
}


window.addEventListener("message", receiveMessage, false);


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
