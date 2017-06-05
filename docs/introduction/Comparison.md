# Comparison

So, what makes Redux-Tiles special? There are a lot of libraries which follow exactly the same goal – to ease the burden of boilerplate code for Redux, and to provide convenient abstractions. From my point of view, they fall into two traps – they are either not very helpful (e.g. generating only reducer by given constant), or either they are literally in-memory databases, with query engines, classes for data and different relations under the hood; if you want to somehow use underlying principles (for instance, get particular constant, or some action), you will likely fail.

Redux-Tiles tries to fit exactly in between – it tries to provide all capabilities of Redux, while hiding tedious parts. It has several constraints:
- no constants by hand: you can retrieve them after creation of a tile, but you can't provide your own
- no merging by hand: all data is merged automatically at the given level of nesting
- full dependency injection: it encourages to put all needed objects inside middleware, so it is very easy to test it later

Also, it is very important to understand that redux-tiles is not for every project. The idea is to provide simple building blocks, which will be easy to integrate into existing projects, easy to compose and test. They don't assume anything about your data, there is no normalizing functionality, no fancy queries on top of your tiles – in fact, if you need something like that, I recommend you to consider writing your own custom-tailored library. But if you need just to simplify basic stuff, e.g. simple requests to change a password, create a user or fetch list of applications, then this library might be beneficial for you.

You might want to take a look at [examples](../examples/README.md) to get a feel of the library, or go straight to the [API](../api/README.md) to learn all capabilities.