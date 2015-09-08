var bb = {
	lng: {
		min: 1000,
		max: 0
	}, 
	lat: {
		min: 1000,
		max: 0
	}
}
module.exports = function(data, callback) {
	for(i=0;i<data.features.length;i++) {
		var f = data.features[i]
		var c = f.geometry.coordinates
		var lng = c[0]
		var lat = c[1]
		if(lng < bb.lng.min) { bb.lng.min = lng }
		if(lng > bb.lng.max) { bb.lng.max = lng }
		if(lat < bb.lat.min) { bb.lat.min = lat }
		if(lat > bb.lat.max) { bb.lat.max = lat }
	}

	bb.lat.min = Math.floor((bb.lat.min - 0.001) * 1000) / 1000
	bb.lat.max = Math.floor((bb.lat.max + 0.001) * 1000) / 1000
	bb.lng.min = Math.floor((bb.lng.min - 0.001) * 1000) / 1000
	bb.lng.max = Math.floor((bb.lng.max + 0.001) * 1000) / 1000
	
	callback(bb)
}
