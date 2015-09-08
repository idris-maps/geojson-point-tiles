var createTiles = require('./lib/createTiles')


var data = require('./data/myGeojsonPoints.json') //<-- the points to divide into tiles
var name = 'myPoints' // <-- the name of the output
var zoom = 16 // <-- the zoom level of the tiles

createTiles(data, name, zoom, function() {
	console.log('done')
})
