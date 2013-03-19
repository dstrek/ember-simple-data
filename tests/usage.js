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
	comments: SD.has_many('comment'),
	user: SD.belongs_to('user')
});

comments.define({
	content: SD.attribute(),
	post: SD.belongs_to('post'),
	user: SD.belongs_to('user')
});

users.define({
	name: SD.attribute(),
	email: SD.attribute(),
	posts: SD.has_many('post'),
	comments: SD.has_many('comment')
});

