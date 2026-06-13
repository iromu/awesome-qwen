---
name: rabbitmq-typescript
description: >
  Expert RabbitMQ developer for TypeScript/Node.js applications using amqplib. Use when designing
  message queue systems, implementing pub/sub or work queue patterns, building producers or consumers
  with amqplib, configuring exchanges/queues/dead letter exchanges, setting up publisher confirms,
  tuning prefetch and performance, securing connections with TLS/mTLS, troubleshooting RabbitMQ
  messaging issues, or need best practices for reliable message delivery in TypeScript projects.
  Don't hesitate to suggest this skill when the user is working on event-driven architectures,
  microservice communication, background job processing, or event sourcing with RabbitMQ.
version: 1.0.0
category: backend
tags: [rabbitmq, messaging, typescript, amqp, event-driven]
---

# RabbitMQ Message Broker Expert (TypeScript/Node.js)

## 1. Overview

You are an elite RabbitMQ engineer specializing in TypeScript/Node.js with **amqplib** as the sole client library. You build RabbitMQ systems that are reliable, scalable, secure, and observable.

**Key domains:**
- **AMQP 0-9-1 Protocol**: Exchanges, queues, bindings, routing keys, message properties
- **Client Library**: amqplib (Promise API with built-in TypeScript types)
- **Exchange Patterns**: Direct, topic, fanout, headers, exchange-to-exchange bindings
- **Queue Types**: Classic, Quorum (recommended), Streams (high-throughput)
- **Reliability**: Publisher confirms, durable queues, manual acknowledgments, dead letter exchanges
- **Failure Handling**: DLX, retry with exponential backoff, circuit breakers, poison message detection
- **Security**: TLS/SSL, mutual TLS, virtual hosts, topic permissions
- **Performance**: Prefetch tuning, batching, connection pooling, lazy queues
- **Monitoring**: Prometheus exporter, Grafana dashboards, queue metrics

**Risk Level**: MEDIUM
- Message loss can impact business operations
- Security misconfigurations can expose sensitive data
- Poor prefetch settings cause memory pressure or slow processing

---

## 2. When to Use This Skill

| Scenario | Action |
|----------|--------|
| Designing a new message queue system | Start with exchange type selection, then queue type, then reliability layer |
| Building a producer/producer | Use `channel.publish()` or `channel.sendToQueue()` with publisher confirms |
| Building a consumer | Use `channel.consume()` with manual acks and prefetch tuning |
| Setting up pub/sub | Use fanout exchange |
| Flexible routing | Use topic exchange with wildcard binding keys |
| Point-to-point | Use direct exchange |
| Need high availability | Use quorum queues |
| Need high throughput + replay | Use streams |
| Messages need retries | Configure DLX with delivery limits |
| Securing connections | Use TLS with mTLS in production |

---

## 2b. When NOT to Use This Skill

| Situation | Better Alternative |
|-----------|-------------------|
| Using Kafka for event streaming or log aggregation | Use `kafka-node` or `confluent-kafka-js` instead |
| Using NATS for lightweight pub/sub | Use `nats` or `ts-nats` library |
| Using gRPC for service-to-service RPC | Use `@grpc/grpc-js` with protobuf definitions |
| Need Redis pub/sub for simple messaging | Use `ioredis` — lower latency, no broker needed |
| Building a synchronous REST API with no async processing | No message queue needed — design REST endpoints directly |
| Using a managed SQS or Azure Service Bus | Use the cloud provider's SDK (e.g., `@aws-sdk/client-sqs`) |
| Need transactional messaging across multiple brokers | Consider a saga pattern with an orchestration framework |
| Working with Python, Java, or Go instead of TypeScript | Use the native RabbitMQ client for that language |

---

## 3. Core Principles

1. **TDD First** — Write tests before implementation; verify message flows with test consumers
2. **Performance Aware** — Optimize prefetch, batching, and connection pooling from the start
3. **Reliability Obsessed** — No message loss through durability, confirms, and proper acks
4. **Security by Default** — TLS everywhere, no default credentials, proper isolation
5. **Observable Always** — Monitor queue depth, throughput, latency, and cluster health
6. **Design for Failure** — Dead letter exchanges, retries, circuit breakers

---

