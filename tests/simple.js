require('../vendor/ember-runtime');
var SD = require('../index');

var posts = SD.store.create({
	name: 'post',
	id_key: '_id'
});

posts.load([{
	_id: 'asdf2f2323',
	name: 'test post',
	content: 'hello'
}]);

console.log('all posts', posts.find());
console.log('finding post asdf2f2323', posts.find('asdf2f2323'));


