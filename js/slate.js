
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
  }

  function Ball(w, p, v, id, image, landmarkData) {
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
      }
    };



    this.infoGroup = new Group(this.titleText, this.descriptionText, this.infoPath, this.addIcon);
    this.infoGroup.visible = false;
    
    this.imageGroup = new Group(this.path, images[i]);
    this.imageGroup.clipped = true;

    addClickListener(this.imageGroup, id);
  }

  Ball.prototype = {
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
      return direction
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
      if (dist < margin + this.width/2 + b.width/2 && dist != 0) {
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

}



  //--------------------- main ---------------------

  /**
  var landmarkData = Array.apply(null, Array(numBalls)).map(function(){return {
    imageURL: "https://www.instagram.com/p/BClbuvLJ1Uc/", //"http://arounddeglobe.com/wp-content/uploads/2014/09/Colosseum.jpg",
    title: "Colosseum",
    description: "sorta super long description to see if word wrapping actually works to spec, so we'll see. can't usually trust the internet, ya know."
  }});
  **/

  var landmarkData = [
  {title: 'Fontana di Trevi', description: '#wheninrome #wish #me #roma #italy #worldtravel #fontanaditrevi', imageURL: 'assets/rome1.jpg'},
  {title: 'Christmas market in Piazza Navona', description: '', imageURL: 'assets/rome2.jpg'},
  {title: 'Via del Corso', description: '#shopping #windowshopping on via del Corso', imageURL: 'assets/rome3.jpg'},
  {title: 'Piazza Colonna', description: 'Romans love their obelisks...', imageURL: 'assets/rome4.jpg'},
  {title: 'Aventine Hill', description: 'A little piece and quet on the hillside :) #leafy #aventinehill #rome', imageURL: 'assets/rome5.jpg'},
  {title: 'Parco Savello', description: '#nature #view #trees #rome #eternalcity', imageURL: 'assets/rome6.jpg'},
  {title: 'Priory of the Knights of Malta gate', description: 'SO COOL. #keyhole #stpetersbasilica #view #wellaligned #rome #eternalcity', imageURL: 'http://previews.123rf.com/images/gandolfocannatella/gandolfocannatella1506/gandolfocannatella150600001/41260674-The-dome-of-Saint-Peters-Basilica-seen-through-the-famous-keyhole-at-the-the-gate-of-the-Priory-of-t-Stock-Photo.jpg'},
  {title: 'Baths of Caracalla', description: '#ruins #ancient #rome', imageURL: 'http://media-2.web.britannica.com/eb-media/58/120858-004-6B80730F.jpg'},
  {title: 'Trastevere', description: 'just strolling around #trasteverre, you know, as you do :)', imageURL: 'https://imagesus-ssl.homeaway.com/mda01/8f8fe04c-8bd6-43ca-88ba-72aa2675716b.1.10'},
  {title: 'Trastevere', description: 'friday night in #trastevere #rome #isthatdancing?', imageURL: 'http://www.currystrumpet.com/wp-content/uploads/2012/05/IMG_55841.jpg'},
  {title: 'Trastevere', description: '#quaint #eternalcity', imageURL: 'http://www.residenzasantamaria.com/wp-content/uploads/2014/05/Rome-Trastevere-windows.jpg'},
  {title: 'Santa Cecilia Church', description: '', imageURL: 'http://vignette1.wikia.nocookie.net/romanchurches/images/6/64/Santa_Cecilia_in_Trastevere_tomb.jpg/revision/latest?cb=20120203144043'},
  {title: 'Santa Cecilia Church', description: '', imageURL: 'http://www.pilgrimstorome.org.uk/gallery/galleries/Rome5thCent/R5CG/R5CG310.jpg'},
  {title: 'Santa Cecilia Church', description: '#crypt #rome', imageURL: 'http://www.inrometoday.it/phototour/churches/trastevere/santacecilia/images/cripta.jpg'},
  {title: 'The Vatican', description: '#vatican #dome #rome', imageURL: 'http://images.nationalgeographic.com/wpf/media-live/photos/000/032/cache/vatican-city_3240_600x450.jpg'},
  {title: 'Prati', description: '#prati #vatican #ViaColadiRienzo', imageURL: 'http://www.prolocoroma.it/wp-content/uploads/2013/02/saldi-roma-2011.jpg'},
  {title: 'Museo delle Anime dei Defunti', description: '#creepy #weird stuff in the museo delle anime dei defunti', imageURL: 'https://ruinsofrika.files.wordpress.com/2014/03/cripta-cappuccini-ng.jpg'},
  {title: 'The Pantheon', description: 'chillin in front of the #pantheon #rome #eurotour', imageURL: 'http://i.dailymail.co.uk/i/pix/2012/10/04/article-2212760-155885FB000005DC-351_634x419.jpg'},
  {title: 'Colosseum', description: 'I may have knocked a column over… #colosseum #rome #italy #accident', imageURL: 'http://40.media.tumblr.com/a29853c67701be933a7a055bfec63cab/tumblr_o3a1swsXT71s4myhjo1_1280.jpg'},
  {title: 'Colosseum', description: '#Roma #Amore #Capitale #LoveMyCity #Love #CaputMundi #Colosseo #Colosseum #MeMyselfandI #Italy', imageURL: 'http://41.media.tumblr.com/1c0a140dd1ca97a5df454db261da7aa9/tumblr_o3a0evpjSq1s4myhjo1_1280.jpg'},
  {title: 'Colosseum', description: 'Just 4 more weeks… #wanderlustwithfn #colosseum #colosseo #rome #roma #italy #italia #magnificent #architecture #instagood #instatravel #instapassport #traveling #l4l #potd #amazing #europe #trip #wanderlust #love #travel #beautifuldestinations #travelgram #europetrip #discover #garden #city #tb #memories', imageURL: 'http://41.media.tumblr.com/698da8081c4b9f33bb6511509b4f5883/tumblr_o39csvxpGK1s4myhjo1_1280.jpg'},
  {title: 'Arch of Constantine', description: '#콘스탄티누스개선문 #콜로세움 바로 옆!! 유럽사진 정리 언제하냐… #Rome #italy #colosseum #archofconstantine #여행 #여행스타그램 #이탈리아 #로마', imageURL: 'http://40.media.tumblr.com/6f587ad7c3845a67c358fb7e7e1a8163/tumblr_o38uquQaof1s4myhjo1_1280.jpg'},
  {title: 'Colosseum', description: '#Italy #roma #colosseum #weekend #amazing #выходные #рим', imageURL: 'http://40.media.tumblr.com/8a80eb985099d898961ee36b500714fe/tumblr_o37zietfX91s4myhjo1_1280.jpg'},
  {title: 'Rome', description: 'Roman ruins 🏛', imageURL: 'http://40.media.tumblr.com/f52d986f7e468d2ee08ad97cc73b6d14/tumblr_o37lmnlKA71s4myhjo1_1280.jpg'},
  {title: 'Pigneto', description: "R AI N Y D A Y I N #ROME // #romanity #whatitalyis Questa storia che un giorno è estate e l'altro invero, deve finire!", imageURL: 'https://40.media.tumblr.com/68648a6b3ed3338c8def9b9b4a6e14f8/tumblr_o3kgt4UEJ21rprpe9o1_500.jpg'},
  {title: 'Olearie Exhibit', description: '#dogs #exhibit #rome', imageURL: 'https://41.media.tumblr.com/b00755aee8f273c21311c06f8be91454/tumblr_o3hhg53phr1tqr0bmo2_500.jpg'},
  {title: 'Rome', description: '#romebynight', imageURL: 'https://40.media.tumblr.com/33850ff45a2ad38a0d4615dd75a8dca2/tumblr_o3crevKYZI1qi45wno1_1280.jpg'},
  {title: 'Trastevere, Rome', description: 'The #background was so pretty, #Trastevere is actually one of the best parts of #Rome tbh', imageURL: 'https://41.media.tumblr.com/3ab62233ba70eef9d41425c3ffc8dad7/tumblr_o3j79dAaRP1snp9vqo1_500.jpg'},
  {title: 'Vaticano Roma', description: '#gelato ! #rome', imageURL: 'https://41.media.tumblr.com/a032b38e7edce4219e1a3fb42761dff9/tumblr_o3h98fmT5N1snp9vqo1_500.jpg'},
  {title: 'San Francesco a Ripa', description: 'Bernini, Blessed Ludovica Albertoni, 1674 #baroque #italianbaroque #art #arthistory #rome', imageURL: 'https://40.media.tumblr.com/6579b0c33c950d221fe3606612fcc880/tumblr_o3d8fy9jY51swjsa9o1_1280.jpg'},
  {title: 'Castel Sant Angelo', description: '#rome #sunset #city #cityscape #castelsantangelo', imageURL: 'https://40.media.tumblr.com/ffe5f93597228dafa79d8552133aaec6/tumblr_o3fhacdUiJ1rb4wauo1_1280.jpg'},
  {title: 'Castel Sant Angelo', description: '#castelsantangelo #mausoleumofhadrian #hadrian #romanempire #romanemperor #eternalcity #historicalcity #history #ancientrome #ancienthistory #ancientworld #rome #italy #travel #travelling #beautifulcity', imageURL: 'https://41.media.tumblr.com/2665241e7b8cfde88df7d4b47f47a5ec/tumblr_o0tcvqlJhV1uvfkp8o1_500.jpg'},
  {title: 'Camminando per Roma', description: 'Non solo libri #camminandoperRoma', imageURL: 'https://40.media.tumblr.com/2897155fc297b78707c1a56294c14e75/tumblr_o39p7etBzU1u6e9r6o1_500.jpg'},
  {title: 'Gelato Roma', description: 'After being on a plane for 14 hours, gelato is god #gelato #yummy #rome', imageURL: 'https://40.media.tumblr.com/4e353341757eb64cb458ee8f75cc1499/tumblr_nmejsfwXyq1s41u4po1_500.jpg'},
  {title: 'PizzaRe, Rome', description: '#roma #foodporn #pizza', imageURL: 'https://40.media.tumblr.com/ff023d123b36b11833da90a9d270c2d6/tumblr_nw2jpxArhH1rbe4nko1_500.jpg'},
  {title: 'Rome', description: '#Saltimbocca #foodporn #yum', imageURL: 'https://41.media.tumblr.com/4f940142222a6b0dfa9998ac2e588a14/tumblr_nfgg89OdPq1s5cuk9o1_500.jpg'},
  {title: 'Caffe Bea', description: '#caffelatte and #pizza, what more could you want? #rome', imageURL: 'https://40.media.tumblr.com/f6c1e1ee23c110a4f5f45e5bbca0b10e/tumblr_ndholx5XQI1smzihso1_500.jpg'}
  ];
  
  var numBalls = landmarkData.length;
  var balls = [];
  var magnetPoint = new Point(view.size.width/2, view.size.height/2);

  
  var width = 150 //Math.random() * 60 + 60;
  var addIconWidth = width/4;

  var QRcode = new Raster('assets/QRcode.png');
  QRcode.onLoad = function () {
    var scaleFactor = width/ QRcode.size.width;
    QRcode.scale(scaleFactor);
    QRcode.visible = false;
  };

  var itinerary = new Itinerary(width);
  var images = [];  

  //console.log(landmarkData);

  for (var i = 0; i < numBalls; i++) {    
    // Add and clip images to each path, scaling/ rerasterizing as appropriate
    var image = new Raster(landmarkData[i].imageURL);
    image.onLoad = addBallWithData(image, landmarkData[i]);
  }

  function addBallWithData(image, landmarkData) {
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

    balls.push(new Ball(width, position, vector, index, images[index], landmarkData));
  };

  function addClickListener(group, i) {
    group.onClick = function(event) {
      balls[i].toggleSelection();
    }
  }

  var canvas = document.getElementById("myCanvas");
  canvas.addEventListener("mousemove", function(event) {
    var newX = event.x;//- canvas.getBoundingClientRect().left;
    var newY = event.y; //- canvas.getBoundingClientRect().top;
    magnetPoint = new Point(newX, newY);  
    // console.log(magnetPoint);
    // console.log(balls[0].point);
    // console.log(balls[0].infoGroup.bounds.size)
    // console.log(balls[0].imageGroup.bounds.size)
  });

  function onFrame() {
    for (var i = 0; i < balls.length - 1; i++) {
      for (var j = i + 1; j < balls.length; j++) {
        balls[i].react(balls[j]);
      }
    }
    for (var i = 0, l = balls.length; i < l; i++) {
      balls[i].iterate();
      images[i].position = balls[i].path.position;
    }
  }