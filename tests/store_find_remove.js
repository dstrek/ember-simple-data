var test = require('tap').test;
require('../vendor/ember-runtime');
var SD = require('../index');

test('can find and remove stores', function(t) {
	var temp = SD.store.create({
		name: 'temp'
	});

	t.equals(SD.store.find('temp').name, 'temp', 'found temp store');

	SD.store.remove('temp');

	t.notOk(SD.store.find('temp'), 'temp was removed');
	t.end();
});

