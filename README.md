ember-simple-data
=================

attempt to make ember-data easier to use in different scenarios by making it do less

the basic plan:

- have a 'store' which is totally detached from a persistance layer
- this store will be a cache of objects that have basic relationships, belongs_to and has_many
- all the associated methods to find, filter, insert, update objects in the store
- develop a persistance method to sit on top of a store, using store apis so we can pick and manage them totally separate
- accessing data through persistance layer will return the object in store, go and fetch and the observed store result will update later
- unlike ember-data the store should know nothing about the persistance (adapter) layer
- follow a modular patter, have no global pollution
- make it super simple and well documented

