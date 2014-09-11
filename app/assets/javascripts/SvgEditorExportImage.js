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
      line = 0,
      heightOfLine = 64,
      fontSize = 24,
      legendWidth = 300,
      bg, svgElements = [],
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
    $svg.attr('width', editor.bgBox.w + legendWidth);
    $svg.attr('height', editor.bgBox.h);

    bg = editor.canvas.rect(editor.bgBox.w, 0, legendWidth, editor.bgBox.h);
    bg.attr({
      fill: 'white'
    });

    Object.keys(editor.mapFilter.filters).map(function(fKey) {
      Object.keys(editor.mapFilter.filters[fKey]).map(function(fId) {
        var filter, text;
        filter = editor.mapFilter.filters[fKey][fId];
        if (filter.state === true) {
          bg = editor.canvas.rect(editor.bgBox.w, line * heightOfLine, legendWidth, heightOfLine);
          svgElements.push(bg);
          bg.attr({
            'fill': filter.color,
            'stroke': 'white'
          });
          text = editor.canvas.text(editor.bgBox.w + legendWidth / 2, line * heightOfLine + fontSize + ((heightOfLine - fontSize) / 2), filter.name);
          text.attr({
            'fill': 'black'
          });
          text.node.style.cssText = 'font-size:' + fontSize + 'px;font-family:arial;fill:black;text-anchor:middle';
          svgElements.push(text);
          line += 1;
        }
      });
    });

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
      $svg.attr('width', editor.bgBox.w);
      $svg.attr('height', editor.bgBox.h);
      svgElements.forEach(function(e) {
        e.remove();
      });

    }, 500);
  };
}(GeoP, canvg, jQuery));
