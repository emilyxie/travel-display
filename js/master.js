var vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var maxLeft = vw - (vw*.15);
var maxTop = vh - (vh*.15);

function photoTile(i){
	$('#photo-tile-container').append('<div class="photo-tile-container" id="' + i.id + '"><img src="assets/rome1.jpg" class="photo-tile-photo"></div>');
	var htmlElement = $('#' + i.id);
	var shouldMove = true;
	function move(shouldMove, htmlElement){
		if(shouldMove){
			var y = Math.random() * maxTop;
			var x = Math.random() * maxLeft;
			htmlElement.animate({top: "" + y, left: "" + x}, 5000, 'linear');
		}
	}

	move(shouldMove, htmlElement);
	var interval = setInterval(move, 5000, shouldMove, htmlElement);

	function stopMovement(){
		shouldMove = false;
		clearInterval(interval);
		htmlElement.stop();
	}

	function startMovement(){
		shouldMove = true;
		move(shouldMove, htmlElement);
		interval = setInterval(move, 5000, shouldMove, htmlElement);
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
	var i = {id: 'rome1'};
	var tile = new photoTile(i);
};