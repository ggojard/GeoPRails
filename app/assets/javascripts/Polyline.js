/*global GeoP:true, jQuery:true */

(function(geoP, $) {
  'use strict';

  var Polyline = function(svgEditor) {
    geoP.extend(geoP.Shape, this, svgEditor);
    this.moveCircles = [];
    this.pointIndex = 0;
    // this.isSelected = false;
    this.hoverLines = [];
    this.json = null;
    this.displayTexts = {};
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
    if (this.areaText !== undefined) {
      var area = this.getArea();
      this.areaText.node.innerHTML = area + ' m²';
      this.json.area = area;
    }
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
    l = parseFloat(parseFloat(l, 10).toFixed(1), 10);
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
    this.addAndGetMovePoint(x, y, this.pointIndex);
  };

  Polyline.prototype.updateTextPosition = function(textSvg, yTranslate) {
    var bbox = this.element.node.getBBox(),
      textBbox = textSvg.node.getBBox();
    textSvg.attr({
      x: bbox.x + bbox.width / 2 - textBbox.width / 2,
      y: bbox.y + bbox.height / 2 + yTranslate * textBbox.height
    });
  };

  Polyline.prototype.addText = function(text, yTranslate) {
    var t = this.svgEditor.canvas.text(0, 0, text);
    t.attr({
      fill: 'black'
    });
    t.node.style.cssText = 'font-size:12px;font-family:arial';
    this.updateTextPosition(t, yTranslate);
    this.group.add(t);
    return t;
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
      that.updateTextPosition(that.text, 0);
      that.updateTextPosition(that.areaText, 1);
    });

    movePointCircle.hover(function() {
      that.group.undrag();
    }, function() {
      that.group.drag();
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
    var i, texts;
    texts = Object.keys(this.texts);
    for (i = 0; i < texts.length; i += 1) {
      if (this.texts[texts[i]] !== undefined) {
        this.texts[texts[i]].remove();
      }
    }
  };

  Polyline.prototype.remove = function() {
    var i = 0,
      c;
    this.element.remove();
    for (i = 0; i < this.moveCircles.length; i += 1) {
      c = this.moveCircles[i];
      c.remove();
    }
    this.revmoveDisplayTexts();

    this.svgEditor.removePolyline(this);
  };

  Polyline.prototype.appendPoint = function(x, y) {
    var point = this.createSvgPoint(x, y);
    this.element.node.points.appendItem(point);
    this.addAndGetMovePoint(x, y, this.pointIndex);
  };


  Polyline.prototype.setTexts = function() {
    var displayNames, id, line, displayText, text;
    displayNames = this.svgEditor.displayProperties;
    this.texts = {};
    line = 0;
    for (id in displayNames) {
      if (displayNames.hasOwnProperty(id)) {
        displayText = displayNames[id];
        text = this.json[id];
        if (displayText.value === true && text !== null) {
          this.texts[id] = this.addText(displayText.format(text), line);
          line += 1;
        }
      }
    }
  };

  Polyline.prototype.fillFromFilterColor = function(filterName) {
    if (this.json[filterName] !== null) {
      var item = this.svgEditor.mapFilter.filters[filterName][this.json[filterName].id];
      if (item.state === true) {
        this.element.attr({
          fill: item.color
        });
      } else {
        this.element.attr({
          fill: 'transparent'
        });
        this.doActionIfItemIsSelected();
      }
    }
  };

  Polyline.prototype.doActionIfItemIsSelected = function() {
    if (this.svgEditor.$scope.roomJson && this.svgEditor.$scope.roomJson.id === this.json.id) {
      this.svgEditor.currentOptions = [];
      this.element.attr({
        fill: '#1dc8fe'
      });
      this.svgEditor.$scope.room = this;
      this.addZoomOnItemOption();
    }
  };


  Polyline.prototype.loadFromJson = function(json) {
    var points, i, p;
    this.json = json;

    if (this.json.points === null) {
      return;
    }

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
    this.doActionIfItemIsSelected();
    this.updateHashCode();

  };

  Polyline.prototype.registerHover = function() {
    var that = this;
    this.element.hover(function() {
      that.stroke(GeoP.Colors.Selected);
    }, function() {
      that.stroke(GeoP.Colors.NotSelected);
    });
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


  Polyline.prototype.updateHashCode = function() {
    this.hashCode = this.getHash();
  };

  Polyline.prototype.getHash = function() {
    /*jslint nomen: true*/
    var bbox, h;
    if (this.group !== undefined) {
      bbox = JSON.stringify(this.group.node.getBBox());
      h = [bbox];
      if (this.json !== null) {
        h.push(this.json.area);
      }
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

  Polyline.prototype.save = function(callback) {
    var data, that = this;
    if (this.json === null) {
      data = {
        'points': this.getPointsData(),
        'area': this.getArea(),
        'floor_id': this.svgEditor.json.id,
        'name': 'B?'
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
        'area': this.getArea()
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

  Polyline.prototype.unSelect = function() {
    this.stroke(GeoP.Colors.NotSelected);
    this.setMovePointsToVisibility('hidden');

    // if (this.isSelected === true) {
    var currentHash = this.getHash();
    if (this.hashCode !== currentHash) {
      this.save();
    }
    // }

    // this.isSelected = false;
  };

  Polyline.prototype.zoomOnItem = function() {
    var box = this.group.getBBox();
    this.svgEditor.centerOnBox(box);

  };

  Polyline.prototype.addZoomOnItemOption = function() {
    var that = this;
    this.svgEditor.currentOptions.push({
      label: 'Zoomer sur ' + that.json.name,
      classes: 'btn-info',
      icon: 'fa-search',
      action: function() {
        that.zoomOnItem();
      }
    });
  };

  Polyline.prototype.addCreateDragPointModeOnItemOption = function() {
    var that = this;
    this.svgEditor.currentOptions.push({
      label: 'Créer un sommet',
      classes: 'btn-success',
      icon: 'fa-pencil',
      action: function() {
        that.createHoverLines();
      }
    });
  };


  Polyline.prototype.select = function(e) {
    var that = this,
      $scope = this.svgEditor.$scope,
      deleteLabel;
    // that.isSelected = true;
    that.svgEditor.cleanDragPointOptions();

    switch ($scope.mapMode) {
      case 'normal':
      case 'edit':
        $scope.room = that;

        that.svgEditor.unSelectItems();
        that.setMovePointsToVisibility('visible');
        that.stroke(GeoP.Colors.Selected);
        geoP.currentEvent = e;
        $scope.mapMode = 'edit';

        deleteLabel = 'Supprimer ' + that.json.name;
        that.svgEditor.currentOptions = [{
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
                    that.svgEditor.cleanCurrentOptions();
                    geoP.notifications.done('La pièce a été supprimé.');
                    return callback(res);
                  }
                  geoP.notifications.error('Impossible de supprimer la pièce ' + that.json.name);
                });
              }
            }]);

          }
        }];
        that.addZoomOnItemOption();
        that.addCreateDragPointModeOnItemOption();
        $scope.$apply();
        break;
    }
  };

  Polyline.prototype.close = function() {
    var that = this;

    this.stroke(geoP.Colors.NotSelected);
    this.updateHashCode();

    switch (this.svgEditor.$scope.mapMode) {
      case 'edit':
        this.group.drag();
        this.element.click(this.select.bind(this));
        break;
      case 'show':
        this.element.click(function() {
          var link = '/floors/' + that.svgEditor.json.id + '/room/' + that.json.id;
          if (window.location.href.indexOf(link) === -1) {
            document.location.href = link;
          }
        });
        break;
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

      if (sourceIndex === 0) {
        targetIndex += 1;
      }

      point = polyline.createSvgPoint(pos.x, pos.y);
      polyline.element.node.points.insertItemBefore(point, targetIndex);
      polyline.addAndGetMovePoint(pos.x, pos.y, targetIndex);


      initMoveCirclesPointsIndex(polyline);

      polyline.setMovePointsToVisibility('visible');
      polyline.updateArea();
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
    createHoverLine(this, 0, this.moveCircles.length - 1);

  };
  geoP.Polyline = Polyline;
}(GeoP, jQuery));
