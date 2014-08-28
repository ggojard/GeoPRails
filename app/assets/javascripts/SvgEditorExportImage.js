/*global GeoP:true, canvg:true, jQuery:true*/
(function(geoP, canvg, $) {
  'use strict';

  var SvgEditor = geoP.SvgEditor;

  function getBlobUrl(canvasdata) {
    /*global atob:true,ArrayBuffer:true,Uint8Array:true, Blob:true, self:true, DataView:true */
    var byteString, ab, ia, dataView, blob, DOMURL, newurl, i;
    byteString = atob(canvasdata.replace(/^data:image\/(png|jpg);base64,/, ''));
    //wtf is atob?? https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
    ab = new ArrayBuffer(byteString.length);
    ia = new Uint8Array(ab);
    for (i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.charCodeAt(i);
    }
    dataView = new DataView(ab);
    blob = new Blob([dataView], {
      type: 'image/png'
    });
    DOMURL = self.URL || self.webkitURL || self;
    newurl = DOMURL.createObjectURL(blob);
    return newurl;
  }

  SvgEditor.prototype.exportToImage = function() {
    var svgContainerId = this.svgId,
      editor = this,
      imageName, savedCamera, saveScale, html, $svg, h, $c, canvasDom;
    imageName = this.getFloorFullName();

    savedCamera = {
      scale: editor.camera.scale,
      x: editor.camera.x,
      y: editor.camera.y
    };

    editor.camera = geoP.DefaultCamera;

    saveScale = 1;
    editor.camera.scale = saveScale;

    editor.applyTransform();

    $svg = $('#' + svgContainerId);
    $svg.attr('width', editor.bgBox.w);
    $svg.attr('height', editor.bgBox.h);
    html = $svg[0].outerHTML;

    editor.camera = savedCamera;
    editor.applyTransform();

    h = html.replace(/²/g, '&#178;');
    $c = $('<canvas id="exportCanvas"></canvas>');

    canvasDom = $c[0];
    canvg(canvasDom, h);

    setTimeout(function() {
      var imgsrc, a;
      imgsrc = canvasDom.toDataURL('image/png');
      a = document.createElement('a');
      a.download = imageName + '.png';
      a.href = getBlobUrl(imgsrc);
      $('#svgdataurl').append(a);
      a.click();
      $c.remove();
    }, 500);
  };
}(GeoP, canvg, jQuery));
