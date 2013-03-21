// the global store ref
var stores = require('./stores');

var store = Ember.Object.extend({
	name: null,
	data: Ember.A([]),
	
	load: function(objs) {
		if ( ! Array.isArray(objs)) throw new Error('store.load should be passed an array of objects to load');

		objs.forEach(function(obj) {
			this.get('data').pushObject(Ember.Object.create(obj));
		}, this);
		
	},
	
	find: function(id) {
		if ( ! id) return this.get('data');
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

