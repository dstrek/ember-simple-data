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

	posts.define({
		name: SD.attribute(),
		content: SD.attribute()
	});

	t.ok(true, 'posts defined');

	t.test('insert some posts', function(t) {
		t.plan(7);

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

		comments.load([
			{
				_id: 'comment 22',
				name: 'test'
			}
		]);

		t.equal(posts.find().length, 2, 'now has 2 posts');
		t.equal(comments.find().length, 1, 'now has 1 comment');
		t.equal(posts.find(0).get('_id'), 0, 'can find by id 0');
		t.equal(posts.find(2).get('_id'), 2, 'can find by id 2');
		t.equal(comments.find('comment 22').get('_id'), 'comment 22', 'can find by id "comment 22"');
		t.notOk(posts.contains('some random id that should not be in there'), 'handles not finding');
	});

	t.end();
});

