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
      .attr('width', editor.bgBox.w)
      .attr('height', editor.bgBox.h)
      .node().outerHTML;

    editor.camera = savedCamera;
    editor.applyTransform();

    var h = html.replace(/²/g, '&#178;');
    var $c = $('<canvas id="exportCanvas"></canvas>');

    $('body').append($svgDiv).append($c);
    var canvasDom = $c[0];
    var canvas = canvasDom;
    var context = canvas.getContext("2d");

    canvg(canvasDom, h);

    setTimeout(function() {
      var imgsrc = canvasDom.toDataURL("image/png");
      var a = document.createElement("a");
      a.download = imageName + ".png";
      a.href = getBlobUrl(imgsrc);
      $("#svgdataurl").append(a);
      a.click();

      $svgDiv.remove();
      $c.remove();

    }, 500);


  };


}(GeoP));