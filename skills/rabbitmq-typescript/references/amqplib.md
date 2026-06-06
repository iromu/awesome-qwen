# amqplib — AMQP 0.9.1 Client for Node.js (TypeScript)

## Overview

- **Installation:** `npm install amqplib`
- **Node.js:** v18+ required
- **RabbitMQ:** 4.1.0+ required (for amqplib 0.10.7+)
- **Language:** JavaScript / TypeScript (built-in TypeScript types)
- **License:** MIT
- **GitHub:** https://github.com/amqp-node/amqplib
- **API Reference:** https://amqp-node.github.io/amqplib/
- **Changelog:** https://github.com/amqp-node/amqplib/blob/main/CHANGELOG.md

Does not implement AMQP 1.0 or AMQP 0-10. Production-ready, stable APIs.

---

## TypeScript Setup

amqplib ships with built-in TypeScript definitions — no separate `@types/amqplib` package needed.

```typescript
import amqplib, { Connection, Channel, Message } from 'amqplib';
```

For strict TypeScript projects, ensure `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

---

## API Styles

### Promise/Async API (Recommended for TypeScript)

```typescript
import amqplib, { Connection, Channel } from 'amqplib';

const connection: Connection = await amqplib.connect('amqp://localhost');
const channel: Channel = await connection.createChannel();
```

### Callback API

```typescript
import amqplib from 'amqplib/callback_api';

amqplib.connect('amqp://localhost', (err: Error | null, connection: Connection | null) => {
  if (err) throw err;
  if (!connection) throw new Error('Connection failed');
  connection.createChannel((err: Error | null, channel: Channel | null) => {
    if (err) throw err;
    if (!channel) throw new Error('Channel creation failed');
    // ...
  });
});
```

Both APIs provide identical functionality. The async version is recommended for modern Node.js and TypeScript.

---

## Connection

### Connecting

```typescript
import amqplib, { ConnectionOptions } from 'amqplib';

const connection: Connection = await amqplib.connect(url: string, options?: ConnectionOptions);
```

**ConnectionOptions interface:**

```typescript
interface ConnectionOptions {
  protocol?: string;       // Override protocol (e.g., 'amqp' or 'amqps')
  hostname?: string;       // Override hostname
  port?: number;           // Override port
  username?: string;       // Override username
  password?: string;       // Override password
  locale?: string;         // Override locale for error messages
  socketOptions?: SocketOptions;
  recovery?: RecoveryOptions;
  clientProperties?: Record<string, string>;
}
```

### Connection Events

```typescript
connection.on('error', (err: Error) => { /* protocol errors */ });
connection.on('connect', () => { /* connected */ });
connection.on('disconnect', (info?: { error?: Error }) => { /* disconnected */ });
connection.on('handler-error', (err: Error, event: string) => {
  console.error(`Uncaught exception in connection ${event} listener:`, err);
});
```

### Opt-in Recovery (Automatic Reconnection)

```typescript
import amqplib, { Connection } from 'amqplib';

interface RecoveryOptions {
  initialDelay: number;       // ms before first retry
  maxDelay: number;           // ms between retries (max)
  factor: number;             // backoff multiplier
  jitter: number;             // randomization factor
  maxRetries: number;         // max retries (Infinity = unlimited)
  async setup(model: Connection): Promise<void>;  // recreate topology after reconnect
}

const connection: Connection = await amqplib.connect(url, {
  recovery: {
    initialDelay: 200,
    maxDelay: 5000,
    factor: 2,
    jitter: 0.2,
    maxRetries: Infinity,
    async setup(model) {
      const channel: Channel = await model.createChannel();
      await channel.assertQueue('tasks', { durable: true });
      await channel.prefetch(10);
      await channel.consume('tasks', async (msg: Message | null) => {
        if (msg) {
          console.log(msg.content.toString());
          channel.ack(msg);
        }
      });
    }
  }
});
```

### TLS Connection

```typescript
import * as fs from 'fs';
import amqplib, { Connection } from 'amqplib';

const connection: Connection = await amqplib.connect('amqps://localhost', {
  socketOptions: {
    tls: () => import('tls').then((tls) => ({
      ca: [fs.readFileSync('/path/to/ca.pem')],
      cert: fs.readFileSync('/path/to/client-cert.pem'),
      key: fs.readFileSync('/path/to/client-key.pem'),
      rejectUnauthorized: true
    }))
  }
});
```

---

## Channel Operations

### Creating a Channel

```typescript
import { Channel } from 'amqplib';

