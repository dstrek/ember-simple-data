// just a shortcut for some prepared json config
module.exports = function(store_name, fkey_field) {
	var config = {
		attribute: false,
		relationship: {
			type: 'has_many',
			store: store_name,
			fkey: fkey_field
		}
	};
	return config;
};

