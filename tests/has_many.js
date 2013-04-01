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
		name: SD.attribute(),
		comments: SD.has_many('comment', 'comment_ids')
	});

	comments.define({
		text: SD.attribute(),
		user: SD.belongs_to('user', 'user_id')
	});

	users.load([
		{
			_id: 'bob',
			name: 'bob',
			comment_ids: [22, 123, 4]
		},
		{
			_id: 'samantha',
			name: 'samantha',
			comments: [
				{
					_id: 22,
					text: 'adsf asdfwegerg'
				},
				{
					_id: 22,
					text: 'adsf asdfwegerg'
				}
			]
		}
	]);

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
			user_id: 'bob'
		}
	]);

	t.end();
});

