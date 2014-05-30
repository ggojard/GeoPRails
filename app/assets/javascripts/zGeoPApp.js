angular.module('GeoP', []).controller('GeoPCtrl', function($scope) {
// angular.module('GeoP', ['angularFileUpload']).controller('GeoPCtrl', function($scope, $fileUploader) {

// var GeoPCtrl = function($scope){

  // if ($scope === void 0){
  //   return;
  // }

  // console.log('$scope', $scope);

  // // create a uploader with options
  // var uploader = $scope.uploader = $fileUploader.create({
  //   scope: $scope, // to automatically update the html. Default: $rootScope
  //   url: 'upload.php'
  // });
  // // ADDING FILTERS

  // uploader.filters.push(function(item /*{File|HTMLInput}*/ ) { // user filter
  //   console.info('filter1');
  //   return true;
  // });

  // // REGISTER HANDLERS

  // uploader.bind('afteraddingfile', function(event, item) {
  //   console.info('After adding a file', item);
  // });

  // uploader.bind('whenaddingfilefailed', function(event, item) {
  //   console.info('When adding a file failed', item);
  // });

  // uploader.bind('afteraddingall', function(event, items) {
  //   console.info('After adding all files', items);
  // });

  // uploader.bind('beforeupload', function(event, item) {
  //   console.info('Before upload', item);
  // });

  // uploader.bind('progress', function(event, item, progress) {
  //   console.info('Progress: ' + progress, item);
  // });

  // uploader.bind('success', function(event, xhr, item, response) {
  //   console.info('Success', xhr, item, response);
  // });

  // uploader.bind('cancel', function(event, xhr, item) {
  //   console.info('Cancel', xhr, item);
  // });

  // uploader.bind('error', function(event, xhr, item, response) {
  //   console.info('Error', xhr, item, response);
  // });

  // uploader.bind('complete', function(event, xhr, item, response) {
  //   console.info('Complete', xhr, item, response);
  // });

  // uploader.bind('progressall', function(event, progress) {
  //   console.info('Total progress: ' + progress);
  // });

  // uploader.bind('completeall', function(event, items) {
  //   console.info('Complete all', items);
  // });


  // -------------------------------


  // var controller = $scope.controller = {
  //   isImage: function(item) {
  //     var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
  //     return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
  //   }
  // };

  function handleKey(e) {
    var key, isShift;
    if (window.event) {
      key = window.event.keyCode;
      isShift = window.event.shiftKey ? true : false;
    } else {
      key = ev.which;
      isShift = ev.shiftKey ? true : false;
    }
    $scope.isShift = isShift;
    $scope.$apply();
  }

  document.onkeydown = handleKey;
  document.onkeyup = handleKey;

  var editor = new GeoP.SvgEditor("#main", $scope);
  $scope.mode = 'normal';

  $scope.createPolyline = function() {
    $scope.mode = 'create';
    var opts = editor.createPolyline($scope);
    $scope.currentOptions = opts;
  };

  var createPolyline = {
    label: 'create polyline',
    action: $scope.createPolyline
  };

  var importBackground = {
    label: 'import background',
    action: function(e) {
      // $scope.importBackground = true;
    }
  };

  $scope.cleanCurrentOptions = function() {
    $scope.currentOptions = [];
    $scope.mode = 'normal';
  };


  $scope.buttons = [createPolyline, importBackground];
  $scope.currentOptions = [];
// };
});