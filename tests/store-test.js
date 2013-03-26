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
		t.plan(4);

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

		t.equal(posts.find().length, 2, 'has correct post count');
		t.equal(posts.find(0).id(), 0, 'can find by id 0');
		t.equal(posts.find(2).id(), 2, 'can find by id 2');
	});

	t.end();
});


