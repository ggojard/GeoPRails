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
    t.attr('text', words.join(' '));
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
    var t, texts, words, tempText, i, test;
    t = canvas.text(0, 0, '');
    t.node.style.cssText = fontStyle;
    texts = [];
    words = content.split(' ');
    tempText = [words[0]];
    for (i = 1; i < words.length; i += 1) {
      test = tempText.concat(words[i]);
      t.attr('text', test.join(' '));
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

  function setCartouche(editor, legendWidth) {
    var leftMarginSpace = editor.bgBox.w + 10,
     lineSpacing = 16, lineSpacing2 = 12,
     txt = [], y, i, text;

    txt.push({'text': geoP.format('{0}: {1} m²', gon.i18n.information.total_area, editor.$scope.information[editor.json.building_id].totalArea), 'lineSpacing': lineSpacing2});
    txt.push({'text': geoP.format('{0}: {1}', gon.i18n.information.number_of_people, editor.$scope.information[editor.json.building_id].numberOfPeople), 'lineSpacing': lineSpacing2});
    txt.push({'text': geoP.format('{0}: {1}', gon.i18n.information.number_of_freedesks, editor.$scope.information[editor.json.building_id].numberOfFreeDesk), 'lineSpacing': lineSpacing2});
    txt.push({'text': geoP.format('{0}: {1}', gon.i18n.information.number_of_rooms, editor.json.rooms.length), 'lineSpacing': lineSpacing2});
    txt.push({'text': editor.json.name, 'lineSpacing': lineSpacing});
    txt.push({'text': editor.json.building.name, 'lineSpacing': lineSpacing});

    for (i = txt.length-1; i >= 0; i -= 1) {
      y = editor.bgBox.h - 20 - (txt[i].lineSpacing + 2) * i;
      text = editor.canvas.text(leftMarginSpace, y, txt[i].text);
      text.node.style.cssText = 'font-size: ' + txt[i].lineSpacing + 'px; font-family: arial; dominant-baseline: text-before-edge;';
      text.addClass('cartouche');
    }
  }


  SvgEditor.prototype.setCartouche = function() {
    setCartouche(this, legendWidth);
  }

  SvgEditor.prototype.setLegend = function() {
    var filters, filtersStatus,
      editor = this,
      line = 0,
      bg, svgElements = [],
      fontSize = 16,
      heightOfLine = fontSize;

    if (editor.paper === null) {
      return;
    }

    function setfilter(text, fKey, fstatus) {
      text.node.onclick = function() {
        editor.$rootScope.f[editor.json.building_id][fKey].clickOnFilter(fstatus);
      };
    }

    editor.removeLegend();
    filters = editor.mapFilter.bfilters[editor.json.building_id][editor.json.id];
    filtersStatus = editor.mapFilter.bfilters[editor.json.building_id].belongsToItems;
    Object.keys(filters).forEach(function(fKey) {
      Object.keys(filters[fKey]).forEach(function(fId) {
        var text, fstatus, fontStyle, texts, boxHeight, i, content, y;
        fstatus = filtersStatus[fKey][fId];
        if (fstatus.state === true) {
          fontStyle = 'font-size:' + fontSize + 'px;font-family:arial;fill:black;dominant-baseline:text-before-edge;text-anchor:middle';
          texts = textWrap(editor.canvas, fontStyle, legendWidth, fstatus.name);
          boxHeight = heightOfLine + texts.length * fontSize;
          bg = editor.canvas.rect(editor.bgBox.w, line, legendWidth, boxHeight);
          svgElements.push(bg);
          bg.attr({
            'fill': fstatus.colorOpacity,
            'stroke': 'white'
          });
          bg.addClass('map-legend');

          for (i = 0; i < texts.length; i += 1) {
            content = texts[i];
            y = line + i * fontSize + heightOfLine / 2;
            text = editor.canvas.text(editor.bgBox.w + legendWidth / 2, y, content);
            text.node.style.cssText = fontStyle;
            text.addClass('map-legend');
            text.attr({
              'fill': 'black'
            });
            setfilter(text, fKey, fstatus);

            svgElements.push(text);
          }
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
    canvg(canvasDom, h, {
      renderCallback: function() {
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
      }
    });
  };
}(GeoP, canvg, jQuery));
