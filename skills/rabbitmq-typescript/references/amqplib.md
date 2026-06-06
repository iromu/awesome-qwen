# amqplib — AMQP 0.9.1 Client for Node.js

## Overview

- **Installation:** `npm install amqplib`
- **Node.js:** v18+ required
- **RabbitMQ:** 4.1.0+ required (for amqplib 0.10.7+)
- **Language:** JavaScript (95.8%), TypeScript (3.9%)
- **License:** MIT
- **GitHub:** https://github.com/amqp-node/amqplib
- **API Reference:** https://amqp-node.github.io/amqplib/

Does not implement AMQP 1.0 or AMQP 0-10. Production-ready, stable APIs.

---

## API Styles

### Promise/Async API (Recommended)

```typescript
import amqplib, { Connection, Channel } from 'amqplib';

const connection: Connection = await amqplib.connect('amqp://localhost');
const channel: Channel = await connection.createChannel();
```

### Callback API

```typescript
import amqplib from 'amqplib/callback_api';

amqplib.connect('amqp://localhost', (err, connection) => {
  if (err) throw err;
  connection.createChannel((err, channel) => {
    // ...
  });
});
```

Both APIs provide identical functionality. The async version is recommended for modern Node.js.

---

## Connection

### Connecting

```typescript
const connection = await amqplib.connect(url: string, options?: ConnectionOptions);
```

**Connection Options:**
- `protocol`: Override the protocol in the URL (e.g., `'amqp'` or `'amqps'`)
- `hostname`: Override the hostname
- `port`: Override the port
- `username`: Override the username
- `password`: Override the password
- `locale`: Override the locale (for error messages)
- `socketOptions`: Options for the underlying socket
- `recovery`: Configuration for automatic reconnection (see below)

### Connection Events

```typescript
connection.on('error', (err: Error) => { /* protocol errors */ });
connection.on('connect', () => { /* connected */ });
connection.on('disconnect', (err?: Error) => { /* disconnected */ });
connection.on('handler-error', (err: Error, event: string) => {
  console.error(`Uncaught exception in connection ${event} listener:`, err);
});
```

### Opt-in Recovery (Automatic Reconnection)

```typescript
const connection = await amqplib.connect(url, {
  recovery: {
    initialDelay: 200,    // ms before first retry
    maxDelay: 5000,       // ms between retries (max)
    factor: 2,            // backoff multiplier
    jitter: 0.2,          // randomization factor
    maxRetries: Infinity, // max retries (Infinity = unlimited)
    async setup(model) {  // called after each successful (re)connect
      // Recreate channels, queues, exchanges, consumers here
      const ch = await model.createChannel();
      await ch.assertQueue('my-queue', { durable: true });
      await ch.consume('my-queue', (msg) => {
        if (msg) {
          console.log(msg.content.toString());
          ch.ack(msg);
        }
      });
    }
  }
});
```

---

## Channel Operations

### Creating a Channel

```typescript
const channel = await connection.createChannel();
```

### Error Handling

```typescript
channel.on('error', (err: Error) => { /* protocol errors */ });
channel.on('handler-error', (err: Error, event: string) => {
  console.error(`Uncaught exception in channel ${event} listener:`, err);
});
```

Without `handler-error` listeners, throws in user callbacks may silently fail or close the channel.

---

## Exchanges

### Declaring an Exchange

```typescript
await channel.assertExchange(
  exchange: string,       // exchange name
  type: 'direct' | 'topic' | 'fanout' | 'headers' | 'default' | string,
  options?: ExchangeOptions
);
```

**Exchange Options:**
- `durable`: true if declared persistently (default: true)
- `autoDelete`: true if deleted when last queue unbound (default: false)
- `internal`: true if exchange is not accepting publisher messages
- `arguments`: Additional arguments for RabbitMQ extensions

### Publishing to an Exchange

```typescript
channel.publish(
  exchange: string,
  routingKey: string,
  content: Buffer | string,
  options?: PublisherOptions
): boolean;
```

**Publisher Options:**
- `headers`: Message headers
- `contentType`: MIME content type
- `contentEncoding`: MIME content encoding
- `deliveryMode`: 1 (transient) or 2 (persistent)
- `priority`: Message priority (0-255)
- `correlationId`: Correlation ID (for RPC)
- `replyTo`: Queue name for replies (for RPC)
- `expiration`: Message expiration time
- `messageId`: Message ID
- `timestamp`: Message timestamp
- `type`: Message type
- `userId`: User ID
- `appId`: Application ID
- `mandatory`: Return message if unroutable
- `immediate`: Request immediate delivery to consumer

**Return value:** `true` if the internal buffer is full — signals the client to back off until a `drain` event.

### Publishing to a Queue (Direct)

```typescript
channel.sendToQueue(
  queue: string,
  content: Buffer | string,
  options?: PublisherOptions
): boolean;
```

This is a shorthand for `publish('', routingKey, content, options)`.

---

## Queues

### Declaring a Queue

```typescript
const { queue, messageCount, consumerCount } = await channel.assertQueue(
  queue?: string,         // queue name (empty string = auto-generate)
  options?: QueueOptions
);
```

