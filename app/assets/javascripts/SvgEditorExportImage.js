(function(geoP) {

  var SvgEditor = geoP.SvgEditor;


  function getBlobUrl(canvasdata) {
    var byteString = atob(canvasdata.replace(/^data:image\/(png|jpg);base64,/, "")); //wtf is atob?? https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    var dataView = new DataView(ab);
    var blob = new Blob([dataView], {
      type: "image/png"
    });
    var DOMURL = self.URL || self.webkitURL || self;
    var newurl = DOMURL.createObjectURL(blob);
    return newurl;
  }

  SvgEditor.prototype.exportToImage = function() {
    var svgContainerId = this.svgId;
    var editor = this;
    var imageName = this.getFloorFullName();
    var $svgDiv = $('<div id="svgdataurl"></div>');

    var savedCamera = {
      scale: editor.camera.scale,
      x: editor.camera.x,
      y: editor.camera.y
    };

    editor.camera = geoP.DefaultCamera;

    var saveScale = 1;
    editor.camera.scale = saveScale;


    editor.applyTransform();

    var html = d3.select("#" + svgContainerId)
      // .attr("version", 1.1)
      // .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr('width', editor.bgBox.w)
      .attr('height', editor.bgBox.h)
      .node().outerHTML;

    editor.camera = savedCamera;
    editor.applyTransform();

    var h = html.replace(/²/g, '&#178;');
    // console.log(h, escape('http://localhost/1.png'));

    // h = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink" version="1.1" width="2000px" height="1401px"><rect x="0" y="0" width="100px" height="100px" fill="#ffcf00" stroke="#ffcf00"></rect><image xlink:href="http://localhost:3000/1.png" preserveAspectRatio="none" x="0" y="0" width="50px" height="50px"></image></svg>';

    var $c = $('<canvas id="exportCanvas"></canvas>');

    // $svgDiv.css('display', 'none');
    // $c.css('display', 'none');

    $('body').append($svgDiv).append($c);
    var canvasDom = $c[0];
    var canvas = canvasDom;
    var context = canvas.getContext("2d");

    // var canvasSize = {
    //   w: editor.bgBox.w * saveScale,
    //   h: editor.bgBox.h * saveScale
    // };

    // context.canvas.width = canvasSize.w;
    // context.canvas.height = canvasSize.h;
    // context.fillStyle = 'white';
    // context.fillRect(0, 0, canvasSize.w, canvasSize.h);

    canvg(canvasDom, h);



    setTimeout(function() {
      var imgsrc = canvasDom.toDataURL("image/png");
      // console.log(imgsrc);

      // var img = 'svg image <img width="' + canvasSize.w + '" height="' + canvasSize.h + '" src="' + imgsrc + '"/>';
      // $("#svgdataurl").html(img);
      var a = document.createElement("a");
      a.download = imageName + ".png";
      a.href = getBlobUrl(imgsrc);
      $("#svgdataurl").append(a);
      a.click();

      $svgDiv.remove();
      $c.remove();

    }, 500);



    return;

    // var image = new Image();
    // image.src = imgsrc;
    // image.onload = function() {
    //   setTimeout(function() {

    //     context.fillStyle = 'white';
    //     // context.fillRect(0, 0, image.width, image.height);
    //     context.fillRect(0, 0, canvasSize.w, canvasSize.h);
    //     context.drawImage(image, 0, 0);

    //     var canvasdata = canvas.toDataURL("image/png");
    //     var pngimg = 'png<img src="' + canvasdata + '">';
    //     d3.select("#svgdataurl").html(pngimg);

    //     var a = document.createElement("a");
    //     a.download = imageName + ".png";
    //     a.href = getBlobUrl(canvasdata);
    //     a.click();

    //     // $svgDiv.remove();
    //     // $c.remove();
    //   }, 250);
    // };

  };


}(GeoP));