var test = require('tap').test;
require('../vendor/ember-runtime');
var SD = require('../index');

// do some setup
var posts = SD.store.create({
	name: 'post',
	id_key: '_id'
});

var comments = SD.store.create({
	name: 'comment',
	id_key: '_id'
});

var users = SD.store.create({
	name: 'user',
	id_key: '_id'
});


test('define the posts store', function(t) {
	posts.define({
		name: SD.attribute(),
		content: SD.attribute(),
		comments: SD.has_many('comment', 'comment_ids'),
		user: SD.belongs_to('user', 'user_id')
	});
	t.ok(true, 'posts defined');

	t.test('insert some posts', function(t) {
		t.plan(5);

		posts.on('loaded_records', function() { t.ok(true, 'loaded_records event triggered'); });

		posts.load([
			{
				_id: 0,
				name: 'test post',
				content: 'hello'
			},
			{
				_id: 2,
				name: 'test post 2',
				content: 'asdfasgaregfre'
			}
		]);

		t.ok(posts.find().length, 'now has posts');
		t.equal(posts.find(0).get('_id'), 0, 'can find by id 0');
		t.equal(posts.find(2).get('_id'), 2, 'can find by id 2');
		t.notOk(posts.contains('some random id that should not be in there'), 'handles not finding');
	});

	t.end();
});

test('can find and remove stores', function(t) {
	var temp = SD.store.create({
		name: 'temp'
	});

	t.equals(SD.store.find('temp').name, 'temp', 'found temp store');

	SD.store.remove('temp');

	t.notOk(SD.store.find('temp'), 'temp was removed');
	t.end();
});

test('can convert to json', function(t) {
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

test('can update and upsert', function(t) {
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

test('has many relationship', function(t) {
	users.define({
		name: SD.attribute(),
		comments: SD.has_many('comment', 'comment_ids')
	});

	comments.define({
		text: SD.attribute(),
		user: SD.belongs_to('user', 'user_id')
	});


	t.end();
});

