```
$ npm install ember-simple-data
```

### Setup the Simple Store

```js
var SD = require('ember-simple-data');
```

First we need to create some store objects that will house our models. Each store needs a unique name which we will use to reference it. The id keys on your models default to 'id' but you can specify which key to use instead, obviously it must be unique in your data set.

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

Then we need to define the models that will be inserted into the store. This is a description of the attributes on each object and its relationship to other objects you have. The `has_many` and `belongs_to` attribute definitions require you pass the name of the store which these related objects are defined on and which attribute contains the list of ids or id.

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
comments.all(); // returns array of all objects, array auto updated when new objects are loaded
comments.id(1701); // return object proxy of a find by id, will return empty object until id is loaded

// if you don't want an observed array/object returned you can use the internal _find function
comments._find();
comments._find(1701);
```

If you just want to know if an id exists in your store you can use `contains()`

```js
comments.contains(123451235); // false
comments.contains(1701); // true
```

### Accessing object attributes

The objects are loaded into the store as instances of Ember.Object so you will need to use `.get()` so that all the observer functions fire properly, especially with the relationship attributes.

```js
comments.id(22).get('_id'); // 22
comments.id(22).get('text'); // 'Greetings from planet Earth.'
comments.id(22).get('user'); // The user object that this post belongs to
comments.id(22).get('user').get('name'); // 'Riker'
// and Ember has shortcuts to fetch attributes using dot notation
comments.id(22).get('user.name'); // 'Riker'
```

### Loading embedded objects

The difference here is that instead of an array of `comment_ids` it's an array of objects on the `comments` attribute. This will load the comments into the comment store and then add the ids to the `comment_ids` array on the user object. You must at this point in time also provide the relationships inside the comment object as though you were loading the comments in a non-embedded fashion.

```js
users.load({
	_id: 'troi',
	name: 'Troi',
	comments: [{
		_id: 1701,
		text: 'This is a stupid comment.',
		user_id: 'troi'
	}]
});
```

## more to come


