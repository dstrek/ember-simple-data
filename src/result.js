var record = require('./record');

// just return a mutable array as teh result of the filter
// watch the store for events and update the returned array
// figure out what to do about tearing down the bindings later
var result_array = function(store, filter_func) {
	var res = Ember.A(store.data.filter(filter_func));

	var result_sync = function() {
		console.log('result_sync');
		res.setObjects(store.data.filter(filter_func));
	};

	store.on('loaded_records', result_sync);
	store.on('updated_records', result_sync);

	return res;
};

// use ObjectProxy to update the result of a findProperty when content changes in the store
// again figure out releasing bindings later when it becomes an issue ;p
// and we can probably make this more efficient if needed
var result_object = function(store, prop, val) {
	var content = store.data.findProperty(prop, val) || record.create();
	var res = Ember.ObjectProxy.create({content: content });

	var result_sync = function() {
		console.log('result_sync for object');
		var found = store.data.findProperty(prop, val);
		if (found) res.set('content', found);
	};

	store.on('loaded_records', result_sync);
	store.on('updated_records', result_sync);

	return res;
};

module.exports.array = result_array;
module.exports.object = result_object;

