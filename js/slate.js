//global variables
var canvas = document.getElementById("myCanvas");
var itinerary;
var images = [];
var numPhotoTiles = landmarkData.length;
var photoTiles = [];
var magnetPoint = new Point(view.size.width/2, view.size.height/2);
var width = 200;
var addIconWidth = width/8;
var QRcode = new Raster('assets/qr.jpg');
var itineraryTitle = new Raster('assets/title.png');

QRcode.onLoad = function () {
  var scaleFactor = (width/2)/ QRcode.size.width;
  QRcode.scale(scaleFactor);
  QRcode.visible = false;
};

itineraryTitle.onLoad = function () {
  var scaleFactor = (width/2)/ itineraryTitle.size.height;
  itineraryTitle.scale(scaleFactor);
  itineraryTitle.visible = false;
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
  var mapPosition = this.getMapPosition();
  this.addIcon = new Raster('assets/add.png');
  var sendItem = {id: this.id, title: landmarkData.title, description: landmarkData.description, image: image};

  this.addIcon.onLoad = function () {
    var scaleFactor = addIconWidth / this.size.width;
    this.scale(scaleFactor);
    this.position = addIconPosition;
    this.onClick = function(event) {
      itinerary.addItem(sendItem);
    };
  };

  this.mapImage = new Raster('assets/map.png');
  this.mapImage.onLoad = function () {
    var scaleFactor = width/this.size.width;
    this.scale(scaleFactor);
    this.position = mapPosition;
  };

  this.infoGroup = new Group(this.titleText, this.descriptionText, this.infoPath, this.addIcon, this.mapImage);
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
    var xPoint = this.point.x + this.width + this.width - addIconWidth;
    var yPoint = this.point.y + this.width - addIconWidth/2 - 5;
    return new Point({
      x: xPoint,
      y: yPoint
    });
  },

  getMapPosition: function() {
    var xPoint = this.point.x + this.width + this.width/2;
    var yPoint = this.point.y + (this.width*2)/3;
    return new Point({
      x: xPoint,
      y: yPoint
    });
  },
};

// Create itinerary object
function Itinerary(w) {
  this.margin = 15;
  this.width = w;
  this.point = null;
  this.group = null;
  this.items = [{id: "title", image: itineraryTitle}, {id: "QRcode", image:QRcode}];
}

// Itinerary object functions
Itinerary.prototype = {
  
  addItem: function(item) {
    // Check if item exists, skip adding if so
    for(i=0; i<this.items.length; i++){
      if(this.items[i].id === item.id) return;
    }
    this.items.splice(this.items.length-1, 1, item, {id: "QRcode", image:QRcode});
    // var index = this.items.push(item) -1;
    this.formatImage(this.items.length-2);
  },

  removeItem: function(id){
      this.items = this.items.filter(function(e){
        return e.id !== id;
      });
      this.layoutImages();
      console.log(this.items);
  },

  formatImage: function(index) {
    // Set group position based on clicked image (if not yet visible)
    if (this.point === null) {
      this.point = new Point({
        x: view.size.width - 2.5*this.width,
        y: view.size.height/3
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
    imageGroup.details = this.items[index];

    imageGroup.onClick = function(){
      itinerary.removeItem(this.details.id);
    };

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

    if(this.items.length > 2){
      // group contianer and images
      var container = this.renderContainer();
      this.group = new Group();
      this.group.addChild(container);
      QRcode.visible = true;
      itineraryTitle.visible = true;
      // container.sendToBack();

      // align images (position == center)
      for (i=0; i<this.items.length; i++){
        this.group.addChild(this.items[i].image);
        var currentRow = i/2;
        if(i%2 === 0){
          this.items[i].image.position = new Point({
            x: this.point.x + this.margin + this.width/2,
            y: this.point.y + this.margin + this.width/2 + (this.width+this.margin) * currentRow
          });
        } else {
          currentRow -= 0.5;
          this.items[i].image.position = new Point({
            x: this.point.x + this.margin*2 + this.width*3/2,
            y: this.point.y + this.margin + this.width/2 + (this.width+this.margin) * currentRow
          });
        }
      }
      this.group.bringToFront();
    }
  },

  // Render the container to put pictures in (resizing doesn't seem to work)
  renderContainer: function() {
    var iHeight = this.items.length/2 + 1;
    if(this.items.length%2 === 0){
      iHeight -= 1;
    } else if(this.items.length > 1) {
      iHeight -= 0.5;
    }
    outerSize = new Size(this.width*2 + (this.margin * 3), 
          this.margin + (this.width+this.margin) * iHeight);
    
    var outerPath = new Path.Rectangle({
      size: outerSize,
      fillColor: new Color(1, 1, 1),
      radius: new Size(this.width/30, this.width/30),
      point: this.point,
      opacity: 0.8
    });
    return outerPath;
  },

  bringToFront: function(){
    if(this.group){
       this.group.bringToFront();
    }
  },
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
    itinerary.bringToFront();
  };
}

itinerary = new Itinerary(width/2);

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