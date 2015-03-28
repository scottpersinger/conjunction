# Duality

Duality is a framework for writing and running data transformation pipelines. Pipelines
are built from components that use the Node.js Streams system to move data down the
pipeline, enriching or transforming it as it goes.

Duality makes it easy to create, run, and manage pipeline scripts. It offers sensible
conventions to make it easy to manage and maintain a large library of scripts.

## Example

This simple pipeline queries contact records from a database, and splits each record 
into separate 'person' and 'company' records, then inserts the results into a
second database.

```javascript
p = new Pipeline();
p.use(new database.Query('select * from contacts'));
p.use(function(contact) {
    var companyId = GUID();
    return [
        {
            _headers: {type: 'person'},
            email: contact.email,
            name: contact.firstname + ' ' + contact.lastname
            company_id: companyId
        },
        {
            _headers: {type: 'company'},
            name: contact.compnay_name,
            guid: companyId
        }
    ]
});
p.use(util.Logger());
p.use(new database.insert(null, 'database1'));

p.run()
```

## Features

* Efficient data flow based on Node Streams
* Toolbox of useful input, output, and transform components
* Easy configuration system
* Simple syntax for creating pipelines
* Easily create new, re-usuable components
* Built-in logging system
* Flexible runtime system

## Messages

Duality pipelines operate in objectMode, passing discrete JS objects as messsages. Objects
can use any format. By convention objects may contain a key `_headers` which holds a dictionary
of metadata to describe the message. 

## Components

Components are the basic unit of logic in a pipeline. Components can either generate 
new messages, transform existing messages, or write messages to some output. Duality
includes a set of standard components, and makes it very easy to create new ad-hoc
components from simple functions. It's also possible to construct new re-usuable
components by subclassing the standard classes in the Node `stream` package.

### Ad-hoc components

To create an ad-hoc component, simply pass a function to the `use` method on a 
Pipeline. Synchronous functions are passed each message in the pipeline, and the
return value from the function is passed on down the pipeline:

    p.use(function(msg, context) {
        msg.newkey = 'newvalue';
        return msg;
    });

If you need to return results asynchronously just define your function to take a 
callback second argument:

    p.use(function(msg, context, callback) {
        resource.get(function(rows) {
            rows.forEach(function(row) {
                callback(row, true);
            });
            callback(null);
        });
    });

Invoke the callback with output messages and pass `true` as the second argument
until there are no more messages to generate.

## The `context`

The `context` is a global object available in the pipeline. It is typically used
to pass configuration data into a component. The configuration for the pipeline
is passed to the pipeline constructor, and becomes available under the `config`
key in the context:

    p = new Pipeline('test max', {max:10});
    p.use(function(msg, context) {
        console.log("Max is: ", context.config.max);  <-- prints: Max is 10
    });

Components may add data to the context in order to share that data with other
components. For example, the `database.Connection` components adds the database
connection object to the context.

## Running your pipeline

Any pipeline can be executed by calling `run`:

    p = new Pipeline();
    ...
    p.run();

This works for ad-hoc scripts, but Duality includes support for multiple types
of **triggers**. Triggers activate the pipeline, and may supply
0 or more initial messages. The `timer` trigger can run a pipeline on an 
interval. The `http_get` and `http_post` triggers are activated
by HTTP calls and will provide their inputs as message(s) to the pipeline.

