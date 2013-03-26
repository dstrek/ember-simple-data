var record = Ember.Object.extend(Ember.Evented, {
	id_key: null,

	// helper
	id: function() {
		return this.get(this.id_key);	
	}
});

module.exports = record;

