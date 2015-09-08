var tilebelt = require('tilebelt')
var inside = require('turf-inside')
var jf = require('jsonfile')

var getBB = require('./getBB')


module.exports = function(data, name, zoom, callback) {
	console.log('Creating ' + name + ' tiles...')
	getBB(data, function(bb) {
		getMinMaxTiles(zoom, bb, function(tileMin, tileMax, bboxMin, bboxMax) {
			createTileFeatures(zoom, tileMin, tileMax, function(tileFeats) {
				addFeatures(tileFeats, data.features, function(tiles) {
					jf.writeFile('data/' + name + '_tiles.json', tiles, function() {
						console.log('Wrote data/' + name + '_tiles.json')
						callback()
					})
				})
			})
		})
	})
}

function addFeatures(tileFeats,features, callback) {
	var tiles = []
	for(i=0;i<features.length;i++) {
		var f = features[i]
		for(j=0;j<tileFeats.length;j++) {
			var t = tileFeats[j]
			if(inside(f,t) === true) {
				t.properties.features.push(f)
				break
			}
		}
	}
	for(i=0;i<tileFeats.length;i++) {
		tiles.push(tileFeats[i].properties)
	}
	callback(tiles)
}

function createTileFeatures(zoom, tileMin, tileMax, callback) {
	var feats = []
	for(i=tileMin[0];i<tileMax[0] + 1;i++) {
		for(j=tileMax[1];j<tileMin[1] + 1;j++) {
			var g = tilebelt.tileToGeoJSON([i,j,zoom])
			var p = {x: i, y: j, features: []}
			feats.push({type:'Feature', properties: p, geometry: g})
		}
	}
	callback(feats)
}

function getMinMaxTiles(zoom, bb, callback) {
	var tiles = []
	var tileMin = tilebelt.pointToTile(bb.lng.min, bb.lat.min, zoom)
	var tileMax = tilebelt.pointToTile(bb.lng.max, bb.lat.max, zoom)
	callback(tileMin, tileMax)
}
