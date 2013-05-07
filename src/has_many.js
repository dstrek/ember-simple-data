// just a shortcut for some prepared json config
module.exports = function(fkey_field, store_name, opts) {
	opts = opts || {};
	var config = {
		attribute: false,
		relationship: {
			type: 'has_many',
			store: store_name,
			fkey: fkey_field,
			opts: opts
		}
	};
	return config;
};