**Queue Options:**
- `durable`: true if queue should survive broker restart (default: false)
- `exclusive`: true if queue is for this connection only (default: false)
- `autoDelete`: true if deleted when last consumer unsubscribes (default: false)
- `arguments`: Queue arguments (e.g., `x-dead-letter-exchange`, `x-max-length`, `x-message-ttl`)

**Returns:**
- `queue`: The queue name (generated if not provided)
- `messageCount`: Number of messages in the queue
- `consumerCount`: Number of consumers on the queue

### Consuming Messages

```typescript
const consumerTag = await channel.consume(
  queue: string,
  onMessage: (msg: Message | null) => void,
  options?: ConsumeOptions
): string;
```

**Consume Options:**
- `noAck`: true if messages are auto-acknowledged (default: false)
- `exclusive`: true for exclusive consumer (default: false)
- `prefetch`: Set prefetch count for this consumer (default: 0, uses channel-level)
- `consumerArguments`: Additional consumer arguments
- `consumerTag`: Custom consumer tag

**Message object:**
```typescript
interface Message {
  content: Buffer;
  properties: MessageProperties;
  fields: {
    deliveryTag: number;
    redelivered: boolean;
    exchange: string;
    routingKey: string;
    messageId?: string;
    correlationId?: string;
    replyTo?: string;
    contentType?: string;
    headers?: Record<string, any>;
  };
}
```

**Consumer cancellation:** When `msg === null`, the consumer has been cancelled (e.g., queue deleted).

### Acknowledging Messages

```typescript
channel.ack(message: Message);                    // single ack
channel.ackAll();                                 // ack all unacked
channel.nack(message: Message, requeue?: boolean); // single nack
channel.nackAll(requeue?: boolean);               // nack all unacked
channel.reject(message: Message, requeue?: boolean); // reject single message
```

---

## Channel-Level Operations

### QoS (Prefetch)

```typescript
await channel.prefetch(
  count: number,      // prefetch count (0 = unlimited)
  global: boolean     // apply globally (default: false, per-consumer)
);
```

### Setting the Consumer Priority

```typescript
await channel.consumePriority(queue, priority, callback, options);
```

### Canceling a Consumer

```typescript
await channel.cancel(consumerTag: string);
```

### Asserting a Binding

```typescript
await channel.assertBinding({
  source: string,       // source exchange
  destination: string,  // destination queue/exchange
  routingKey: string,
  arguments?: Record<string, any>
});
```

### Removing Bindings

```typescript
await channel.unbind({ source, destination, routingKey, arguments? });
```

### Checking a Queue

```typescript
const { queue, messageCount, consumerCount } = await channel.checkQueue(queue);
```

### Purging a Queue

```typescript
await channel.purgeQueue(queue);
```

### Deleting a Queue

```typescript
await channel.deleteQueue(queue, ifUnused?: boolean);
```

### Deleting an Exchange

```typescript
await channel.deleteExchange(exchange, ifUnused?: boolean);
```

---

## Publisher Confirms

Publisher confirms are enabled on the channel:

```typescript
await channel.confirm();
```

After calling `confirm()`, all published messages will be acknowledged or rejected by the broker. The channel emits events:

```typescript
channel.on('connect', () => { /* connected */ });
channel.on('close', () => { /* closed */ });
```

For handling confirmations, check the return value of `publish()` and `sendToQueue()` — they return `true` if the internal buffer is full.

---

## TypeScript Support

amqplib ships with TypeScript definitions. Install as a dependency:

```bash
npm install amqplib
```

The types are included in the package — no separate `@types/amqplib` needed.

---

## Complete Example

```typescript
import amqplib from 'amqplib';

async function main() {
  const connection = await amqplib.connect('amqp://localhost');
  connection.on('error', (err) => console.error('Connection error:', err));
  connection.on('close', () => console.log('Connection closed'));

  const channel = await connection.createChannel();
  channel.on('error', (err) => console.error('Channel error:', err));

  // Declare exchange
  await channel.assertExchange('logs', 'topic', { durable: true });

  // Declare queue
  const { queue } = await channel.assertQueue('error_logs', { durable: true });

  // Bind queue to exchange
  await channel.bindQueue('logs', queue, '*.error');

  // Consume messages
  await channel.consume(queue, (msg) => {
    if (msg) {
      console.log('Received:', msg.content.toString());
      channel.ack(msg);
    }
  }, { noAck: false });

  // Publish a message
  channel.publish(
    'logs',
    'app.error',
    Buffer.from('Application error occurred'),
    { deliveryMode: 2 } // persistent
  );

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
}

main().catch(console.error);
```

---

## Troubleshooting

- **Connection refused:** Ensure RabbitMQ is running (`rabbitmq-server`)
- **Channel exceptions:** Check queue/exchange names, permissions, and arguments
- **Buffer full:** Check the return value of `publish()` and listen for `drain` events
- **Silent failures:** Always register `handler-error` listeners on connections and channels
- **Missing confirmations:** Ensure `channel.confirm()` was called before publishing

---

## External Resources

- **Full API Reference:** https://amqp-node.github.io/amqplib/channel_api.html
- **Changelog:** https://github.com/amqp-node/amqplib/blob/main/CHANGELOG.md
- **Troubleshooting:** https://github.com/amqp-node/amqplib/blob/main/README.md (linked in repo)
