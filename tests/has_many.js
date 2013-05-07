var test = require('tap').test;
require('../vendor/ember-runtime');
var SD = require('../index');

test('has many relationship', function(t) {
	var comments = SD.store.create({
		name: 'comment',
		id_key: '_id'
	});

	var users = SD.store.create({
		name: 'user',
		id_key: '_id'
	});

	users.define({
		name: SD.attribute('name_src'),
		comments: SD.has_many('comment_ids', 'comment')
	});

	comments.define({
		text: SD.attribute(),
		user: SD.belongs_to('user_id', 'user')
	});

	users.load([
		{
			_id: 'bob',
			name_src: 'bob',
			comment_ids: [22, 123],
			set: 2
		},
		{
			_id: 'samantha',
			name_src: 'samantha',
			comments: [
				{
					_id: 202,
					text: 'adsf asdfwegerg',
					user_id: 'samantha'
				},	
				{
					_id: 44,
					text: 'adsf asdfwegerg',
					user_id: 'samantha'
				}
			]
		}
	], true);

	comments.load([
		{
			_id: 22,
			text: 'adsf asdfwegerg',
			user_id: 'bob'
		},
		{
			_id: 123,
			text: 'adgerg',
			user_id: 'bob'
		},
		{
			_id: 4,
			text: 'adsf asdfwegeasdfsdafsrg24tf  fasdf adsf asd fg',
			user_id: 'samantha'
		}
	]);

	console.log('bob -> comments =', users.find('bob').get('comments'));
	console.log('comment 4 -> user =', comments.find(4).get('user.name'));
	console.log('comment 4 -> user -> comments =', comments.find(4).get('user').get('comments'));

	t.equal(users.find('bob').get('comments').length, 2, 'bob has 2 comments');
	t.equal(comments.find(22).get('user.name'), 'bob', 'comment 22 belongs_to bob');
	t.equal(users.find('samantha').get('comments').length, 2, 'samantha has 2 comments');
	t.equal(comments.find(44).get('user.name'), 'samantha', 'comment 44 belongs_to samantha');
	t.equal(users.find('bob').get('comments').objectAt(0).get('user.name'), 'bob', 'circular user -> comments[0] -> user for bob');
	t.equal(users.find('samantha').get('comments').objectAt(0).get('user.name'), 'samantha', 'circular user -> comments[0] -> user for samantha');

	t.end();
});

