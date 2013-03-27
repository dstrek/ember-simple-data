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
		if (obj[this.id_key] === undefined) return false;

		var r = record.create({__sd_store: this});
		for (var key in obj) {
			// only save attributes
			if ( ! this.attributes[key] && key !== this.id_key) continue;
			
			r.set(key, obj[key]);
		}

		this.data.pushObject(r);
		return true;
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

	_update_record: function(obj, upsert) {
		var existing = this.find(obj[this.id_key]);

		if (existing) {
			// fix updating properly later
			for (var key in this.attributes) {
				existing.set(key, obj[key]);
			}
			return true;
		}
		else {
			if (upsert) return this._load_record(obj);
			else throw new Error(this.name + ' id:' + obj[this.id_key] + ' is not in the store, therefore can not update.');
		}
	},

	update: function(objs, upsert) {
		var updated = false;

		if ( ! Array.isArray(objs)) {
			updated = this._update_record(objs, upsert);
		}
		else {
			objs.forEach(function(obj) {
				if (this._update_record(obj, upsert)) updated = true;
			}, this);
		}

		if (updated) this.trigger('updated_records');
	},

	contains: function(id) {
		return !!this.data.findProperty(this.id_key, id);
	},
	
	find: function(id) {
		if (id === undefined) return this.data.filter(function(){return true;});

		return this.data.findProperty(this.id_key, id);
	},

	to_json: function(rec, opts) {
		if ( ! rec) throw new Error('to_json requires a record to work on');

		var json = {};
		json[this.id_key] = rec.get(this.id_key);
		for (var key in this.attributes) {
			if (this.attributes[key].relationship) continue;
			json[key] = rec.get(key);
		}
		return json;
	}


});

var store_api = function() {
	
};

store_api.create = function(opts) {
	var s = store.create(opts);
	stores[s.name] = s;
	return s;
};

store_api.find = function(name) {
	return stores[name];
};

store_api.remove = function(name) {
	return delete stores[name];
};

module.exports = store_api;

