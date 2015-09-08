var hex = require('turf-hex-grid')
var scale = require('d3-scale')
var inside = require('turf-inside')
var centroid = require('turf-centroid')
var jf = require('jsonfile')

module.exports = function(data, bbox, width, callback) {
	var bbox = bbox
	var cellWidth = width
	var units = 'kilometers'
	console.log('Creating grid...')
	var hexgrid = hex(bbox, cellWidth, units)
	addCellId(hexgrid.features, function(cells) {
		getPoints(data.features, cells, width, function(points) {
			jf.writeFile('data/hexPoints_' + width.toString() + '.json', points, function(err) {
				if(err) { console.log(err) }
				else {
					console.log('Wrote data/hexPoints_' + width.toString() + '.json')
					callback(points)
				}
			})
		})
	})
}


function getPoints(points, cells, width, callback) {
	console.log('Getting relations between grid cells and features...')
	cellPointRelations(points, cells, function(relations) {
		console.log('Calculating features by cell...')
		countPointsByCell(relations, function(cellIds, domain) {
			console.log('Creating points...')
			getCellPoints(cellIds, cells, function(points) {
				console.log('Creating points...')
				scaleCounts(points, domain, width, function(pts) {
					var c = {type:'FeatureCollection', features: pts}
					callback(c)
				})
			})
		})
	})
}

function scaleCounts(points, domain, width, callback) {
	var pointsWithScale = []
	var scaleCircle = scale.linear()
		.domain([domain.min, domain.max])
		.range([10, width * 500])
	for(i=0;i<points.length;i++) {
		var f = points[i]
		var c = f.properties.count
		var s = Math.floor(scaleCircle(c))
		f.properties.circle = s
		pointsWithScale.push(f)
	}
	callback(pointsWithScale)
}

function getCellPoints(cellIds, cells, callback) {
	var pts = []
	for(i=0;i<cellIds.length;i++) {
		var id = cellIds[i].cellId
		var count = cellIds[i].count
		for(j=0;j<cells.length;j++) {
			if(cells[j].properties.id === id) {
				var point = centroid(cells[j])
				point.properties.id = id
				point.properties.count = count
				pts.push(point)
				break
			}
		}
	}
	callback(pts)
}

function countPointsByCell(relations, callback) {
	var uniq = []
	for(i=0;i<relations.length;i++) {
		var rel = relations[i]
		var exist = false
		for(j=0;j<uniq.length;j++) {
			if(rel.cellId === uniq[j].cellId) {
				exist = true
				uniq[j].count = uniq[j].count + 1
				break
			}
		}
		if(exist === false) {
			uniq.push({cellId: rel.cellId, count: 1})
		}
	}
	uniq.sort(byCount)
	var domain = {}
	domain.min = uniq[0].count
	domain.max = uniq[uniq.length - 1].count
	callback(uniq, domain)
}


function cellPointRelations(points, cells, callback) {
	var rels = []
	for(i=0;i<points.length;i++) {
		var point = points[i]
		for(j=0;j<cells.length;j++) {
			var cell = cells[j]
			if(inside(point,cell) === true) {
				rels.push({point: i, cellId: cell.properties.id})
				break
			}
		}
	}
	callback(rels)
}

function addCellId(cells, callback) {
	var withId = []
	for(i=0;i<cells.length;i++) {
		var cell = cells[i]
		var id = i + 1
		cell.properties.id = id
		withId.push(cell)
	}
	callback(withId)
} 

function byCount(a,b) {
  if (a.count < b.count)
    return -1;
  if (a.count > b.count)
    return 1;
  return 0;
}
