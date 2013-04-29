var test = require('tap').test;
require('../vendor/ember-runtime');
var SD = require('../index');

test('can convert to json', function(t) {
	var comments = SD.store.create({
		name: 'comment',
		id_key: '_id'
	});

	comments.define({
		text: SD.attribute()
	});

	comments.load({
		_id: 'blah-blah',
		text: 'hello comment'
	});

	var c = comments.find('blah-blah');

	t.equal(comments.to_json(c).text, c.get('text'), 'json looks ok so far');
	t.end();
});

