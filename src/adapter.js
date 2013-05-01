var store = require('./store');
var result = require('./result');

// define a base adapter to extend when making a persistence adapter such as rest / websocket
function adapter(props) {
	if (typeof props !== 'object') throw Error('must extend the adapter with properties');

}

adapter.prototype.all = function(name) {
	var s = store.find(name);
	return result.array(s, function(){return true;});
};

// pass through methods to stores
adapter.prototype.find = function(name, id) {
	return store.find(name).find(id);
};

adapter.prototype.update = function(name, objs, upsert) {
	return store.find(name).update(objs, upsert);
};

module.exports = adapter;

