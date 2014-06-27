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

  SvgEditor.prototype.exportToImage = function(svgContainerId) {
    var editor = this;
    var imageName = this.getFloorFullName();
    var $svgDiv = $('<div id="svgdataurl" style="display:none"></div>');

    var savedCamera = {
      scale: editor.camera.scale,
      x: editor.camera.x,
      y: editor.camera.y
    };


    editor.camera = geoP.DefaultCamera;

    editor.applyTransform();

    var html = d3.select("#" + svgContainerId)
      .attr("version", 1.1)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr('width', editor.bgBox.w)
      .attr('height', editor.bgBox.h)
      .node().outerHTML;

    editor.camera = savedCamera;
    editor.applyTransform();
    // editor.camera.scale = 2;
    // editor.camera.x = 0;
    // editor.camera.y = 0;
    // editor.applyTransform();

    // var $svgClone = $(html);


    var h = html.replace(/²/g, '&#178;');

    var $c = $('<canvas style="display:none"></canvas>');
    $('body').append($svgDiv).append($c);
    var canvas = $c[0];
    var context = canvas.getContext("2d");

    canvas.style.cssText += 'width:' + editor.bgBox.w + 'px' + ';height:' + editor.bgBox.h + 'px';
    context.canvas.width = editor.bgBox.w;
    context.canvas.height = editor.bgBox.h;

    var imgsrc = 'data:image/svg+xml;base64,' + btoa(h);
    var img = 'svg image <img width="' + editor.bgBox.w + '" height="' + editor.bgBox.h + '" src="' + imgsrc + '"/>';
    d3.select("#svgdataurl").html(img);

    var image = new Image();
    image.src = imgsrc;
    context.drawImage(image, 0, 0);
    image.onload = function() {
      context.fillStyle = 'white';
      context.fillRect(0, 0, image.width, image.height);
      context.drawImage(image, 0, 0);

      var canvasdata = canvas.toDataURL("image/png");
      var pngimg = 'png<img src="' + canvasdata + '">';
      d3.select("#svgdataurl").html(pngimg);

      var a = document.createElement("a");
      a.download = imageName + ".png";
      a.href = getBlobUrl(canvasdata);
      a.click();

      $svgDiv.remove();
      $c.remove();

    };

  };


}(GeoP));