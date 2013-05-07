var test = require('tap').test;
require('../vendor/ember-runtime');
var SD = require('../index');

test('can convert to json', function(t) {
	var comments = SD.store.create({
		name: 'comment',
		id_key: '_id'
	});

	comments.define({
		text: SD.attribute(),
		different_key: SD.attribute('text2')
	});

	comments.load({
		_id: 'blah-blah',
		text: 'hello comment',
		text2: 'hello comment'
	});

	var c = comments.find('blah-blah');

	t.equal(comments.to_json(c).text, c.get('text'), 'json looks ok so far');
	t.equal(comments.to_json(c).text2, c.get('different_key'), 'json with different source key name');
	t.equal(comments.to_json(c, {use_source_keys:true}).different_key, c.get('different_key'), 'json choosing to use defined key name');
	t.end();
});