const channel: Channel = await connection.createChannel();
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
import { ExchangeType } from 'amqplib';

type ExchangeType = 'direct' | 'topic' | 'fanout' | 'headers' | 'default' | string;

interface AssertExchangeOptions {
  durable?: boolean;        // Persist across restarts (default: true)
  autoDelete?: boolean;     // Delete when last queue unbound (default: false)
  internal?: boolean;       // Not accepting publisher messages
  arguments?: Record<string, string | number | boolean | null>;
}

await channel.assertExchange(exchange: string, type: ExchangeType, options?: AssertExchangeOptions);
```

### Publishing to an Exchange

```typescript
import { PublisherProperties } from 'amqplib';

channel.publish(
  exchange: string,
  routingKey: string,
  content: Buffer | string,
  options?: PublisherProperties
): boolean;
```

**PublisherProperties interface:**

```typescript
interface PublisherProperties {
  headers?: Record<string, any>;
  contentType?: string;          // MIME content type
  contentEncoding?: string;      // MIME content encoding
  deliveryMode?: 1 | 2;          // 1 = transient, 2 = persistent
  priority?: number;             // 0-255
  correlationId?: string;        // For RPC
  replyTo?: string;              // Queue name for RPC replies
  expiration?: string;           // Message expiration time
  messageId?: string;            // Message ID
  timestamp?: number;            // Message timestamp
  type?: string;                 // Message type
  userId?: string;               // User ID
  appId?: string;                // Application ID
  mandatory?: boolean;           // Return if unroutable
  immediate?: boolean;           // Request immediate delivery
}
```

**Return value:** `true` if the internal buffer is full — signals backpressure. Listen for the `drain` event.

### Publishing to a Queue (Direct)

```typescript
channel.sendToQueue(
  queue: string,
  content: Buffer | string,
  options?: PublisherProperties
): boolean;
```

Shorthand for `publish('', routingKey, content, options)`.

---

## Queues

### Declaring a Queue

```typescript
import { ConsumeOptions, AssertQueueOptions } from 'amqplib';

interface AssertQueueOptions {
  durable?: boolean;         // Survive broker restart (default: false)
  exclusive?: boolean;       // Connection-only (default: false)
  autoDelete?: boolean;      // Delete when last consumer unsubscribes (default: false)
  arguments?: Record<string, string | number | boolean | null>;
  timeout?: number;          // Operation timeout
}

interface QueueResult {
  queue: string;             // Queue name (generated if not provided)
  messageCount: number;      // Messages in queue
  consumerCount: number;     // Consumers on queue
}

const result: QueueResult = await channel.assertQueue(
  queue?: string,            // Empty string = auto-generate
  options?: AssertQueueOptions
);
```

**Common Queue Arguments:**

```typescript
const queueArgs = {
  'x-dead-letter-exchange': 'dlx',           // Dead letter exchange
  'x-dead-letter-routing-key': 'dl-key',     // DLX routing key
  'x-message-ttl': 60000,                     // 60s per-message TTL
  'x-max-length': 10000,                      // Max 10,000 messages
  'x-max-length-bytes': 50 * 1024 * 1024,     // 50MB max size
  'x-queue-type': 'quorum',                   // Queue type
  'x-delivery-limit': 5,                      // Max delivery attempts (quorum)
  'x-consumer-timeout': 300000,               // Consumer inactivity timeout (quorum)
  'x-max-priority': 10,                       // Max priority level
};
```

### Consuming Messages

```typescript
import { ConsumeOptions, Message } from 'amqplib';

interface ConsumeOptions {
  noAck?: boolean;           // Auto-ack (default: false)
  exclusive?: boolean;       // Exclusive consumer (default: false)
  prefetch?: number;         // Per-consumer prefetch count
  consumerArguments?: Record<string, any>;
  consumerTag?: string;      // Custom consumer tag
}

