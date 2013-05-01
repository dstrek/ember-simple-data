/*jshint loopfunc: true*/
var stores = require('./stores');
var record = require('./record');

var store = Ember.Object.extend(Ember.Evented, {

	init: function() {
		if ( ! this.name) throw new Error('you must at lest give stores a name');
		this.id_key = this.id_key || 'id';
		this.attributes = {};
		this.relationships = {};
		this.data = Ember.A([]);
	},

	define: function(attrs) {
		for (var key in attrs) {
			var rel = attrs[key].relationship;
			if (rel) {
				if ( ! stores[rel.store]) throw new Error(this.name + '.' + key + ' relates to undefined store: ' + rel.store);
				if ( ! rel.fkey) throw new Error(this.name + ' must define a foreign key attribute for relationship ' + key);
				if (attrs[rel.fkey]) throw new Error(this.name + ' defined an attribute and relationship with same key: ' + key);
				
				this.relationships[key] = rel;
			}
			else {
				this.attributes[key] = attrs[key].attribute;
			}
		}
	},
	
	// set the attributes and relationships
	// should be able to be shared by load and update
	_set_record_properties: function(r, obj, load_embedded) {
		for (var akey in this.attributes) {
			if (obj[akey]) r.set(akey, obj[akey]);
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
					}
				}

				// embedded list of objects to load and populate the rel.fkey array with
				// TODO some validation on embedded objects actually being loaded...
				if (Array.isArray(obj[rkey])) {
					var loaded_ids = [];

					rel_store.update(obj[rkey], true);
					obj[rkey].forEach(function(o) {
						console.log('loaded embedded has_many', o);
						loaded_ids.push(o[rel_store.id_key]);
					});

					// ids might contain space and upside down underscores but... meh
					if (r.get(rel.fkey).slice().sort().join(' ¡ ') !== loaded_ids.slice().sort().join(' ¡ ')) {
						console.log('updating', r.get('_id'), rel.fkey, 'with', loaded_ids);
						r.get(rel.fkey).clear().pushObjects(loaded_ids);
					}
				}
			}
			else if (rel.type === 'belongs_to'){
				if (obj[rel.fkey] !== undefined) r.set(rel.fkey, obj[rel.fkey]);

				// embedded object to load
				if (typeof obj[rkey] === 'object') {
					console.log('*** store', rel_store.name, 'updating with', obj[rkey]);
					rel_store.update(obj[rkey], true);
					r.set(rel.fkey, obj[rkey][rel_store.id_key]);
					console.log('loaded embedded belongs_to', obj[rkey]);
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
		}).property(rel.fkey).readOnly();
		
		Ember.defineProperty(r, key, computed);
	},

	_load_record: function(obj) {
		if (obj[this.id_key] === undefined) return false;
		// for now just ignore duplicate ids
		if (this.contains(obj[this.id_key])) return false;

		// we should do a find or create otherwise multiple loads will dupe
		var r = record.create();
		r.set(this.id_key, obj[this.id_key]);
		this._set_record_properties(r, obj);
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
		if (loaded) console.log(this.name + ' loaded ' + objs);
		return loaded;
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
		if (updated) console.log(this.name + ' upserted ' + objs);
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

// the exposed api
var store_api = function() {
	
};

store_api.create = function(opts) {
	var s = store.create(opts);
	stores[s.name] = s;
	return s;
};

store_api.find = function(name) {
	if ( ! stores[name]) throw Error('no store with that name');
	return stores[name];
};

store_api.remove = function(name) {
	return delete stores[name];
};

module.exports = store_api;


