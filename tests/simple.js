require('../vendor/ember-runtime');
var SD = require('../index');

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

console.log('all posts', posts.find());
console.log('finding post 0', posts.find(0));


