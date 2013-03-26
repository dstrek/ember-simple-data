// the global store ref
var stores = require('./stores');
var record = require('./record');

var store = Ember.Object.extend(Ember.Evented, {
	name: null,
	id_key: 'id',
	data: Ember.A([]),
	attributes: {},

	define: function(attrs) {
		this.attributes = attrs;
		
		// if there is a relationship, make sure the store is defined
		for (var key in this.attributes) {
			var rel = this.attributes[key].relationship;
			if (rel) {
				if ( ! stores[rel.store]) {
					throw new Error(this.name + '.' + key + ' relates to undefined store: ' + rel.store);
				}
			}
		}
	},
	
	_load_record: function(obj) {
		var r = record.create({__sd_store: this});
		for (var key in obj) {
			// only save attributes
			if ( ! this.attributes[key] && key !== this.id_key) continue;
			
			r.set(key, obj[key]);
		}

		//do not load if there is no id 
		if (r.get(this.id_key) !== undefined) {
			this.data.pushObject(r);
			return true;
		}
		
		return false;
	},

	load: function(objs) {
		var loaded = false;

		if ( ! Array.isArray(objs)) {
			loaded = this._load_record(objs);
		}
		else {
			objs.forEach(function(obj) {
				if (this._load_record(obj)) loaded = true;
			}, this);
		}

		if (loaded) this.trigger('loaded_records');
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

