/*global GeoP:true */

(function(geoP) {
  "use strict";

  var Polyline = function(svgEditor) {
    geoP.extend(geoP.Shape, this, svgEditor);
    this.moveCircles = [];
    this.pointIndex = 0;
    // this.isSelected = false;
    this.hoverLines = [];
    this.json = null;
  };

  Polyline.prototype.createSvgPoint = function(x, y) {
    var point = this.svgEditor.paper.node.createSVGPoint();
    point.x = x;
    point.y = y;
    return point;
  };


  function polygonArea(points) {
    var l = points.length
    var det = 0

    points = points.map(normalize);
    points = points.concat(points[0]);

    for (var i = 0; i < l; i++) {
      det += points[i].x * points[i + 1].y - points[i].y * points[i + 1].x
    }
    return Math.abs(det) / 2
  }

  function normalize(point) {
    if (Array.isArray(point)) {
      return {
        x: point[0],
        y: point[1]
      }
    } else {
      return point;
    }
  }

  Polyline.prototype.updateArea = function() {
    if (this.areaText !== void 0) {
      var area = this.getArea();
      this.areaText.node.innerHTML = area + ' m²';
      this.json.area = area;
    }
  };


  Polyline.prototype.getArea = function() {
    var points = [];

    var scaleLen = this.svgEditor.mapScale.length;
    var scaleDim = this.svgEditor.mapScale.getLength();


    if (this.element === void 0 || this.element.node === void 0) {
      return 0;
    }

    for (var i = 0; i < this.element.node.points.numberOfItems; i++) {
      var p = this.element.node.points.getItem(i);
      var a = {
        x: p.x,
        y: p.y
      };
      a.x = a.x * scaleLen / scaleDim;
      a.y = a.y * scaleLen / scaleDim;
      points.push(a);
    }

    var l = polygonArea(points);
    // reparse to handle toFixed to float
    l = parseFloat(parseFloat(l, 10).toFixed(1), 10);
    return l;
  };

  Polyline.prototype.create = function(x, y) {
    var that = this;
    var point = this.createSvgPoint(x, y);
    this.element = this.svgEditor.canvas.polygon(point.x, point.y);
    this.element.attr({
      fill: 'transparent',
      stroke: GeoP.Colors.Drawing
    });
    this.group = this.svgEditor.canvas.group(this.element);
    this.addAndGetMovePoint(x, y, this.pointIndex);
    this.element.click(function() {
      var x = [];
      var y = [];
      for (var i = 0; i < that.moveCircles.length; i++) {
        var p = that.moveCircles[i];
        x.push(p.node.cx.baseVal.value);
        y.push(p.node.cy.baseVal.value);
      }
    });
  };

  Polyline.prototype.updateTextPosition = function(textSvg, yTranslate) {
    var bbox = this.element.node.getBBox();
    var textBbox = textSvg.node.getBBox();
    textSvg.attr({
      x: bbox.x + bbox.width / 2 - textBbox.width / 2,
      y: bbox.y + bbox.height / 2 + yTranslate * textBbox.height,
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

  Polyline.prototype.removeDragPoint = function(dragPoint) {
    var that = this;
    var dragPointIndex = this.moveCircles.indexOf(dragPoint);
    dragPoint.remove();
    this.moveCircles.splice(dragPointIndex, 1);

    initMoveCirclesPointsIndex(this);
    // console.info('delete', dragPointIndex, this.moveCircles.map(function(u) {
    //   return u.pointIndex;
    // }));

    that.element.node.points.removeItem(dragPoint.pointIndex);
    this.save();
  };

  Polyline.prototype.addAndGetMovePoint = function(x, y, pointIndex) {
    var that = this;
    var movePointCircle = this.svgEditor.canvas.circle(x, y, 5);
    movePointCircle.attr({
      stroke: 'red',
      fill: 'transparent',
      visibility: 'hidden'
    });
    var pointName = parseInt(x, 10) + '-' + parseInt(y, 10);
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

      var deleteLabel = 'Supprimer le sommet (' + movePointCircle.pointName + ')';
      that.svgEditor.dragPointsOptions = [{
        label: deleteLabel,
        classes: 'btn-danger',
        icon: 'fa-trash-o',
        action: function(callback) {

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
      var scale = that.svgEditor.camera.scale;
      var mousePos = that.svgEditor.getMousePos(e);
      var mx = (mousePos.x / scale) - movePointCircle.node.cx.baseVal.value;
      var my = (mousePos.y / scale) - movePointCircle.node.cy.baseVal.value;

      var ctm = that.group.node.getCTM();
      mx -= ctm.e / scale;
      my -= ctm.f / scale;

      movePointCircle.node.cx.baseVal.value += mx;
      movePointCircle.node.cy.baseVal.value += my;
      var p = that.element.node.points[movePointCircle.pointIndex];
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
    })
  };

  Polyline.prototype.remove = function() {
    this.element.remove();
    for (var i = 0; i < this.moveCircles.length; i++) {
      var c = this.moveCircles[i];
      c.remove();
    };
    if (this.text !== void 0) {
      this.text.remove();
    }
    if (this.areaText !== void 0) {
      this.areaText.remove();
    }
    this.svgEditor.removePolyline(this);
  };

  Polyline.prototype.appendPoint = function(x, y) {
    var point = this.createSvgPoint(x, y);
    this.element.node.points.appendItem(point);
    this.addAndGetMovePoint(x, y, this.pointIndex);
  };


  Polyline.prototype.setTexts = function() {
    this.text = this.addText(this.json.name, 0);
    this.areaText = this.addText(this.json.area + ' m²', 1);
  };

  Polyline.prototype.fillFromFilterColor = function(filterName) {
    var color = 'transparent';
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
    this.json = json;

    if (this.json.points === null) {
      return;
    }

    if (this.json.points !== null) {
      var points = JSON.parse(this.json.points);
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        if (i === 0) {
          this.create(p.x, p.y);
        } else {
          this.appendPoint(p.x, p.y);
        }
      }
    }
    if (points.length === 0) {
      return;
    }
    this.close(this.svgEditor.$scope);

    this.setTexts();
    this.doActionIfItemIsSelected();
    this.updateHashCode();

  };

  Polyline.prototype.registerHover = function() {
    this.element.hover(function(e) {
      that.stroke(GeoP.Colors.Selected);
    }, function() {
      that.stroke(GeoP.Colors.NotSelected);
    });
  };

  Polyline.prototype.setMovePointsToVisibility = function(visibility) {
    var that = this;
    for (var i = 0; i < that.moveCircles.length; i++) {
      var movePointCircle = that.moveCircles[i];
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
    if (this.group !== void 0) {
      var bbox = JSON.stringify(this.group.node.getBBox());
      var h = [bbox];
      if (this.json !== null) {
        h.push(this.json.area);
      }
      h.push(JSON.stringify(this.group._.transform));
      return geoP.hashCode(h.join(''));
    }
    return 0;
  };

  Polyline.prototype.getPointsData = function() {
    var points = [];
    if (this.group === void 0) {
      return points;
    }

    var camera = this.svgEditor.camera;
    var ctm = this.group.node.getCTM();
    var scale = camera.scale;
    var x = ctm.e / scale;
    var y = ctm.f / scale;
    for (var i = 0; i < this.element.node.points.numberOfItems; i++) {
      var p = this.element.node.points.getItem(i);
      points.push({
        x: p.x + x - camera.x * 1 / scale,
        y: p.y + y - camera.y * 1 / scale
      });
    }
    return JSON.stringify(points);
  };

  Polyline.prototype.save = function(callback) {
    var that = this;
    if (this.json === null) {
      var data = {
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
      }).error(function(data, status, headers, config) {
        console.error('impossible to create new');
      });
      return null;
    }
    var data = {
      'id': this.json.id,
      'room': {
        'points': this.getPointsData(),
        'area': this.getArea()
      }
    };
    this.svgEditor.$http.put('/rooms/' + this.json.id + '.json', data).success(function(d) {
      geoP.notifications.done('La pièce ' + that.json.name + ' a été sauvegardée.');
      that.updateHashCode();
      return callback && callback();
    }).error(function(data, status, headers, config) {
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
    var that = this;
    var $scope = this.svgEditor.$scope;
    // that.isSelected = true;
    that.svgEditor.cleanDragPointOptions();

    switch ($scope.mode) {
      case 'normal':
      case 'edit':
        $scope.room = that;

        that.svgEditor.unSelectItems();
        that.setMovePointsToVisibility('visible');
        that.stroke(GeoP.Colors.Selected);
        geoP.currentEvent = e;
        $scope.mode = 'edit';

        var deleteLabel = 'Supprimer ' + that.json.name;
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
                  } else {
                    geoP.notifications.error('Impossible de supprimer la pièce ' + that.json.name);
                  }
                })
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

  Polyline.prototype.close = function($scope) {
    var that = this;

    this.stroke(GeoP.Colors.NotSelected);
    this.updateHashCode();

    switch (this.svgEditor.$scope.G_Mode) {
      case 'edit':
        this.group.drag();
        this.element.click(this.select.bind(this));
        break;
      case 'show':
        this.element.click(function(e) {
          var link = '/floors/' + that.svgEditor.json.id + '/room/' + that.json.id;
          if (window.location.href.indexOf(link) === -1) {
            document.location.href = link;
          }
        });
        break;
    }
  };


  function initMoveCirclesPointsIndex(polyline) {
    for (var i = 0; i < polyline.moveCircles.length; i++) {
      polyline.moveCircles[i].pointIndex = i;
    }

  }

  function createHoverLine(polyline, sourceIndex, targetIndex) {
    var that = polyline;
    var mp = polyline.element.node.points.getItem(sourceIndex);
    var mpn = polyline.element.node.points.getItem(targetIndex);

    var line = polyline.svgEditor.canvas.line(mp.x, mp.y, mpn.x, mpn.y);
    line.attr({
      stroke: 'brown',
      fill: 'brown'
    });

    var $b = $('body');
    line.hover(function() {
      $b.css('cursor', 'crosshair');
    }, function() {
      $b.css('cursor', 'default');
    });

    line.click(function(e) {
      geoP.currentEvent = e;
      var mousePos = polyline.svgEditor.getMousePos(e);
      var camera = polyline.svgEditor.camera;
      var scale = camera.scale;

      var pos = {
        x: mousePos.x / scale - camera.x / scale,
        y: mousePos.y / scale - camera.y / scale
      };

      if (sourceIndex === 0) {
        targetIndex += 1;
      }

      var point = polyline.createSvgPoint(pos.x, pos.y);
      polyline.element.node.points.insertItemBefore(point, targetIndex);
      polyline.addAndGetMovePoint(pos.x, pos.y, targetIndex);


      initMoveCirclesPointsIndex(polyline);
      // console.info('create', polyline.moveCircles.map(function(u) {
      //   return u.pointIndex;
      // }));

      polyline.setMovePointsToVisibility('visible');
      polyline.updateArea();
      polyline.updateHashCode();

      removeHoverLines(polyline);

      polyline.save();

    });

    polyline.hoverLines.push(line);

  }

  function removeHoverLines(polyline) {
    var linesCount = polyline.hoverLines.length;
    for (var i = 0; i < linesCount; i++) {
      polyline.hoverLines[i].remove();
    }
    polyline.hoverLines = [];
  }


  Polyline.prototype.createHoverLines = function() {
    removeHoverLines(this);
    for (var i = 0; i < this.moveCircles.length - 1; i++) {
      createHoverLine(this, i, i + 1);
    }
    createHoverLine(this, 0, this.moveCircles.length - 1);

  };


  geoP.Polyline = Polyline;


}(GeoP));