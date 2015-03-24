# conjunction

Conjunction allows simple construction of data pipelines for moving and transforming data. 
Each pipeline is assembled as a sequence of components. Data messages pass automatically from each
component to the next.

Components are simply functions which can add messages to the pipeline, remove messages, or
transform messages.

## Example

This simple pipeline prints 'hello world', then queries rows from a table and prints each one.

```javascript
p = new Pipeline();
p.use(util.print('hello world'));
p.use(database.query('select * from users'));
p.use(util.print());

p.trigger(triggers.once);
p.run()
```

## Component signatures

```javascript
function mycomp(msg) {
  // modify 'msg' or return a new value to replace it
}
```

In the simplest form, a component takes a single `msg` argument. Each message in the pipeline will be
passed into the component. The component may modify the message, or return a new message to replace
it.

```javascript
function mycomp(msgs, context) {
  // process array of messages
  // modify msgs in place, or return a new array to replace them
}
```
With this signature the component will be passed a batch of messages on each invocation. The component 
can modify the messages in place, or return a new array to replace all the input messages in the pipeline.

The `context` variable contains context information which is global the pipeline.

```javascript
function mycomp(msgs, context, callback) {
  // You must invoke callback(err, msgs) to continue
}
```

The 3 parameter form allows components to work asynchronously. On completion they should invoke
the `callback` parameter indicating any error or result value. If an array is supplied for
the `msgs` callback parameter then those values will replace the values input values in the pipeline.

