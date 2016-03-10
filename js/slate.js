//global variables
var canvas = document.getElementById("myCanvas");
var itinerary = new Itinerary(width);
var images = [];
var numPhotoTiles = landmarkData.length;
var photoTiles = [];
var magnetPoint = new Point(view.size.width/2, view.size.height/2);
var width = 150;
var addIconWidth = width/4;
var QRcode = new Raster('assets/QRcode.png');

QRcode.onLoad = function () {
  var scaleFactor = width/ QRcode.size.width;
  QRcode.scale(scaleFactor);
  QRcode.visible = false;
};

canvas.addEventListener("mousemove", function(event) {
  var newX = event.x;//- canvas.getBoundingClientRect().left;
  var newY = event.y; //- canvas.getBoundingClientRect().top;
  magnetPoint = new Point(newX, newY);
});


PointText.prototype.wordwrap = function(txt,max){
  var lines=[];
  var space=-1;
  times=0;
  function cut(){
      for(var i=0;i<txt.length;i++){
          (txt[i]==' ')&&(space=i);
          if(i>=max){
              (space==-1||txt[i]==' ')&&(space=i);
              if(space>0){lines.push(txt.slice((txt[0]==' '?1:0),space));}
              txt=txt.slice(txt[0]==' '?(space+1):space);
              space=-1;
              break;
              }}check();}
  function check(){if(txt.length<=max){lines.push(txt[0]==' '?txt.slice(1):txt);txt='';}else if(txt.length){cut();}return;}
  check();
  return this.content=lines.join('\n');
};

// Photo Tile Object
function PhotoTile(w, p, v, id, image, landmarkData) {
  this.id = id;
  this.width = w;
  this.image = image;
  this.point = p;
  this.vector = v;
  this.maxVec = 1;
  this.isSelected = false;
  this.path = new Path.Rectangle({
      point: p,
      size: [w, w]
  });
  
  this.infoPath = new Path.Rectangle({
      point: this.getInfoPathPosition(),
      size: [w, w],
    fillColor: new Color(1, 1, 1),
  });
  
  var maxChars = 38;
  
  this.titleText = new PointText(this.getTitlePosition());
  this.titleText.fillColor = 'black';
  this.titleText.wordwrap(landmarkData.title, maxChars);
  this.titleText.fontSize = 3 * this.width/60;
  this.titleText.fontWeight = "bold";
  //this.titleText.bounds = this.infoPath.bounds;
  
  this.descriptionText = new PointText(this.getDescriptionPosition());
  this.descriptionText.fillColor = 'black';
  this.descriptionText.wordwrap(landmarkData.description, maxChars);
  this.descriptionText.fontSize = 3 * this.width/60;
  //this.descriptionText.bounds = this.infoPath.bounds;

  // Create an 'add' button
  var addIconPosition = this.getAddIconPosition();
  this.addIcon = new Raster('assets/add.png');
  var sendItem = {id: this.id, title: landmarkData.title, description: landmarkData.description, image: image};

  this.addIcon.onLoad = function () {
    var scaleFactor = addIconWidth / this.size.width;
    this.scale(scaleFactor);
    this.position = addIconPosition;
    this.onClick = function(event) {
      // console.log(sendItem);
      itinerary.addItem(sendItem);
    };
  };

  this.infoGroup = new Group(this.titleText, this.descriptionText, this.infoPath, this.addIcon);
  this.infoGroup.visible = false;
  
  this.imageGroup = new Group(this.path, images[i]);
  this.imageGroup.clipped = true;

  addClickListener(this.imageGroup, id);
}

// Photo tile class functions
PhotoTile.prototype = {
  iterate: function() {
    if(!this.isSelected) {
      this.checkBorders();
      this.vector += this.findGravitationalPull();
      if (this.vector.length > this.maxVec)
        this.vector.length = this.maxVec;
      this.point += this.vector;
      this.imageGroup.position = this.point;
      this.infoGroup.position = this.getInfoPathPosition();
    }
  },
  
  findGravitationalPull: function() {
    var distance = this.point.getDistance(magnetPoint);
    var deltaX = magnetPoint.x - this.point.x;
    var deltaY = magnetPoint.y - this.point.y;
    var angleInRadians = Math.atan2(deltaY, deltaX);
    var G = 8;
    var direction = new Point({
      angle: angleInRadians * (180 / Math.PI),
      length: G/(distance + 300)
    });
    return direction;
  },

  checkBorders: function() {
    var size = view.size;
    if (this.getCenterPoint().x < -this.width/2)
      this.getCenterPoint().x = size.width + this.width/2;
    if (this.getCenterPoint().x > size.width + this.width/2)
      this.getCenterPoint().x = -this.width/2;
    if (this.getCenterPoint().y < -this.width/2)
      this.getCenterPoint().y = size.height + this.width/2;
    if (this.getCenterPoint().y > size.height + this.width/2)
      this.getCenterPoint().y = -this.width/2;
  },

  react: function(b) {
    var dist = this.getCenterPoint().getDistance(b.getCenterPoint());
    var margin = this.width * 0.8;
    if (dist < margin + this.width/2 + b.width/2 && dist !== 0) {
      var overlap = this.width/2 + b.width/2 + margin - dist;
      var direc = (this.point - b.point).normalize(overlap * 0.015);
      var friction = 0.05;
      this.vector += direc*friction;
      b.vector -= direc*friction;
    }
  },
  
  toggleSelection: function() {
    this.isSelected = !this.isSelected;
    this.infoGroup.visible = !this.infoGroup.visible;
    
    if(this.isSelected) {
      this.imageGroup.bringToFront();
      this.infoGroup.bringToFront();
      this.titleText.bringToFront();
      this.descriptionText.bringToFront();
      this.addIcon.bringToFront();
    } else {
    }
  },
  
  getCenterPoint: function() {
    return new Point({
      x: this.point.x + this.width/2,
      y: this.point.y + this.width/2
    });
  },
  
  getInfoPathPosition: function() {
    return new Point({
      x: this.point.x + this.width,
      y: this.point.y
    });
  },
  
  getTitlePosition: function() {
    return new Point({
      x: this.point.x + this.width + this.width/15,
      y: this.point.y + this.width/10
    });
  },
  
  getDescriptionPosition: function() {
    return new Point({
      x: this.point.x + this.width + this.width/15,
      y: this.point.y + this.width/5
    });
  },

  getAddIconPosition: function() {
    var xPoint = this.point.x + this.width + this.width/2;
    var yPoint = this.point.y + this.width - addIconWidth/2 - 5;
    return new Point({
      x: xPoint,
      y: yPoint
    });
  }
};

