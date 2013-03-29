// NAH THIS IS STUPID SHIT
// a simple result might be:
// - an object proxy
// - keep the filter argument
// - mixin to attach observers to the store it came from
// - observe relationship stores too
// - update its internal object by calling the store again on a change

var result_mixin = Ember.Mixin.extend({
	__sd_store: null,
	__sd_sync_func: function(){},

	init: function() {
		this._super.apply(this, arguments);
		this.content = this.__sd_sync_func();

		// setup obs, fix properly later
		__sd_store.on('loaded_records', this.__sd_sync_it());
		__sd_store.on('updated_records', this.__sd_sync_it());
	},

	__sd_sync_it: function() {
		var that = this;
		return function() {
			console.log('syncing this shit');
			that.content = that.__sd_sync_func();
		};
	}
});

var result_object = Ember.ObjectProxy.extend(result_mixin, {

});

var result_array = Ember.ArrayProxy.extend(result_mixin, {

});

var make_result = function(res_type, store, sync_func) {
	if (typeof sync_func !== 'function') throw new Error('sync_func is not a function');

	if (res_type === 'array') return new result_array({__sd_store: store, __sd_sync: sync_func});
	else return new result_object({__sd_store: store, __sd_sync: sync_func});
	
};

module.exports = make_result;

