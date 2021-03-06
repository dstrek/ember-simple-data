/*jshint loopfunc: true*/
var _ = require('underscore');
var stores = require('./stores');
var record = require('./record');

var store = Ember.Object.extend(Ember.Evented, {

	init: function() {
		if ( ! this.name) throw new Error('you must at least give stores a name');
		this.id_key = this.id_key || 'id';
		this.attributes = {};
		this.relationships = {};
		this.properties = {};
		this.data = Ember.A([]);
		if ( ! this.trigger && typeof this.fire === 'function') this.trigger = this.fire;
	},

	define: function(attrs) {
		for (var key in attrs) {
			// test for ember reserved key
			var testobj = record.create();
			if (testobj[key] !== undefined) throw new Error(this.name + '.' + key + ' is a reserved key, can not define with it.');

			var rel = attrs[key].relationship;
			var prop = attrs[key].property;
			if (rel) {
				if ( ! stores[rel.store]) throw new Error(this.name + '.' + key + ' relates to undefined store: ' + rel.store);
				if ( ! rel.fkey) throw new Error(this.name + ' must define a foreign key attribute for relationship ' + key);
				if (rel.fkey === key) throw new Error(this.name + ' must define a relationship key that does not match the data key: ' + key);
				
				this.relationships[key] = rel;
			}
			else if (prop) {
				if (typeof prop.fn !== 'function') throw new Error(this.name + '.' + key + ' property function not defined.');
				if ( ! Array.isArray(prop.deps)) throw new Error(this.name + '.' + key + ' property deps must be an array.');
				this.properties[key] = prop;
			}
			else {
				this.attributes[key] = attrs[key].attribute;
				// allow leaving data key blank to default to the defined key
				if ( ! this.attributes[key].data_key) this.attributes[key].data_key = key;
			}
		}
	},
	
	// set the attributes and relationships
	// should be able to be shared by load and update
	_set_record_properties: function(r, obj) {
		for (var key in this.attributes) {
			var akey = this.attributes[key].data_key;
			if (obj[akey]) r.set(key, obj[akey]);
		}	

		for (var rkey in this.relationships) {
			var rel = this.relationships[rkey];
			var rel_store = stores[rel.store];

			if (rel.type === 'has_many') {
				if ( ! r.hasOwnProperty(rel.fkey)) r.set(rel.fkey, Ember.A([])); 

				// foreign key id list of related objects
				if (Array.isArray(obj[rel.fkey])) {
					// ids might contain space and upside down underscores but... meh
					if (r.get(rel.fkey).slice().sort().join(' ¡ ') !== obj[rel.fkey].slice().sort().join(' ¡ ')) {
						r.get(rel.fkey).clear().pushObjects(obj[rel.fkey]);
						r.notifyPropertyChange(rel.fkey);
						r.notifyPropertyChange(rkey);
					}
				}

				// embedded list of objects to load and populate the rel.fkey array with
				// TODO some validation on embedded objects actually being loaded...
				if (Array.isArray(obj[rkey])) {
					var loaded_ids = [];

					rel_store.update(obj[rkey], true);
					obj[rkey].forEach(function(o) {
						loaded_ids.push(o[rel_store.id_key]);
					});

					// ids might contain space and upside down underscores but... meh
					if (r.get(rel.fkey).slice().sort().join(' ¡ ') !== loaded_ids.slice().sort().join(' ¡ ')) {
						r.get(rel.fkey).clear().pushObjects(loaded_ids);
						r.notifyPropertyChange(rel.fkey);
						r.notifyPropertyChange(rkey);
					}
				}
			}
			else if (rel.type === 'belongs_to'){
				if (obj[rel.fkey] !== undefined) r.set(rel.fkey, obj[rel.fkey]);

				// embedded object to load
				if (typeof obj[rkey] === 'object') {
					rel_store.update(obj[rkey], true);
					r.set(rel.fkey, obj[rkey][rel_store.id_key]);
					r.notifyPropertyChange(rel.fkey);
					r.notifyPropertyChange(rkey);
				}
			}
			else {
				throw new Error('unknown relationship type: ' + rel.type);
			}

			if ( ! r.hasOwnProperty(rkey)) this._set_computed_property(r, rkey, rel);
		}
	},

	_set_computed_property: function(r, key, rel) {
		// we make a bunch of assumptions on keys existing and having the right data
		// might need some checking later
		var computed = Ember.computed(function(key, value) {
			var that = this;

			if (rel.type === 'has_many') {
				var fprop = function(item, index, enumerable) {
					return that.get(rel.fkey).toArray().contains(item.get(stores[rel.store].id_key));
				};
				return stores[rel.store].data.filter(fprop);
			}
			else if (rel.type === 'belongs_to') {
				return stores[rel.store].find(this.get(rel.fkey));
			}
		}).property(rel.fkey);
		
		Ember.defineProperty(r, key, computed);
	},

	// equivalent to ember .property() definitions
	_set_record_virtuals: function(r) {
		for (var key in this.properties) {
			var p = this.properties[key];
			var computed = Ember.computed(p.fn);
			computed.property.apply(computed, p.deps);
			Ember.defineProperty(r, key, computed);
		}	
	},

	_load_record: function(obj) {
		if (obj[this.id_key] === undefined) return false;
		// for now just ignore duplicate ids
		if (this.contains(obj[this.id_key])) return false;

		// we should do a find or create otherwise multiple loads will dupe
		var r = record.create();
		r.set(this.id_key, obj[this.id_key]);
		this._set_record_properties(r, obj);
		this._set_record_virtuals(r);
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
		//if (loaded) console.log(this.name + ' loaded ' + objs);
		return loaded;
	},

	_update_record: function(obj, upsert) {
		var existing = this.find(obj[this.id_key]);

		if (existing) {
			// fix updating properly later
			//for (var key in this.attributes) {
			//	existing.set(key, obj[key]);
			//}
			this._set_record_properties(existing, obj);
			return true;
		}
		else {
			if (upsert) return this._load_record(obj);
			else throw new Error(this.name + ' id:' + obj[this.id_key] + ' is not in the store, therefore can not update.');
		}
	},

	update: function(objs, upsert, clobber) {
		var updated = false;

		if ( ! Array.isArray(objs)) {
			updated = this._update_record(objs, upsert);
		}
		else {
			var id_list = [];
			objs.forEach(function(obj) {
				if (this._update_record(obj, upsert)) updated = true;
				id_list.push(obj[this.id_key]);
			}, this);
			
			if (clobber) {
				var remove_list = [];
				this.data.forEach(function(o) {
					if ( ! _.contains(id_list, o[this.id_key])) remove_list.push(o[this.id_key]);
				}, this);
				this.remove(remove_list);
			}
		}

		if (updated) this.trigger('updated_records');
		//if (updated) console.log(this.name + ' upserted ' + objs);
		return updated;
	},

	contains: function(id) {
		return !!this.data.findProperty(this.id_key, id);
	},
	
	find: function(id) {
		if (id === undefined) return this.data.filter(function(){ return true; });

		return this.data.findProperty(this.id_key, id);
	},

	filter: function(fn, context) {
		return this.data.filter(fn, context);
	},

	_remove: function(id) {
		this.data.removeObject(this.find(id));
	},

	remove: function(ids) {
		if (Array.isArray(ids)) {
			ids.forEach(function(id) {
				this._remove(id);
			}, this);
		}
		else {
			this._remove(ids);
		}
	},

	to_json: function(rec, opts) {
		if ( ! rec) throw new Error('to_json requires a record to work on');
		if ( opts && typeof opts !== 'object') throw new Error('to_json opts needs to be an object');
		opts = opts || {};

		var json = Object.create(null);
		json[this.id_key] = rec.get(this.id_key);
		for (var key in this.attributes) {
			if (this.attributes[key].relationship) continue;
			json_key = key;
			if (opts.use_source_keys) json_key = this.attributes[key].data_key;
			json[json_key] = rec.get(key);
		}
		return json;
	}


});

// the exposed api
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