// Create itinerary object
function Itinerary(w) {
  this.margin = 15;
  this.width = w;
  // this.images = [QRcode];
  this.point = null;
  this.group = null;
  this.items = [{id: "QRcode", image:QRcode}];
}

// Itinerary object functions
Itinerary.prototype = {
  
  addItem: function(item) {
    // Check if item exists, skip adding if so
    for(i=0; i<this.items.length; i++){
      if(this.items[i].id === item.id) return;
    }

    var index = this.items.push(item) -1;
    this.formatImage(index);
    console.log(index, this.items);
  },

  formatImage: function(index) {
    // Set group position based on clicked image (if not yet visible)
    if (this.point === null) {
      this.point = new Point ({
        x: this.items[index].image.position.x + this.width*1.7,
        y: this.items[index].image.position.y - this.width/2 - this.margin
      });
    }

    // Create square image mask and add image to it
    var imageMask = new Path.Rectangle({
        size: new Size(this.width, this.width),
        point: this.point
    });
    var formatImage = this.items[index].image.clone();
    formatImage.position = this.point + this.width/2;

    var imageGroup = new Group(imageMask, formatImage);
    imageGroup.clipped = true;

    // Add image to image array and re-render
    // this.images.push(imageGroup);
    this.items[index].image = imageGroup;
    this.layoutImages();
  },

  // layout images in the array
  layoutImages: function() {
    if (this.group){
      this.group.remove();
    }

    // group contianer and images
    var container = this.renderContainer();
    this.group = new Group();
    this.group.addChild(container);
    QRcode.visible = true;
    // container.sendToBack();

    // align images (position == center)
    for (i=0; i<this.items.length; i++){
      this.group.addChild(this.items[i].image);
      this.items[i].image.position = new Point({
        x: this.point.x + this.margin + this.width/2,
        y: this.point.y + this.margin + this.width/2 + (this.width+this.margin) * i
      });
    }

    this.group.bringToFront();
  },

  // Render the container to put pictures in (resizing doesn't seem to work)
  renderContainer: function() {
    outerSize = new Size(this.width + (this.margin * 2), 
          this.margin + (this.width+this.margin) * this.items.length);
    
    var outerPath = new Path.Rectangle({
      size: outerSize,
      fillColor: new Color(1, 1, 1),
      radius: new Size(this.width/30, this.width/30),
      point: this.point,
      opacity: 0.8
    });
    return outerPath;
  }

};

for (var i = 0; i < numPhotoTiles; i++) {
  // Add and clip images to each path, scaling/ rerasterizing as appropriate
  var image = new Raster(landmarkData[i].imageURL);
  image.onLoad = addPhotoTileWithData(image, landmarkData[i]);
}

function addPhotoTileWithData(image, landmarkData) {
  var position = Point.random() * view.size;
  var vector = new Point({
    angle: 360 * Math.random(),
    length: Math.random() * 30
  });
    
  var scaleFactor = width / Math.min(image.size.width, image.size.height);
  image.scale(scaleFactor);
  // index = images.push(image.rasterize()) -1; //push a rasterized copy
  index = images.push(image) -1;
  // image.remove();

  photoTiles.push(new PhotoTile(width, position, vector, index, images[index], landmarkData));
}

function addClickListener(group, i) {
  group.onClick = function(event) {
    photoTiles[i].toggleSelection();
  };
}

function onFrame() {
  var i, j, k;
  var l = photoTiles.length;

  for (i = 0; i < l - 1; i++) {
    for (j = i + 1; j < l; j++) {
      photoTiles[i].react(photoTiles[j]);
    }
  }
  for (k = 0; k < l; k++) {
    photoTiles[k].iterate();
    images[k].position = photoTiles[k].path.position;
  }
}