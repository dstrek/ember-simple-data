// hmm store should be able to set computed properties on records when it makes them...
var add_computed = Ember.Mixin.extend({
	init: function() {
		this._super.apply(this, arguments);
	}
});

// hmm make this an object proxy?
var record = Ember.Object.extend(add_computed, Ember.Evented, {
	__sd_store: null,
	__sd_attributes: {},
	__sd_relationships: {},

	// helper
	// probably too presumptuous
	// interferes with having a property called id that isn't the id_key
	id: function() {
		return this.get(this.__sd_store.id_key);	
	}
});

module.exports = record;

