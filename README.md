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
// USAGE
SD.attribute(data_source_key)  // data_source_key is optional here, it will default to your defined key
SD.has_many(data_source_key, store_name)
SD.belongs_to(data_source_key, store_name)


users.define({
	name: SD.attribute(),
	comments: SD.has_many('comment_ids', 'comment')
});

comments.define({
	text: SD.attribute(),
	post: SD.belongs_to('user_id', 'user')
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

```js
comments.find(); // get all currently in store
comments.find(1701); // specific object if it exists
```

If you just want to know if an id exists in your store you can use `contains()`

```js
comments.contains(123451235); // false
comments.contains(1701); // true
```

### Accessing object attributes

The objects are loaded into the store as instances of Ember.Object so you will need to use `.get()` so that all the observer functions fire properly, especially with the relationship attributes.

```js
comments.find(22).get('_id'); // 22
comments.find(22).get('text'); // 'Greetings from planet Earth.'
comments.find(22).get('user'); // The user object that this post belongs to
comments.find(22).get('user').get('name'); // 'Riker'
// and Ember has shortcuts to fetch attributes using dot notation
comments.find(22).get('user.name'); // 'Riker'
```

### Using different data source attribute keys
Because we use Ember.Object for our records there are a number of reserved keys for Ember methods and such. If you try and use one as an attribute it will throw an error

```js
users.define({
	name: SD.attribute(),
	set: SD.attribute()    // Error: user.set is a reserved key, can not define with it. 
});
```

Since we shouldn't have to change the source output data in order to be able to use it we can set a different key to find the data on like so

```js
users.define({
	name: SD.attribute(),
	_set: SD.attribute('set')
});

users.load({
	_id: 1
	name: 'Picard',
	set: 'Belongs to data set 1701.'
});

// we have to use our defined key to get and set in the app
users.find(1).get('_set'); // 'Belongs to data set 1701.'
users.find(1).set('_set', 'Belongs to data set 1.');

// json output is the same but we can tell it to use the data source keys
users.to_json(users.find(1))._set; // 'Belongs to data set 1.'
users.to_json(users.find(1), {use_source_keys:true}).set; // 'Belongs to data set 1.'
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