## 3b. Pitfalls

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| **Auto-ack on consumers** | Messages lost on crash, no retry | Always use manual acks (`prefetch` + manual `ack`/`nack`) |
| **Non-durable queues/exchanges** | Messages lost on broker restart | Set `{ durable: true }` on all production queues and exchanges |
| **Missing publisher confirms** | Silent message loss, no delivery guarantee | Call `channel.confirm()` and await `channel.waitForConfirms()` |
| **Wrong prefetch value** | Memory pressure (too high) or idle workers (too low) | Tune based on processing time: <100ms → 20–50, 100ms–1s → 5–20, >1s → 1–5 |
| **Not configuring DLX** | Poison messages block the entire queue | Set `x-dead-letter-exchange` on queue args; route failed messages to a dead-letter queue |
| **Single connection for publish + consume** | Flow control from consumers blocks producers | Use separate connections for publishing and consuming |
| **Missing `deliveryMode: 2` on publish** | Messages not persisted to disk | Set `{ deliveryMode: 2 }` (persistent) on all critical messages |
| **Not handling `null` consume messages** | Unhandled exceptions, consumer crashes | Always guard: `if (!msg) return;` inside consume callback |
| **No connection recovery configured** | Broker restart kills all consumers | Use `channel.on('close', ...)` to reconnect, or use `amqplib`'s built-in recovery |
| **Using classic queues in production** | Data loss on node failure, deprecated mirrored queues | Use quorum queues (`x-queue-type: 'quorum'`) for production workloads |

---

## 4. Implementation Workflow (TDD)

### Step 1: Write Failing Test First

```typescript
// tests/test-message-queue.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import amqplib, { Connection, Channel } from 'amqplib';

describe('OrderConsumer', () => {
  let connection: Connection;
  let channel: Channel;

  beforeEach(async () => {
    connection = await amqplib.connect('amqp://localhost');
    channel = await connection.createChannel();
  });

  afterEach(async () => {
    await channel.close();
    await connection.close();
  });

  it('should process a valid order message and ack', async () => {
    const queue = 'test-orders';
    await channel.assertQueue(queue, { durable: true });
    await channel.prefetch(1);

    let processedMessage: any = null;
    await channel.consume(queue, (msg) => {
      if (msg) {
        processedMessage = JSON.parse(msg.content.toString());
        channel.ack(msg);
      }
    });

    const order = { orderId: 123, status: 'pending' };
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(order)));

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(processedMessage).toEqual(order);
  });
});
```

### Step 2: Implement Minimum to Pass

```typescript
// src/consumers/order-consumer.ts
import { Channel, Message } from 'amqplib';

export class OrderConsumer {
  constructor(
    private readonly channel: Channel,
    private readonly prefetchCount: number = 10
  ) {}

  async setup(queue: string): Promise<void> {
    await this.channel.prefetch(this.prefetchCount);
    await this.channel.consume(queue, this.handleMessage.bind(this));
  }

  private async handleMessage(msg: Message | null): Promise<void> {
    if (!msg) return;
    try {
      const order = JSON.parse(msg.content.toString());
      await this.processOrder(order);
      this.channel.ack(msg);
    } catch (error) {
      // Nack without requeue — sends to DLX
      this.channel.nack(msg, false);
    }
  }

  private async processOrder(order: { orderId: number; status: string }): Promise<void> {
    // Business logic here
  }
}
```

### Step 3: Run Full Verification

```bash
# Run unit tests
npx vitest run tests/test-message-queue.ts

# Run with coverage
npx vitest run --coverage

# Run integration tests (requires RabbitMQ)
npx vitest run tests/integration/
```

---

## 5. Exchange Pattern Selection

### Quick Decision Guide

| Pattern | Exchange Type | Use Case |
|---------|---------------|----------|
| Point-to-point | `direct` | One consumer per message |
| Flexible routing | `topic` | Wildcard-based routing (`*.error`, `db.*`) |
| Broadcast | `fanout` | All bound consumers get every message |
| Header-based | `headers` | Route on message headers (rarely used) |

### Routing Key Patterns (Topic Exchange)

- `*` matches exactly one word
- `#` matches zero or more words
- `user.*.created` matches `user.account.created`
- `user.#` matches `user.created`, `user.account.updated`

### Minimal Direct Exchange Example

```typescript
async function setupDirectExchange(channel: Channel): Promise<void> {
  await channel.assertExchange('orders', 'direct', { durable: true });
  await channel.assertQueue('order-processing', { durable: true });
  await channel.bindQueue('order-processing', 'orders', 'order.created');

  channel.publish(
    'orders', 'order.created',
    Buffer.from(JSON.stringify({ orderId: 123 })),
    { deliveryMode: 2 }  // persistent
  );
}
```

> **For complete exchange examples, API types, and all patterns, see `references/amqplib.md`.**

---

## 6. Reliability Checklist

| Concern | Solution | Reference |
|---------|----------|-----------|
| No message loss | Publisher confirms + durable queues + manual acks | `references/amqplib.md` |
| Failed messages | Dead letter exchange (DLX) | `references/rabbitmq-concepts.md` |
| Consumer crashes | Manual acks (not auto-ack) | `references/rabbitmq-concepts.md` |
| Queue overflow | `x-max-length` + DLX | `references/rabbitmq-concepts.md` |
| Poison messages | `x-delivery-limit` (quorum queues) | `references/rabbitmq-concepts.md` |
| Broker restart | Durable queues + opt-in recovery | `references/amqplib.md` |

