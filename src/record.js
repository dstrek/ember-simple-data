var record = Ember.Object.extend(Ember.Evented, {
	__sd_store: null,

	// helper
	id: function() {
		return this.get(this.__sd_store.id_key);	
	}
});

module.exports = record;