const consumerTag: string = await channel.consume(
  queue: string,
  onMessage: (msg: Message | null) => void | Promise<void>,
  options?: ConsumeOptions
);
```

**Message interface:**

```typescript
interface Message {
  content: Buffer;
  fields: {
    deliveryTag: number;
    redelivered: boolean;
    exchange: string;
    routingKey: string;
    messageId?: string;
    correlationId?: string;
    replyTo?: string;
    contentType?: string;
    contentEncoding?: string;
    headers?: Record<string, any>;
    priority?: number;
    type?: string;
    appId?: string;
    userId?: string;
  };
  properties: Record<string, any>;
}
```

**Consumer cancellation:** When `msg === null`, the consumer has been cancelled (e.g., queue deleted).

### Acknowledging Messages

```typescript
channel.ack(message: Message);                    // Single ack
channel.ackAll();                                 // Ack all unacked
channel.nack(message: Message, requeue?: boolean); // Single nack
channel.nackAll(requeue?: boolean);               // Nack all unacked
channel.reject(message: Message, requeue?: boolean); // Reject single message
```

---

## Channel-Level Operations

### QoS (Prefetch)

```typescript
await channel.prefetch(
  count: number,      // 0 = unlimited
  global: boolean     // false = per-consumer, true = global
);
```

### Consumer Priority

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
  source: string,             // Source exchange
  destination: string,        // Destination queue/exchange
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

Enable confirms on the channel:

```typescript
await channel.confirm();
```

After `confirm()`, all published messages are acknowledged or rejected by the broker.

### Handling Confirmations

```typescript
// Check return value for backpressure
const result: boolean = channel.publish(exchange, routingKey, content, options);
if (!result) {
  // Buffer is full — back off
  channel.once('drain', () => {
    // Resume publishing
  });
}
```

The channel emits `connect` and `close` events during confirm mode.

---

## Complete TypeScript Example

```typescript
import amqplib, { Connection, Channel, Message } from 'amqplib';

interface Order {
  orderId: number;
  status: string;
  timestamp: number;
}

class RabbitMQService {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async connect(url: string = 'amqp://localhost'): Promise<void> {
    this.connection = await amqplib.connect(url, {
      clientProperties: { connection_name: 'awesome-qwen-app' }
    });

    this.connection.on('error', (err: Error) => console.error('Connection error:', err));
    this.connection.on('close', () => console.log('Connection closed'));

    this.channel = await this.connection.createChannel();
    this.channel.on('error', (err: Error) => console.error('Channel error:', err));
    await this.channel.confirm();
  }

  async setupExchangeAndQueue(): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    await this.channel.assertExchange('orders', 'direct', { durable: true });
    await this.channel.assertQueue('order-processing', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'order-dlx',
        'x-message-ttl': 60000,
        'x-max-length': 10000
      }
    });
    await this.channel.bindQueue('order-processing', 'orders', 'order.created');

    await this.channel.assertExchange('order-dlx', 'fanout', { durable: true });
    await this.channel.assertQueue('order-failed', { durable: true });
    await this.channel.bindQueue('order-failed', 'order-dlx', '');
  }

  async publishOrder(order: Order): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    const result: boolean = this.channel.publish(
      'orders', 'order.created',
      Buffer.from(JSON.stringify(order)),
      { contentType: 'application/json', deliveryMode: 2, messageId: `order-${order.orderId}` }
    );

    if (!result) {
      await new Promise<void>((resolve) => { this.channel!.once('drain', () => resolve()); });
      this.channel.publish(
        'orders', 'order.created',
        Buffer.from(JSON.stringify(order)),
        { contentType: 'application/json', deliveryMode: 2 }
      );
    }
  }

  async consumeOrders(handler: (order: Order) => Promise<void>): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');
    await this.channel.prefetch(10);

    await this.channel.consume('order-processing', async (msg: Message | null) => {
      if (!msg) return;
      try {
        const order: Order = JSON.parse(msg.content.toString());
        await handler(order);
        this.channel!.ack(msg);
      } catch (error) {
        console.error('Failed to process order:', error);
        this.channel!.nack(msg, false);
      }
    });
  }

  async close(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Ensure RabbitMQ is running (`rabbitmq-server`) |
| Channel exceptions | Check queue/exchange names, permissions, and arguments |
| Buffer full | Check return value of `publish()`/`sendToQueue()`; listen for `drain` events |
| Silent failures | Always register `handler-error` listeners on connections and channels |
| Missing confirmations | Ensure `channel.confirm()` was called before publishing |
| TypeScript type errors | amqplib ships with built-in types; don't install `@types/amqplib` |
| Consumer not receiving messages | Check binding keys, routing keys, and queue durability |

---

## External Resources

- **Full API Reference:** https://amqp-node.github.io/amqplib/channel_api.html
- **Changelog:** https://github.com/amqp-node/amqplib/blob/main/CHANGELOG.md
- **Repository:** https://github.com/amqp-node/amqplib
- **Issues:** https://github.com/amqp-node/amqplib/issues
