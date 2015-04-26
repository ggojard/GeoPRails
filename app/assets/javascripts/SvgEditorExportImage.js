/*global GeoP:true, canvg:true, jQuery:true*/
(function(geoP, canvg, $) {
  'use strict';

  var SvgEditor = geoP.SvgEditor,
    legendWidth = 300;

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

  function addToWrap(texts, words, t, maxWidth) {
    t.attr("text", words.join(' '));
    if (t.getBBox().width > maxWidth) {
      var text = words.join(' ');
      texts.push(text.substring(0, text.length / 2));
      texts.push(text.substring(text.length / 2));
    } else {
      texts.push(words.join(' '));
    }
    return texts;
  }

  function textWrap(canvas, fontStyle, maxWidth, content) {
    var t = canvas.text(0, 0, "");
    t.node.style.cssText = fontStyle;
    var texts = [];
    var words = content.split(" ");
    var tempText = [words[0]];
    for (var i = 1; i < words.length; i += 1) {
      var test = tempText.concat(words[i]);
      t.attr("text", test.join(' '));
      if (t.getBBox().width > maxWidth) {
        texts = addToWrap(texts, tempText, t, maxWidth);
        tempText = [words[i]];
      } else {
        tempText.push(words[i]);
      }
    }
    texts = addToWrap(texts, tempText, t, maxWidth);
    t.remove();
    return texts;
  }

  SvgEditor.prototype.setLegend = function() {
    var filters, filtersStatus,
      editor = this,
      line = 0,
      bg, svgElements = [],
      fontSize = 16,
      heightOfLine = fontSize;

      if (editor.paper === null){
        return;
      }

    editor.removeLegend();
    filters = editor.mapFilter.bfilters[editor.json.building_id][editor.json.id];
    filtersStatus = editor.mapFilter.bfilters[editor.json.building_id].belongsToItems;
    Object.keys(filters).map(function(fKey) {
      Object.keys(filters[fKey]).map(function(fId) {
        var text, fstatus;
        fstatus = filtersStatus[fKey][fId];
        if (fstatus.state === true) {
          var fontStyle = 'font-size:' + fontSize + 'px;font-family:arial;fill:black;alignment-baseline:before-edge;text-anchor:middle';
          var texts = textWrap(editor.canvas, fontStyle, legendWidth, fstatus.name);
          var boxHeight = heightOfLine + texts.length * fontSize;
          bg = editor.canvas.rect(editor.bgBox.w, line, legendWidth, boxHeight);
          svgElements.push(bg);
          bg.attr({
            'fill': fstatus.color,
            'stroke': 'white'
          });
          bg.addClass('map-legend');

          for (var i = 0; i < texts.length; i++) {
            var content = texts[i];
            var y = line + i * fontSize + heightOfLine / 2;
            text = editor.canvas.text(editor.bgBox.w + legendWidth / 2, y, content);
            text.node.style.cssText = fontStyle;
            text.addClass('map-legend');
            text.attr({
              'fill': 'black'
            });
            svgElements.push(text);
          };
          line += heightOfLine + texts.length * fontSize;
        }
      });
    });
    this.svgElements = svgElements;
  };

  SvgEditor.prototype.removeLegend = function() {
    if (this.svgElements !== undefined) {
      this.svgElements.forEach(function(e) {
        e.remove();
      });
    }
  };

  SvgEditor.prototype.exportToImage = function() {
    var svgContainerId = this.svgId,
      editor = this,
      bg,
      svgElements = [],
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
    editor.setLegend();

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
    }, 500);
  };
}(GeoP, canvg, jQuery));
