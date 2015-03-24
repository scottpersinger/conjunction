# conjunction

Conjunction allows simple construction of data pipelines for moving and transforming data. 
Each pipeline is assembled as a sequence of components. Data messages pass automatically from each
component to the next.

Components are simply functions which can add messages to the pipeline, remove messages, or
transform messages.

## Example

This simple pipeline adds the string 'hello world' as a message, plus the rows from querying a table,
then prints all messages.

```javascript
p = new Pipeline();
p.use(function() {
	return 'hello world';
});
p.use(new database.query('select * from mirror_herokuuser', 'database1'));
p.use(util.print);

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

## Messages

Messages are simple JSON objects passed through the pipeline. For efficiency messages are passed
as a single input to the component, except for single-arg components where each message will be
passed in individually.

## Async components

Asynchronous components may invoke their callback multiple times, in which case the remainder
of the pipeline will be executed for each call. This is useful for components which may generate
a lot of data, like a database query, so that the pipeline can operate on batches of results
rather than having to buffer the entire result set.

## Triggers

A pipeline must be started with a **trigger**. Triggers activate the pipeline, and may supply
0 or more initial messages. The `once` trigger is good for run-once scripts, while the `timer`
trigger can run a pipeline on an interval. The `http_get` and `http_post` triggers are activated
by HTTP calls and will provide their inputs as message(s) to the pipeline.

## Configuration

By convention the `context` argument contains a `config` key with global configuration. Call
`Pipeline.configure(config)` to set the configuration on the pipeline. Components may
save values they want to re-use  (such as a db connection) on the `context` for later use.
