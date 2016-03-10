var vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var MAXLEFT = vw - (vw*0.15);
var MAXTOP = vh - (vh*0.15);
var xValue = MAXLEFT;
var yValue = MAXTOP;

var TILEDATA = [
	{id: 'rome1'},
	{id: 'rome2'},
	{id: 'rome3'},
	{id: 'rome4'},
	{id: 'rome5'},
	{id: 'rome6'},
	{id: 'rome7'},
	{id: 'rome8'},
	{id: 'rome9'}
];

function photoTile(i, timeOut){
	$('#photo-tile-container').append('<div class="photo-tile-container" id="' + i.id + '"><img src="assets/' + i.id + '.jpg" class="photo-tile-photo"></div>');
	var htmlElement = $('#' + i.id);
	var shouldMove = true;
	function move(shouldMove, htmlElement){
		if(shouldMove){
			var y, x;
			if(xValue === MAXLEFT && yValue === MAXTOP){
				y = Math.random() * yValue;
				x = Math.random() * xValue;
			} else {
				y = Math.random()* (vh*0.25) + (yValue - vw*0.075);
				x = Math.random()* (vw*0.25) + (xValue - vw*0.075);
			}
			htmlElement.animate({top: "" + y, left: "" + x}, timeOut, 'linear');
		}
	}

	move(shouldMove, htmlElement);
	var interval = setInterval(move, timeOut, shouldMove, htmlElement);

	function stopMovement(){
		shouldMove = false;
		clearInterval(interval);
		htmlElement.stop();
	}

	function startMovement(){
		shouldMove = true;
		move(shouldMove, htmlElement);
		interval = setInterval(move, timeOut, shouldMove, htmlElement);
	}

	htmlElement.click(function(target){
		if(shouldMove){
			stopMovement();
		} else {
			startMovement();
		}
	});
}

window.onload = function(){
	var tiles = [];
	TILEDATA.forEach(function(i){
		tiles.push(new photoTile(i, Math.random()*2000 + 2000));
	});

	$('body').mousemove(function(e){
		if(e.pageX > MAXLEFT || e.pageX <= 0 || e.pageY > MAXTOP || e.pageY <= 0){
			xValue = MAXLEFT;
			yValue = MAXTOP;
		} else {
			yValue = e.pageY;
			xValue = e.pageX;
		}
	});
};