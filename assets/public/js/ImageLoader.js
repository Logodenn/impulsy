/* global Image */

var canvasImagesPath = '../img/canvas/'
var canvasImagesNames = [
  'artefact0.png',
  'artefact1.png',
  'artefactCoop.png',
  'artefactTaken.png',
  'player0.png',
  'player1.png',
  'pulser.png',
  'deathFlagBest.png',
  'deathFlagsAverage.png'
]

function ImageLoader () {
  var self = this

  self.images = {}

  self.load = function load (basePath, arr) {
    for (var i = 0; i < arr.length; i++) {
      var image = new Image()

      image.src = basePath + arr[i]

      var imageName = arr[i].split('.')[0]
      self.images[imageName] = image
    }
  }
}

var imageLoader = new ImageLoader()
imageLoader.load(canvasImagesPath, canvasImagesNames)
