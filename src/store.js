// the global store ref
var stores = require('./stores');
var record = require('./record');

var store = Ember.Object.extend({
	name: null,
	id_key: 'id',
	data: Ember.A([]),
	
	load: function(objs) {
		if ( ! Array.isArray(objs)) throw new Error('store.load should be passed an array of objects to load');

		objs.forEach(function(obj) {
			this.get('data').pushObject(record.create(obj));
		}, this);
		
	},
	
	find: function(id) {
		if ( ! id) return this.data.filter(function(){return true;});

		return this.data.findProperty(this.id_key, id);
	}

});

var store_api = function() {
	
};

store_api.create = function(opts) {
	var s = store.create(opts);
	stores[s.name] = s;
	return s;
};

module.exports = store_api;

