var test = require('tap').test;
require('../vendor/ember-runtime');
var SD = require('../index');

test('define the posts store', function(t) {
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

