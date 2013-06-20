// just a shortcut for some prepared json config
// define an ember virtual property
module.exports = function(fn, deps) {
	var config = {
		attribute: false,
		relationship: false,
		property: {
			fn: fn,
			deps: deps
		}
	};
	return config;
};

