# amqplib — AMQP 0.9.1 Client for Node.js (TypeScript)

## Overview

- **Verified against:** amqplib **v2.3.1** (2026-11-08). Option names below were read from
  `lib/`, `index.d.ts` and `lib/properties.d.ts` at that tag.
- **Installation:** `npm install amqplib`
- **Node.js:** v18+ required (`package.json` `engines.node: ">=18"`)
- **RabbitMQ:** 4.1.0+ required (for amqplib 0.10.7+)
- **Language:** JavaScript / TypeScript (built-in TypeScript types)
- **License:** MIT
- **GitHub:** https://github.com/amqp-node/amqplib
- **API Reference:** https://amqp-node.github.io/amqplib/
- **Changelog:** https://github.com/amqp-node/amqplib/blob/main/CHANGELOG.md

Does not implement AMQP 1.0 or AMQP 0-10. Production-ready, stable APIs.

> **Upgrade past 2.2.x for the frame-handling security fix.** v2.3.0 addresses
> GHSA-37f9-7m79-6866, a denial of service reachable by a malicious or non-compliant broker:
> a `connection.tune` with `frameMax` below the protocol minimum of 4096 made the first
> publish of 2048 bytes or more spin in `sendContent` until memory ran out. Such a tune is
> now rejected with `Server frameMax N is below the protocol minimum 4096`.

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

**ConnectionOptions interface** (the `Options.Connect` fields live in
`lib/properties.d.ts`, not `index.d.ts`):

```typescript
interface ConnectionOptions {
  protocol?: string;       // Override protocol (e.g., 'amqp' or 'amqps')
  hostname?: string;       // Override hostname
  port?: number;           // Override port
  username?: string;       // Override username
  password?: string;       // Override password
  locale?: string;         // Override locale for error messages
  frameMax?: number;       // Outgoing frame size to negotiate (default 131072)
  maxFrameSize?: number;   // Cap on INCOMING frames (since 2.3.0; see below)
  heartbeat?: number;      // 0 disables heartbeats outright (2.0.0 breaking change)
  socketOptions?: SocketOptions;
  recovery?: RecoveryOptions;
  clientProperties?: Record<string, string>;
}
```

**`maxFrameSize` (v2.3.0+, GHSA-37f9-7m79-6866).** Before 2.3.0 the client trusted the
size in an incoming frame header and would buffer — and repeatedly re-copy — up to the
4 GiB that header can declare. `maxFrameSize` bounds accepted frame payload from the header
alone, defaulting to 64 MiB (or the negotiated `frameMax` when that is larger); `0` disables
the limit. An oversized frame is refused with `Frame size N exceeds maxFrameSize M` and the
connection closes. It is validated at `connection.open`: the value must be `0` or an integer
of at least 4096, otherwise you get
`maxFrameSize must be 0 (no limit) or an integer of at least 4096; got X`.

It is also settable as a URL query parameter (`amqp://host?maxFrameSize=1048576`); a
non-numeric value there parses to `NaN` and fails validation.

**Upgrade note:** a broker that legitimately sends an unsplit frame larger than the limit
(see amqplib #784) now has that connection closed. Raise the value or pass
`maxFrameSize: 0` to restore the old behaviour — prefer raising it over disabling it.

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
  maxDelay: number;           // ms cap on the retry delay
  factor: number;             // backoff multiplier
  jitter: number;             // randomization factor
  maxRetries: number;         // max retries (Infinity = unlimited)
  initialMaxRetries?: number; // since 2.2.0: separate bound for retries BEFORE the first
                              // successful connect, so startup can fail fast while
                              // steady-state recovery retries indefinitely
  waitForConnect?: boolean;   // since 2.1.0: when false, connect() resolves with the
                              // recovering model immediately instead of waiting for the
                              // first successful connection
  calculateDelay?: (attempt: number) => number; // since 2.2.0: custom backoff (full
                              // jitter, decorrelated jitter, fixed schedule). When set,
                              // maxDelay is NOT applied to its result; throwing or
                              // returning an invalid value gives up as if maxRetries ran out
  async setup(model: Connection): Promise<void>;  // recreate topology after reconnect
}
```

With `waitForConnect: false`, `connect()` returns before the broker is reachable, so
`connect`, `connect-failed` and `reconnect-scheduled` listeners can be attached before the
first attempt, and `close()` can cancel it. Await the first connection explicitly with the
`waitForConnect(): Promise<this>` **method** on the returned recovering model (note the
option and the method share the name — they are different things).

The built-in delay now genuinely respects `maxDelay`: the cap used to be applied *before*
jitter, so delays could overshoot it by up to the jitter fraction. With defaults the
steady-state delay now spreads over 20–30 s rather than 24–36 s. Operations attempted after
recovery gives up (`reconnect-failed`) reject with that failure instead of hanging forever.

```typescript
// Fail fast on a bad broker at boot, then keep retrying at runtime.
const model = await amqplib.connect(url, {
  recovery: {
    initialDelay: 200, maxDelay: 5000, factor: 2, jitter: 0.2,
    initialMaxRetries: 3,   // give up quickly if we never connected at all
    maxRetries: 1000,       // ~1.4 days at the 20-30s steady-state delay; use Infinity
                            // only if you also alert on 'reconnect-scheduled'
    async setup(m) { /* re-declare topology */ },
  },
});
```

Bound `maxRetries` deliberately. An unbounded value (`Infinity`) keeps a process limping
while its consumers are silently dead, so pair it with a `reconnect-scheduled` counter and a
`reconnect-failed` alert; otherwise choose a budget that is long enough to ride out a planned
broker restart and short enough that a genuinely lost broker still surfaces. Note
`calculateDelay`, when set, bypasses `maxDelay` and is not bounded by it either — bound it
inside your own function.

```typescript
import amqplib, { Connection } from 'amqplib';

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
| `Frame size N exceeds maxFrameSize M`, connection closed | Broker sent an unsplit frame above the 64 MiB default; raise `maxFrameSize` or set it to `0` (2.3.0+) |
| `Server frameMax N is below the protocol minimum 4096` | Non-compliant broker `connection.tune`; this is the GHSA-37f9-7m79-6866 guard — fix the broker config rather than the client |
| `publish()` returns but the broker closes the connection with 541 `INTERNAL_ERROR` | An encoded headers/`arguments` table crossed the 64 KiB encoding buffer. From 2.3.1 `publish` throws `RangeError: Encoded field table (headers or arguments) exceeds the N byte encoding buffer` instead of truncating silently |
| `waitForConfirms` never calls back | Pre-2.2.1 bug when invoked after the confirm channel closed with unconfirmed messages; it now yields a `channel closed` error. The callback is also required in the TS declarations |
| `channel.cancel()` gives you `{}` | Pre-2.2.1 typed the reply as `Replies.Empty`; it is now `Replies.Cancel` (`{ consumerTag }`) in both APIs |

---

## External Resources

- **Full API Reference:** https://amqp-node.github.io/amqplib/channel_api.html
- **Changelog:** https://github.com/amqp-node/amqplib/blob/main/CHANGELOG.md
- **Repository:** https://github.com/amqp-node/amqplib
- **Issues:** https://github.com/amqp-node/amqplib/issues
