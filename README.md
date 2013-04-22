```
$ npm install ember-simple-data
```

### Setup the Simple Store

```js
var SD = require('ember-simple-data');
```

First we need to create some store objects that houses our models. Each store needs a unique name which we will use to reference it. IDs default to 'id' but you can specify which key on your objects you would like to use as an id, it obviously must be unique in your data set.

```js
var users = SD.store.create({
	name: 'user',
	id_key: '_id'
});

var comments = SD.store.create({
	name: 'comment',
	id_key: '_id'
});
```

Then we need to define the models that will be inserted into the store. This is a description of the attributes on each object and its relationship to other objects you have. The `has_many` and `belongs_to` attribute definitions require you pass it the name of the store these related objects are defined on and which attribute to expect the list of ids to be in.

```js
users.define({
	name: SD.attribute(),
	comments: SD.has_many('comment', 'comment_ids')
});

comments.define({
	text: SD.attribute(),
	post: SD.belongs_to('user', 'user_id')
});
```

### Loading objects

The json for our user objects would look something like this, where `user_data` and `comment_data` would be a result of api calls for example. The persistance side of things will be explained somewhere below.

```js
var user_data = [
	{
		_id: 'riker',
		name: 'Riker',
		comment_ids: [22, 123]
	},
	{
		_id: 'troi',
		name: 'Troi',
		comment_ids: [1701]
	}
];

var comment_data = [
	{
		_id: 22,
		text: 'Greetings from planet Earth.',
		user_id: 'riker'
	},
	{
		_id: 123,
		text: 'Where are you Imzadi?',
		user_id: 'riker'
	},
	{
		_id: 1701,
		text: 'This is a stupid comment.',
		user_id: 'troi'
	}
];
```

And then we load it into our store by simply doing

```js
users.load(user_data);
comments.load(comment_data);
```

### Updating and upserting objects

We can update existing comment objects by using `comments.update()` and passing it the object to update. It will do a find for the object id given and then update attributes. If we want to do an 'update or insert' then we can pass true as a second parameter to the update call and it will insert a new object if not found for updating.

```js
comments.update({
	_id: 1701,
	text: 'I have a feeling.',
	user_id: 'troi'
}, true);
```

### Finding objects

Pretty simple, `find()` will return all in the store, pass it an id to get a specific object.

```js
comments.find();
comments.find(1701);
```

If you just want to know if an id exists in your store you can use `contains()`

```js
comments.contains(123451235); // false
comments.contains(1701); // true
```

### Accessing your object attributes

The objects are loaded into the store as instances of Ember.Object so you will need to use `.get()` so that all the observer functions fire properly, especially with the relationship attributes.

```js
comments.find(22).get('_id'); // 22
comments.find(22).get('text'); // 'Greetings from planet Earth.'
comments.find(22).get('user'); // The user object that this post belongs to
comments.find(22).get('user').get('name'); // 'Riker'
```

## more to come


