# Experiment with streaming message bus
This project is an experiment in receiving messages from an HTTP source and pushing them through a message bus. A message can be requeued for further processing such as data transformation or sending onto a data sink (downstream system).

This application is a basic attempt to recreate some of the classic features found in an ESB where messages are received, transformed and send to more than one subscriber.

All events are transient and not at all durable. Use Kafka or some Apache MQ if you need durability. 

The idea is to extend the application by _only_ adding a new process, transformer or data sink. Because each of these components does not not know about the others this makes the system very loosly coupled.

## The current experiment flow
- From a client (such as postman) POST `{"message": "Hello World!"}` to `http://localhost:8080/api/msg/v1/message/welcome`
- The Http controller *message-controller* receives the message and enqueues the message with a source of *welcome*
- The processor *welcome-receiver* transforms the message and it is requeued as *goodbye*
- The processor *goodbye-sender* sends the message to a downstream service using a Http POST. In this case the data sink is _this_ message service calling `http://localhost:8080/api/msg/v1/message/goodbye`.
- The *goodbye* message is received, enqueued (by the controller) and processed by the *goodbye-receiver* processor, which simply prints the message.

## About the code
The core technology is:
- Typescript (which makes reasoning about this stuff just a little bit easier)
- Restify
- Bunyan for logging
- Inversify for dependency injection
- RxJs Subject/Observable pattern
- got for http outbound

### Dynamic processors
The event processors are dynamically discovered and imported into the IoC container. You would just need to add a new file in the process folder, annotate the class *@injectable* and export as default (that is important).

This is pretty interesting. In the future I could see a class export static meta information which could be used to build the container.

See [the container factory](src/container-factory.ts)

### TODO
- Use Hysterix in the data sinks
- Implement back pressure

## Using gulp to do everything
I like gulp, so it does everything.

### Start the engine...
- Checkout this source
- npm install
- npm run develop (or just gulp develop if you have gulp installed globally)

### Cluster
You can also scale in production this using pm2.