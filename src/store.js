// the global store ref
var stores = require('./stores');
var record = require('./record');

var store = Ember.Object.extend({
	name: null,
	id_key: 'id',
	data: Ember.A([]),
	attributes: {},

	define: function(attrs) {
		this.attributes = attrs;
	},
	
	_load_record: function(obj) {
		var r = record.create();
		for (var key in obj) {
			if ( ! this.attributes[key] && key !== this.id_key) continue;
			r.set(key, obj[key]);
		}

		//do not load if there is no id 
		if (r.get(this.id_key) !== undefined) {
			this.data.pushObject(r);
		}
	},

	load: function(objs) {
		if ( ! Array.isArray(objs)) return this._load_record(objs);

		objs.forEach(function(obj) {
			this._load_record(obj);
		}, this);
	},
	
	find: function(id) {
		if (id === undefined) return this.data.filter(function(){return true;});

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