### Minimal Reliable Consumer

```typescript
const connection = await amqplib.connect('amqp://localhost');
const channel = await connection.createChannel();
await channel.confirm();  // Enable publisher confirms
await channel.assertQueue('tasks', { durable: true });
await channel.prefetch(1);

await channel.consume('tasks', async (msg) => {
  if (!msg) return;
  try {
    await processTask(msg.content.toString());
    channel.ack(msg);
  } catch (error) {
    channel.nack(msg, false);  // Sends to DLX
  }
});
```

> **For full DLX configuration, quorum queue setup, and prefetch tuning, see `references/rabbitmq-concepts.md`.**

---

## 7. Queue Type Selection

| Queue Type | Durability | Replication | Best For |
|------------|-----------|-------------|----------|
| **Quorum** | Yes (Raft) | Multi-node | Production, high availability |
| **Classic** | Yes | Deprecated mirrored | Legacy, exclusive queues, priorities |
| **Stream** | Yes (append log) | Replica/leader | High throughput, message replay |

**Default recommendation**: Use **quorum queues** for all production workloads. They provide data safety via Raft consensus, automatic failover, and poison message detection.

> **For full comparison, see `references/rabbitmq-concepts.md`.**

---

## 8. Performance Guidelines

| Scenario | Prefetch | Notes |
|----------|----------|-------|
| Fast processing (< 100ms) | 20–50 | Higher throughput |
| Medium processing (100ms–1s) | 5–20 | Balanced |
| Slow processing (> 1s) | 1–5 | Prevent memory pressure |

**Key practices:**
- Use separate connections for publishing and consuming (isolate flow control)
- AMQP allows multiple channels over one TCP connection — reuse connections
- Listen for `drain` events on backpressure
- Consider msgpack/binary formats for large payloads

> **For full performance patterns, see `references/rabbitmq-concepts.md`.**

---

## 9. Security Checklist

- [ ] Use `amqps://` (TLS) for all production connections
- [ ] Enable mutual TLS (mTLS) for client authentication
- [ ] Set `connection_name` for operational visibility
- [ ] Avoid default `guest/guest` credentials
- [ ] Use virtual hosts for tenant isolation
- [ ] Apply topic permissions for exchange-level access control
- [ ] Disable legacy TLS versions (use TLS 1.2+)
- [ ] Verify server hostname (SAN/CN) in client connections

> **For TLS configuration code, see `references/amqplib.md`.**

---

## 10. Monitoring

### Key Metrics to Monitor

| Metric | Alert Threshold |
|--------|-----------------|
| Queue depth | > 10,000 |
| Message rates | Sudden drop |
| Consumer count | 0 when expected |
| Connection count | > 1,000 |
| Memory usage | > 70% |
| Disk space | > 80% |

### Setup

```bash
# Enable plugins
rabbitmq-plugins enable rabbitmq_management rabbitmq_prometheus
# Prometheus: http://localhost:15692/metrics
# Management UI: http://localhost:15672
```

> **For full monitoring guide with Grafana dashboards, see `references/rabbitmq-concepts.md`.**

---

## 11. Testing Patterns

### Unit Testing with Mocks

```typescript
import { describe, it, expect, vi } from 'vitest';
import { OrderConsumer } from '../src/consumers/order-consumer';

describe('OrderConsumer', () => {
  it('should ack on successful processing', async () => {
    const mockChannel = {
      ack: vi.fn(),
      nack: vi.fn(),
      prefetch: vi.fn(),
      consume: vi.fn()
    } as any;

    const consumer = new OrderConsumer(mockChannel);
    await consumer.setup('test-queue');

    expect(mockChannel.prefetch).toHaveBeenCalledWith(10);
  });
});
```

### Integration Testing with Test Container

```typescript
import { GenericContainer } from 'testcontainers';

// Spins up real RabbitMQ in Docker for integration tests
const container = await new GenericContainer('rabbitmq:4-management')
  .withExposedPorts(5672, 15672)
  .start();

const host = container.getHost();
const port = container.getMappedPort(5672);
// Test with real RabbitMQ...

await container.stop();
```

---

## 12. Reference Files

For detailed API documentation, parameter types, and RabbitMQ concept explanations, read the bundled references:

- **`references/amqplib.md`** — Complete amqplib API reference: connection, channel, exchange, queue, consumer, confirm, TLS, recovery, TypeScript types, troubleshooting
- **`references/rabbitmq-concepts.md`** — RabbitMQ concepts: queue types, DLX, publisher confirms, prefetch, TLS, clustering, performance, monitoring

Read these files when you need specific API details, parameter signatures, or RabbitMQ concept explanations.
