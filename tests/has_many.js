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
		comments: SD.has_many('comment', 'comment_ids', {embedded: true})
	});

	comments.define({
		text: SD.attribute(),
		user: SD.belongs_to('user', 'user_id', {embedded: true})
	});

	users.load([
		{
			_id: 'bob',
			name: 'bob',
			comment_ids: [22, 123]
		},
		{
			_id: 'samantha',
			name: 'samantha',
			comments: [
				{
					_id: 202,
					text: 'adsf asdfwegerg'
				},	
				{
					_id: 44,
					text: 'adsf asdfwegerg'
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
			user: {
				_id: 'samantha',
				name: 'sammy'
			}
		}
	]);

	console.log('bob -> comments =', users.find('bob').get('comments'));
	console.log('comment 4 -> user =', comments.find(4).get('user.name'));
	console.log('comment 4 -> user -> comments =', comments.find(4).get('user').get('comments'));

	t.end();
});

