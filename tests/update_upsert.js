var test = require('tap').test;
require('../vendor/ember-runtime');
var SD = require('../index');

test('can update and upsert', function(t) {
	var comments = SD.store.create({
		name: 'comment',
		id_key: '_id'
	});

	comments.define({
		text: SD.attribute()
	});

	comments.update({
		_id: 'upserting',
		text: 'superman'
	}, true);

	t.ok(comments.contains('upserting'), 'upsert ok');

	comments.update({
		_id: 'upserting',
		text: 'batman'
	});

	t.equal(comments.find('upserting').get('text'), 'batman', 'update ok');
	t.end();
});

