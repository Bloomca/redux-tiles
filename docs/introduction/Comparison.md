# Comparison

So, what makes Redux-Tiles special? There are a lot of libraries which follow exactly the same goal – to ease the burden of boilerplate code for Redux, and to provide convenient abstractions. From my point of view, they fall into two traps – they are either not very helpful (e.g. generating only reducer by given constant), or either they are literally in-memory databases, with query engines, classes for data and different relations under the hood; if you want to somehow use underlying principles (for instance, get particular constant, or some action), you will likely fail.

Redux-Tiles tries to fit exactly in between – it tries to provide all capabilities of Redux, while hiding tedious parts. It has several constraints:
- no constants by hand: you can retrieve them after creation of a tile, but you can't provide your own
- no merging by hand: all data is merged automatically at the given level of nesting
- full dependency injection: it encourages to put all needed objects inside middleware, so it is very easy to test it later
