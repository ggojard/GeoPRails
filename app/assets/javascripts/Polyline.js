/*global GeoP:true, jQuery:true */

(function(geoP, $) {
  'use strict';

  var charHeight = 14,
    Polyline;

  Polyline = function(svgEditor) {
    geoP.extend(geoP.Shape, this, svgEditor);
    this.moveCircles = [];
    this.pointIndex = 0;
    // this.isSelected = false;
    this.hoverLines = [];
    this.json = null;
    this.displayTexts = {};
    this.dragMode = false;
    this.dragTextMode = false;
    this.optionsOnMap = [];
  };

  Polyline.prototype.createSvgPoint = function(x, y) {
    var point = this.svgEditor.paper.node.createSVGPoint();
    point.x = x;
    point.y = y;
    return point;
  };

  function normalize(point) {
    if (Array.isArray(point)) {
      return {
        x: point[0],
        y: point[1]
      };
    }
    return point;
  }

  function polygonArea(points) {
    var l = points.length,
      det = 0,
      i = 0;

    points = points.map(normalize);
    points = points.concat(points[0]);

    for (i = 0; i < l; i += 1) {
      det += points[i].x * points[i + 1].y - points[i].y * points[i + 1].x;
    }
    return Math.abs(det) / 2;
  }


  Polyline.prototype.updateArea = function() {
    var area = this.getArea();
    this.json.area = area;
  };

  Polyline.prototype.updatePerimeter = function() {
    var perimeter = this.getPerimeter();
    this.json.perimeter = perimeter;
  };


  function lineDistance(point1, point2) {
    var xs = 0,
      ys = 0;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
  }

  Polyline.prototype.getPerimeter = function() {
    var i, p1, p2, sumDistance = 0,
      d, scaleLen, scaleDim;
    scaleLen = this.svgEditor.mapScale.length;
    scaleDim = this.svgEditor.mapScale.getLength();

    for (i = 0; i < this.element.node.points.numberOfItems - 1; i += 1) {
      p1 = this.element.node.points.getItem(i);
      if (i === 0) {
        p2 = this.element.node.points.getItem(this.element.node.points.numberOfItems - 1);
        d = lineDistance(p1, p2) * scaleLen / scaleDim;
        sumDistance += d;
      }
      p2 = this.element.node.points.getItem(i + 1);

      d = lineDistance(p1, p2) * scaleLen / scaleDim;
      sumDistance += d;
    }
    return parseFloat(parseFloat(sumDistance, 10).toFixed(1), 10);
  };


  Polyline.prototype.getArea = function() {
    var points = [],
      i = 0,
      scaleLen, scaleDim, p, a, l;

    scaleLen = this.svgEditor.mapScale.length;
    scaleDim = this.svgEditor.mapScale.getLength();


    if (this.element === undefined || this.element.node === undefined) {
      return 0;
    }

    for (i = 0; i < this.element.node.points.numberOfItems; i += 1) {
      p = this.element.node.points.getItem(i);
      a = {
        x: p.x,
        y: p.y
      };
      a.x = a.x * scaleLen / scaleDim;
      a.y = a.y * scaleLen / scaleDim;
      points.push(a);
    }

    l = polygonArea(points);
    // reparse to handle toFixed to float
    l = parseFloat(parseFloat(l, 10).toFixed(2), 10);
    return l;
  };

  Polyline.prototype.create = function(x, y) {
    var point = this.createSvgPoint(x, y);
    this.element = this.svgEditor.canvas.polygon(point.x, point.y);
    this.element.attr({
      fill: 'transparent',
      stroke: GeoP.Colors.Drawing
    });
    this.group = this.svgEditor.canvas.group(this.element);
    if (this.json !== null) {
      this.group.attr({
        'id': 'f-' + this.svgEditor.json.id + '-g-' + this.json.id
      });
    }
    this.addAndGetMovePoint(x, y, this.pointIndex);
  };

  Polyline.prototype.updateTextPosition = function() {
    var bbox = this.getBBox(this.element.node),
      textBbox, lines, x, y;
    lines = this.text.selectAll('tspan');

    x = bbox.x + bbox.width / 2;
    lines.forEach(function(l) {
      var options = {
        x: x,
        style: 'text-anchor: middle'
      };
      options.dy = charHeight;
      l.attr(options);
    });
    textBbox = this.text.getBBox();
    y = bbox.y + bbox.height / 2 - textBbox.height / 2;
    this.text.attr({
      x: x,
      y: y
    });

    if (this.json !== null && this.json.anchor_text_point !== null) {
      if (this.json.anchor_text_point !== '') {
        this.text.node.setAttribute('transform', this.json.anchor_text_point);
      }
    }

  };



  Polyline.prototype.releaseDragPoints = function() {
    this.svgEditor.cleanDragPointOptions();
    this.setMovePointsToVisibility('visible');
  };

  function initMoveCirclesPointsIndex(polyline) {
    var i = 0;
    for (i = 0; i < polyline.moveCircles.length; i += 1) {
      polyline.moveCircles[i].pointIndex = i;
    }
  }


  Polyline.prototype.removeDragPoint = function(dragPoint) {
    var that = this,
      dragPointIndex;
    dragPointIndex = this.moveCircles.indexOf(dragPoint);
    dragPoint.remove();
    this.moveCircles.splice(dragPointIndex, 1);

    initMoveCirclesPointsIndex(this);
    that.element.node.points.removeItem(dragPoint.pointIndex);
    this.save();
  };

  Polyline.prototype.addAndGetMovePoint = function(x, y, pointIndex) {
    var that = this,
      movePointCircle, pointName, deleteLabel;
    movePointCircle = this.svgEditor.canvas.circle(x, y, 5);
    movePointCircle.attr({
      stroke: 'red',
      fill: 'transparent',
      visibility: 'hidden'
    });
    pointName = parseInt(x, 10) + '-' + parseInt(y, 10);
    movePointCircle.pointName = pointName;
    movePointCircle.pointIndex = pointIndex;

    this.group.add(movePointCircle);
    this.moveCircles.splice(pointIndex, 0, movePointCircle);

    movePointCircle.click(function(e) {
      geoP.currentEvent = e;
      that.releaseDragPoints();
      movePointCircle.attr({
        stroke: 'green'
      });

      deleteLabel = 'Supprimer le sommet (' + movePointCircle.pointName + ')';
      that.svgEditor.dragPointsOptions = [{
        label: deleteLabel,
        classes: 'btn-danger',
        icon: 'fa-trash-o',
        action: function() {
          that.svgEditor.$rootScope.$emit('RightPopupShow', deleteLabel, '', [{
            'label': 'Confirmer',
            classes: 'btn-success',
            icon: 'fa-trash-o',
            action: function(callback) {
              that.removeDragPoint(movePointCircle);
              that.releaseDragPoints();
              return callback({
                'status': 'OK'
              });
            }
          }]);
        }
      }];

      that.svgEditor.$scope.$apply();
    });

    movePointCircle.drag(function(cx, cy, x, y, e) {
      /*jslint unparam: true*/

      var scale, mousePos, mx, my, ctm, p;
      scale = that.svgEditor.camera.scale;
      mousePos = that.svgEditor.getMousePos(e);
      mx = (mousePos.x / scale) - movePointCircle.node.cx.baseVal.value;
      my = (mousePos.y / scale) - movePointCircle.node.cy.baseVal.value;

      ctm = that.group.node.getCTM();
      mx -= ctm.e / scale;
      my -= ctm.f / scale;

      movePointCircle.node.cx.baseVal.value += mx;
      movePointCircle.node.cy.baseVal.value += my;
      p = that.element.node.points.getItem(movePointCircle.pointIndex);
      p.x += mx;
      p.y += my;

      that.updateArea();
      that.updatePerimeter();
      that.updateTextPosition();
    });

    movePointCircle.hover(function() {
      if (that.dragMode === true) {
        that.group.undrag();
      }
    }, function() {
      if (that.dragMode === true) {
        that.group.drag();
      }
    });
    this.pointIndex += 1;

    return movePointCircle;
  };

  Polyline.prototype.getLastPoint = function() {
    var l = this.element.node.points.numberOfItems;
    if (l > 0) {
      return this.element.node.points.getItem(l - 1);
    }
    return null;
  };

  Polyline.prototype.removeFromDatabase = function(callback) {
    this.svgEditor.$http.get('/rooms/' + this.json.id + '/delete').success(callback).error(function() {
      return callback({
        'status': 'KO'
      });
    });
  };

  Polyline.prototype.removeDisplayTexts = function() {
    var i;
    if (this.texts !== undefined) {
      for (i = 0; i < this.texts.length; i += 1) {
        if (this.texts[i] !== undefined) {
          this.texts[i].remove();
        }
      }
    }
  };

  Polyline.prototype.remove = function() {
    var i = 0,
      c;

    this.svgEditor.removePolyline(this);
    for (i = 0; i < this.moveCircles.length; i += 1) {
      c = this.moveCircles[i];
      c.remove();
    }
    this.removeDisplayTexts();
    this.element.remove();


  };

  Polyline.prototype.appendPoint = function(x, y) {
    var point = this.createSvgPoint(x, y);
    this.element.node.points.appendItem(point);
    this.addAndGetMovePoint(x, y, this.pointIndex);
  };

  Polyline.prototype.putInTextArray = function(tokens, maxLineLength, merge) {
    var texts = [],
      i, token, line = [],
      separator = ', ',
      lineString, t;
    if (tokens.length === 1) {
      return tokens;
    }
    if (merge === false) {
      return tokens;
    }
    for (i = 0; i < tokens.length; i += 1) {
      token = tokens[i];
      line.push(token);
      lineString = line.join(separator);

      t = this.svgEditor.canvas.text(0, 0, lineString);
      if (t.getBBox().width > maxLineLength) {
        if (line.length > 1) {
          line.pop();
          i -= 1;
          lineString = line.join(separator);
        }
        texts.push(lineString);
        line = [];
      }
      t.remove();
    }
    texts.push(line.join(separator));
    return texts;
  };


  Polyline.prototype.setTexts = function() {
    var displayNames, id, displayText, text, i, texts, bbox, value;
    if (this.element === undefined) {
      console.error('this shape don\'t get any elements (maybe missing points)', this.json);
      return;
    }
    bbox = this.getBBox(this.element.node);
    displayNames = this.svgEditor.displayProperties;
    if (displayNames === undefined) {
      return console.error('displayProperties is undefined');
    }
    this.texts = [];
    texts = [];
    for (i = 0; i < displayNames.length; i += 1) {
      displayText = displayNames[i];
      id = displayText.name;
      text = this.json[id];
      if (displayText.value === true && text !== null) {
        value = this.putInTextArray(displayText.format(text), bbox.width, displayText.merge);
        if (value.join('').length > 0) {
          texts = texts.concat(value);
        }
      }
    }


    this.text = this.svgEditor.canvas.text(0, 0, texts);
    this.texts.push(this.text);
    this.text.node.style.cssText = 'pointer-events: auto;font-size:12px;font-family:arial;fill:black;text-anchor: middle';
    this.group.add(this.text);
    this.checkAndSetDragModeTextEventsAndClass();

    this.updateTextPosition();

    this.text.click(this.select.bind(this));
  };


  Polyline.prototype.fillWithColorDependingOnState = function(color, state) {
    if (state === true) {
      this.element.attr({
        fill: color
      });
    } else {
      this.element.attr({
        fill: 'transparent'
      });
    }

  };

  Polyline.prototype.fillFromFilterColor = function(filterName) {
    var value, item;
    if (this.json[filterName] !== null) {
      value = this.json[filterName];
      if (value !== undefined) {
        item = this.svgEditor.mapFilter.bfilters[this.svgEditor.json.building_id].belongsToItems[filterName][value.id];
        this.fillWithColorDependingOnState(item.color, item.state);
      }
    }
  };

  Polyline.prototype.doActionIfItemIsSelected = function() {
    if (this.svgEditor.$scope.roomId && this.svgEditor.$scope.roomId === this.json.id) {
      this.group.node.setAttribute('class', 'select');
      this.svgEditor.setCurrentRoom(this);
    }
  };

  Polyline.prototype.createInPaper = function() {
    var points, i, p;
    if (this.svgEditor.paper !== null) {
      if (this.json.points !== null) {
        points = JSON.parse(this.json.points);
        for (i = 0; i < points.length; i += 1) {
          p = points[i];
          if (i === 0) {
            this.create(p.x, p.y);
          } else {
            this.appendPoint(p.x, p.y);
          }
        }
        if (points.length === 0) {
          return;
        }
      }
      this.close();
      this.setTexts();
      this.updateHashCode();
    }
  };

  Polyline.prototype.setMovePointsToVisibility = function(visibility) {
    var that = this,
      i, movePointCircle;
    for (i = 0; i < that.moveCircles.length; i += 1) {
      movePointCircle = that.moveCircles[i];
      movePointCircle.attr({
        visibility: visibility,
        stroke: 'red'
      });
    }
  };


  Polyline.prototype.getBBox = function(node) {
    var b;
    try {
      b = node.getBBox();
    } catch (e) {
      b = this.svgEditor.paper.node.createSVGRect();
    }
    return b;
  };

  Polyline.prototype.updateHashCode = function() {
    this.hashCode = this.getHash();
  };

  Polyline.prototype.getHash = function() {
    /*jslint nomen: true*/
    var bbox, h, that = this;
    if (this.group !== undefined) {
      bbox = this.moveCircles.map(function(m) {
        return that.getBBox(m.node);
      });
      h = [bbox];
      if (this.json !== null) {
        h.push(this.json.area);
        h.push(this.json.perimeter);
      }
      h.push(this.getTextTransform());
      h.push(JSON.stringify(this.group._.transform));
      return geoP.hashCode(h.join(''));
    }
    return 0;
  };

  Polyline.prototype.getPointsData = function() {
    var points = [],
      camera, ctm, scale, x, y, i, p;
    if (this.group === undefined) {
      return points;
    }

    camera = this.svgEditor.camera;
    ctm = this.group.node.getCTM();
    scale = camera.scale;
    x = ctm.e / scale;
    y = ctm.f / scale;
    for (i = 0; i < this.element.node.points.numberOfItems; i += 1) {
      p = this.element.node.points.getItem(i);
      points.push({
        x: p.x + x - camera.x / scale,
        y: p.y + y - camera.y / scale
      });
    }
    return JSON.stringify(points);
  };


  Polyline.prototype.getTextTransform = function() {
    var textTransform = null;
    if (this.text !== undefined) {
      textTransform = this.text.node.getAttribute('transform');
    }
    return textTransform;
  };

  Polyline.prototype.save = function(callback) {
    var data, that = this;

    if (this.json === null) {
      data = {
        'points': this.getPointsData(),
        'area': this.getArea(),
        'perimeter': this.getPerimeter(),
        'floor_id': this.svgEditor.json.id,
        'name': 'B?',
        'anchor_text_point': this.getTextTransform()
      };
      this.svgEditor.$http.post('/rooms.json', data).success(function(d) {
        geoP.notifications.done('La nouvelle pièce a été crée.');
        that.json = d;
        that.setTexts();
        that.updateHashCode();
        return callback && callback();
      }).error(function() {
        console.error('impossible to create new');
      });
      return null;
    }
    data = {
      'id': this.json.id,
      'room': {
        'points': this.getPointsData(),
        'area': this.getArea(),
        'perimeter': this.getPerimeter(),
        'anchor_text_point': this.getTextTransform()
      }
    };
    this.svgEditor.$http.put('/rooms/' + this.json.id + '.json', data).success(function() {
      geoP.notifications.done('La pièce ' + that.json.name + ' a été sauvegardée.');
      that.updateHashCode();
      return callback && callback();
    }).error(function() {
      console.error('impossible to update');
    });
  };

  Polyline.prototype.resetActions = function() {
    this.dragMode = false;
    this.dragTextMode = false;
    this.text.node.setAttribute('class', null);
    if (this.group !== undefined) {
      this.group.undrag();
    }
    if (this.text !== undefined) {
      this.text.undrag();
    }
  };

  Polyline.prototype.unSelect = function() {
    this.setMovePointsToVisibility('hidden');
    var currentHash = this.getHash();
    if (this.hashCode !== currentHash) {
      this.save();
    }
    if (this.group !== undefined) {
      this.group.node.setAttribute('class', 'unselected');
    }
  };

  Polyline.prototype.zoomOnItem = function() {
    var box, spaceAround = 50;
    box = this.group.getBBox();
    box.width += spaceAround;
    box.height += spaceAround;
    box.w += spaceAround;
    box.h += spaceAround;
    box.x -= spaceAround / 2;
    box.y -= spaceAround / 2;
    this.svgEditor.centerOnBox(box);
  };

  Polyline.prototype.addZoomOnItemOption = function() {
    var that = this;
    this.optionsOnMap.push({
      label: 'Zoomer',
      classes: 'btn-info',
      icon: 'fa-search',
      action: function() {
        that.zoomOnItem();
      }
    });
  };



  Polyline.prototype.addMoveTextOption = function(e) {
    var that = this,
      mode, enableMode, disableMode, centerBackText;

    enableMode = {
      id: 'drag-mode',
      label: 'Activer le déplacement du texte',
      classes: 'btn-default',
      icon: ' fa-arrows',
      action: function() {
        that.dragTextMode = true;
        var i = that.optionsOnMap.indexOf(enableMode);
        that.optionsOnMap[i] = disableMode;
        that.select();

      }
    };
    disableMode = {
      id: 'drag-mode',
      label: 'Désactiver le déplacement du texte',
      classes: 'btn-danger',
      icon: ' fa-stop',
      action: function() {
        that.dragTextMode = false;
        var i = that.optionsOnMap.indexOf(disableMode);
        that.optionsOnMap[i] = enableMode;
        that.select();
      }
    };

    if (this.dragTextMode === false) {
      mode = enableMode;
    } else {
      mode = disableMode;
    }

    that.optionsOnMap.push(mode);


    if (this.text !== undefined) {
      if (this.text.node.hasAttribute('transform') && this.text.node.getAttribute('transform') !== '') {
        centerBackText = {
          id: 'center-text',
          label: 'Recentrer le texte',
          classes: 'btn-danger',
          icon: ' fa-crosshairs',
          action: function() {
            that.text.node.setAttribute('transform', '');
            that.select(e);
            // that.updateTextPosition();
            // that.save(function(){
            //   that.select();
            // });
          }
        };
        that.optionsOnMap.push(centerBackText);
      }
    }

  };

  Polyline.prototype.addMovePolylineOption = function() {
    var that = this,
      mode, enableMode, disableMode;

    enableMode = {
      id: 'drag-mode',
      label: 'Activer le déplacement du polygone',
      classes: 'btn-default',
      icon: ' fa-arrows',
      action: function() {
        that.dragMode = true;
        var i = that.optionsOnMap.indexOf(enableMode);
        that.optionsOnMap[i] = disableMode;
        that.select();
      }
    };
    disableMode = {
      id: 'drag-mode',
      label: 'Désactiver le déplacement du polygone',
      classes: 'btn-danger',
      icon: ' fa-stop',
      action: function() {
        that.dragMode = false;
        var i = that.optionsOnMap.indexOf(disableMode);
        that.optionsOnMap[i] = enableMode;
        that.select();
      }
    };

    if (this.dragMode === false) {
      mode = enableMode;
    } else {
      mode = disableMode;
    }

    that.optionsOnMap.push(mode);

  };

  Polyline.prototype.addCreateDragPointModeOnItemOption = function() {
    var that = this;
    this.optionsOnMap.push({
      label: 'Créer un sommet',
      classes: 'btn-success',
      icon: 'fa-pencil',
      action: function() {
        that.createHoverLines();
      }
    });
  };


  Polyline.prototype.clearOptionsOnMap = function() {
    this.optionsOnMap = [];
  };

  Polyline.prototype.addDeleteOption = function() {
    var deleteLabel, option, that = this;
    deleteLabel = 'Supprimer ' + that.json.name;
    option = {
      label: deleteLabel,
      classes: 'btn-danger',
      icon: 'fa-trash-o',
      action: function() {
        that.svgEditor.$rootScope.$emit('RightPopupShow', deleteLabel, '', [{
          'label': 'Confirmer',
          classes: 'btn-success',
          icon: 'fa-trash-o',
          action: function(callback) {
            that.removeFromDatabase(function(res) {
              if (res.status === 'OK') {
                that.remove();
                that.clearOptionsOnMap();
                geoP.notifications.done('La pièce a été supprimé.');
                return callback(res);
              }
              geoP.notifications.error('Impossible de supprimer la pièce ' + that.json.name);
            });
          }
        }]);
      }
    };
    that.optionsOnMap.push(option);

  };


  Polyline.prototype.addEditPolylineOption = function() {
    var that = this;
    if (this.svgEditor.$rootScope.userType === 'READ') {
      return null;
    }
    this.optionsOnMap.push({
      label: 'Modifier',
      classes: 'btn-default',
      icon: 'fa-edit',
      action: function() {
        document.location.href = '/admin/rooms/' + that.json.id + '/edit';
      }
    });
  };

  Polyline.prototype.selectPolyline = function() {
    var that = this,
      link;
    this.optionsOnMap = [];
    that.svgEditor.$scope.room = that;
    geoP.$apply(that.svgEditor.$scope);
    that.svgEditor.$scope.roomId = that.json.id;
    that.addEditPolylineOption();
    that.addZoomOnItemOption();
    that.doActionIfItemIsSelected();
    this.group.node.setAttribute('class', 'select');
    $('.panel-room').animate({
      'scrollTop': 0
    }, 250);
    link = '#' + that.json.id;
    document.location.hash = link;
  };

  Polyline.prototype.checkAndSetDragModeTextEventsAndClass = function() {
    if (this.dragTextMode === true) {
      this.text.drag();
      this.group.node.setAttribute('class', this.group.node.className.baseVal + ' moveText');
      this.text.node.setAttribute('class', 'move');
    } else {
      this.text.undrag();
      if (this.svgEditor.$scope.mapMode !== 'show') {
        this.text.node.setAttribute('class', 'hidden');
      }
    }
  };

  Polyline.prototype.select = function(e) {
    var that = this,
      $scope = this.svgEditor.$scope;
    geoP.currentEvent = e;

    that.svgEditor.cleanDragPointOptions();
    that.svgEditor.unSelectItems();
    this.selectPolyline();

    if (this.dragMode === true) {
      this.group.undrag();
    }
    switch ($scope.mapMode) {
      case 'normal':
      case 'edit':
        if (this.dragMode === true) {
          this.group.drag();
          this.group.node.setAttribute('class', this.group.node.className.baseVal + ' move');
        } else {
          this.group.undrag();
        }
        this.checkAndSetDragModeTextEventsAndClass();
        that.setMovePointsToVisibility('visible');
        that.addDeleteOption();
        that.addCreateDragPointModeOnItemOption();
        that.addMovePolylineOption();
        that.addMoveTextOption(e);
        break;
    }
  };

  Polyline.prototype.close = function() {
    this.updateHashCode();
    this.unSelect();
    if (this.element !== undefined) {
      this.element.click(this.select.bind(this));
    }
  };

  function removeHoverLines(polyline) {
    var i = 0,
      linesCount = polyline.hoverLines.length;
    for (i = 0; i < linesCount; i += 1) {
      polyline.hoverLines[i].remove();
    }
    polyline.hoverLines = [];
  }

  function createHoverLine(polyline, sourceIndex, targetIndex) {
    var mp, mpn, line, $b;
    mp = polyline.element.node.points.getItem(sourceIndex);
    mpn = polyline.element.node.points.getItem(targetIndex);

    line = polyline.svgEditor.canvas.line(mp.x, mp.y, mpn.x, mpn.y);
    line.attr({
      stroke: 'brown',
      fill: 'brown'
    });

    $b = $('body');
    line.hover(function() {
      $b.css('cursor', 'crosshair');
    }, function() {
      $b.css('cursor', 'default');
    });

    line.click(function(e) {
      var mousePos, camera, scale, pos, point;
      geoP.currentEvent = e;
      mousePos = polyline.svgEditor.getMousePos(e);
      camera = polyline.svgEditor.camera;
      scale = camera.scale;

      pos = {
        x: mousePos.x / scale - camera.x / scale,
        y: mousePos.y / scale - camera.y / scale
      };

      point = polyline.createSvgPoint(pos.x, pos.y);

      if (targetIndex === 0) {
        polyline.element.node.points.appendItem(point);
        polyline.addAndGetMovePoint(pos.x, pos.y, polyline.element.node.points.numberOfItems - 1);
      } else {
        polyline.element.node.points.insertItemBefore(point, targetIndex);
        polyline.addAndGetMovePoint(pos.x, pos.y, targetIndex);
      }

      initMoveCirclesPointsIndex(polyline);

      polyline.setMovePointsToVisibility('visible');
      polyline.updateArea();
      polyline.updatePerimeter();
      polyline.updateHashCode();

      removeHoverLines(polyline);

      polyline.save();
    });
    polyline.hoverLines.push(line);
  }

  Polyline.prototype.createHoverLines = function() {
    var i = 0;
    removeHoverLines(this);
    for (i = 0; i < this.moveCircles.length - 1; i += 1) {
      createHoverLine(this, i, i + 1);
    }
    createHoverLine(this, this.moveCircles.length - 1, 0);
  };
  geoP.Polyline = Polyline;
}(GeoP, jQuery));
