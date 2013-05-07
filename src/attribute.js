// just a shortcut for some prepared json config
module.exports = function(data_key) {
	var config = {
		attribute: {
			data_key: data_key
		},
		relationship: false
	};
	return config;
};

