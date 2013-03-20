var SD = require('ember-simple-data');

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

comments.define({
	content: SD.attribute(),
	post: SD.belongs_to('post', 'post_id'),
	user: SD.belongs_to('user', 'user_id')
});

users.define({
	name: SD.attribute(),
	email: SD.attribute(),
	posts: SD.has_many('post', 'post_ids'),
	comments: SD.has_many('comment', 'comment_ids')
});

var posts_json = [{
	_id: '2342353sdvdfv322gv2',
	name: 'test post',
	content: 'hello world',
	user: {
		_id: 1,
		name: 'bob',
		email: 'bob@hasmail.com'
	},
	comments: [
		{
			_id: 12,
			_content: 'blah bah 240p'
		}
	]
}];

posts.load(posts_json);
var p = posts.find('2342353sdvdfv322gv2');

// then we should be able to get the users for the post
p.get('users');
// and the users should be accessible as a resource
users.find();

// update like this
p.set('name', 'new name');
posts.update('2342353sdvdfv322gv2', {name: 'new name'});
posts.upsert('2342353sdvdfv322gv2', {});


