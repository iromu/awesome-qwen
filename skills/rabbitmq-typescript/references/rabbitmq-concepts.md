# RabbitMQ Core Concepts (4.x)

## Overview

RabbitMQ is an open-source message broker that implements the AMQP 0-9-1 protocol. It supports multiple messaging patterns including pub/sub, work queues, RPC, and request/reply.

**Official Documentation:** https://www.rabbitmq.com/docs

---

## Queue Types

### Classic Queues

- **Description:** Traditional queue implementation
- **Replication:** Removed in RabbitMQ 4.x (deprecated mirrored queues)
- **Features:** Supports priorities, exclusive and transient queues
- **Use when:** Need exclusive/client-specific queues, priority handling, or temporary state
- **Caveat:** Transient non-exclusive classic queues are deprecated in RabbitMQ 4.3+

### Quorum Queues

- **Description:** Replicated, data-safety and consistency-oriented queues
- **Replication:** Built on Raft consensus algorithm
- **Features:** Automatic leader election, poison message detection, consumer timeout, delayed retry
- **Use when:** High availability, data durability, and most standard messaging scenarios are required
- **Requirements:** Must be durable (due to replication protocol), requires odd number of nodes (3, 5, 7) for optimal quorum

### Streams

- **Description:** Alternative, immutable append-only log data structure
- **Consumption:** Non-destructive (messages persist until retention expiry)
- **Features:** Single Active Consumer, Super Streams (partitioning), deduplication, offset/timestamp replay
- **Use when:** High-throughput workloads, strict ordering guarantees, message replay, large backlogs
- **Requirements:** Clients must connect to a node hosting a replica/leader

---

## Queue Properties

### Mandatory Properties

| Property | Description |
|----------|-------------|
| **Name** | Up to 255 UTF-8 bytes. Names starting with `amq.` are broker-reserved. |
| **Durable** | Persists queue metadata (and persistent messages) across broker restarts. |
| **Exclusive** | Bound to the declaring connection only; deleted when the connection closes. |
| **Auto-delete** | Deleted when the last consumer unsubscribes. |

### Optional Arguments (x-arguments)

Set at declaration (immutable) or dynamically via policies.

| Key | Description |
|-----|-------------|
| `x-queue-type` | Queue type: `classic`, `quorum`, or `stream` |
| `x-max-priority` | Maximum priority level (0-255) |
| `x-message-ttl` | Per-message TTL in milliseconds |
| `x-max-length` | Maximum queue length (message count) |
| `x-max-length-bytes` | Maximum queue size in bytes |
| `x-dead-letter-exchange` | Exchange for rejected/expired messages |
| `x-dead-letter-routing-key` | Routing key override for DLX |
| `x-delivery-limit` | Max delivery attempts (quorum queues) |
| `x-consumer-timeout` | Consumer inactivity timeout (quorum queues) |

### Configuration Precedence

Client-provided args > Policy-defined keys > Operator policies (which enforce resource guardrails). For numerical limits, the lower value applies.

---

## Exchanges

### Exchange Types

| Type | Description | Use Case |
|------|-------------|----------|
| **direct** | Routes to queue(s) whose binding key exactly matches the routing key | Point-to-point messaging |
| **topic** | Routes based on wildcard matching of routing key (`*` = one word, `#` = zero or more) | Flexible routing patterns |
| **fanout** | Broadcasts to all bound queues | Pub/sub, event broadcasting |
| **headers** | Routes based on header attributes (rarely used) | Header-based routing |
| **default** | Acts as direct or fanout depending on binding | Default behavior |

### Exchange Properties

| Property | Description |
|----------|-------------|
| **Name** | Up to 255 UTF-8 bytes. `amq.*` are pre-declared. |
| **Type** | Exchange type (direct, topic, fanout, headers) |
| **Durable** | Persists exchange across broker restarts |
| **Auto-delete** | Deleted when last queue unbound |
| **Internal** | Not accepting publisher messages (used for exchange-to-exchange bindings) |

---

## Message Properties

| Property | Description |
|----------|-------------|
| **contentType** | MIME content type (e.g., `application/json`) |
| **contentEncoding** | MIME content encoding |
| **deliveryMode** | 1 (transient) or 2 (persistent) |
| **priority** | Message priority (0-255) |
| **correlationId** | Correlation ID (for RPC request/reply) |
| **replyTo** | Queue name for replies (for RPC) |
| **expiration** | Message expiration time |
| **messageId** | Message ID (application-defined) |
| **timestamp** | Message timestamp |
| **type** | Message type (application-defined) |
| **userId** | User ID (for auditing) |
| **appId** | Application ID |
| **headers** | Custom headers (key-value pairs) |

---

## Dead Letter Exchanges (DLX)

A DLX is a standard exchange that receives messages republished from a source queue when specific events occur:
- Message rejected (`basic.reject` or `basic.nack` with `requeue=false`)
- Message TTL expires (per-message TTL)
- Queue length limit exceeded (messages dropped)
- Delivery limit exceeded (quorum queues)

### DLX Configuration

**Via Queue Arguments (at declaration):**
```typescript
await channel.assertQueue('tasks', {
  durable: true,
  arguments: {
    'x-dead-letter-exchange': 'dlx',
    'x-dead-letter-routing-key': 'dl-routing-key',
    'x-message-ttl': 60000,
    'x-max-length': 10000
  }
});
```

**Via Policies (recommended for production):**
```bash
rabbitmqctl set_policy DLX ".*" '{"dead-letter-exchange":"my-dlx", "dead-letter-routing-key":"my-routing-key"}' --apply-to queues --priority 7
```

### DLX Headers

When a message is dead-lettered, RabbitMQ adds:
- `x-death` array (AMQP 0.9.1): Records queue, reason, count, timestamps, exchange, routing keys
- `x-first-death-*` and `x-last-death-*` headers: Track initial and latest dead-letter events

### Dead-Letter Reasons

| Reason | Description |
|--------|-------------|
| `rejected` | Message rejected by consumer (basic.reject/nack with requeue=false) |
| `expired` | Message TTL expired |
| `maxlen` | Queue length limit exceeded |
| `delivery_limit` | Delivery limit exceeded (quorum queues) |

### Cycle Prevention

RabbitMQ detects dead-letter cycles and drops messages to prevent infinite loops.

---

## Publisher Confirms

Publisher confirms ensure messages are delivered to the broker. When enabled, the broker sends ack/nack for each published message.

### Enabling Confirms

```typescript
// amqplib
await channel.confirm();
```

### Handling Confirmations

```typescript
// amqplib: Check return value of publish()
const result: boolean = channel.publish(exchange, routingKey, content, options);
if (!result) {
  // Buffer is full — back off
  channel.once('drain', () => { /* resume publishing */ });
}
```

### When Messages Are Confirmed

- **Unroutable:** Confirmed once the exchange verifies no queues will receive the message. If published as mandatory, a `basic.return` is sent before the `basic.ack`.
- **Routable:** Confirmed when accepted by all target queues. For persistent/durable queues, this means disk persistence. For quorum queues, it means quorum replicas have accepted the message.

### Latency & Ordering

- `basic.ack` for persistent messages is sent after disk persistence, which is batched to minimize `fsync` calls. Under constant load, latency can reach a few hundred milliseconds.
- Acknowledgements are emitted asynchronously and may arrive out of order relative to publication order. Applications should not depend on confirmation ordering.

### When to Use

- Critical messages that must not be lost
- Financial transactions, order processing, audit logs
- When message loss would cause business impact

---

## Consumer Acknowledgments

### Auto Ack (Fire and Forget)

```typescript
await channel.consume(queue, callback, { noAck: true });
```

- Messages are automatically acknowledged upon delivery
- No guarantee of delivery — if consumer crashes, messages are lost
- Use only for non-critical, fire-and-forget messages

### Manual Ack (Recommended)

```typescript
await channel.consume(queue, (msg) => {
  if (msg) {
    try {
      processMessage(msg);
      channel.ack(msg);  // Acknowledge on success
    } catch (err) {
      channel.nack(msg, false);  // Nack without requeue (sends to DLX)
    }
  }
});
```

- Messages are only acknowledged when explicitly acked
- If consumer crashes before ack, message is requeued
- Use for all critical messaging

### Prefetch Count

```typescript
// amqplib
await channel.prefetch(10, false);  // Per-consumer prefetch of 10
```

**Tuning Guidelines:**
- Fast consumers (< 100ms): prefetch 20-50
- Medium consumers (100ms-1s): prefetch 5-20
- Slow consumers (> 1s): prefetch 1-5

---

## TLS/SSL Configuration

### Server Configuration (rabbitmq.conf)

```ini
listeners.ssl.default = 5671
listeners.tcp = none

ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.verify     = verify_peer
ssl_options.versions.1 = tlsv1.2
ssl_options.versions.2 = tlsv1.3
ssl_options.honor_cipher_order = true
```

### Client Configuration (amqplib)

```typescript
import * as fs from 'fs';

const connection = await amqplib.connect('amqps://localhost', {
  socketOptions: {
    tls: {
      ca: fs.readFileSync('/path/to/ca_certificate.pem'),
      cert: fs.readFileSync('/path/to/client_certificate.pem'),
      key: fs.readFileSync('/path/to/client_key.pem'),
      rejectUnauthorized: true
    }
  }
});
```

### Security Best Practices

- Disable legacy TLS versions (use TLS 1.2+)
- Use strong cipher suites
- Enable mutual TLS (mTLS) for client authentication
- Rotate certificates regularly
- Verify server hostname (SAN/CN) in client connections

---

## Monitoring & Management

### Management Plugin

```bash
rabbitmq-plugins enable rabbitmq_management
```

Access the UI at `http://<host>:15672/`.

### Prometheus Exporter

```bash
rabbitmq-plugins enable rabbitmq_prometheus
```

The Prometheus endpoint serves node-local metrics, avoiding cluster-wide aggregation delays.

### Key Metrics to Monitor

| Metric | Description |
|--------|-------------|
| Queue depth | Number of messages in queue |
| Message rates | Publish/consume rates per queue/exchange |
| Consumer count | Number of active consumers |
| Connection count | Total open connections |
| Memory usage | Broker memory utilization |
| Disk space | Available disk space |
| Message latency | End-to-end message latency |

### Grafana Dashboards

RabbitMQ provides first-class Grafana dashboard support. Import the official dashboard JSON files from the RabbitMQ GitHub repository.

---

## Clustering & High Availability

### Cluster Formation

RabbitMQ uses peer discovery backends to locate cluster members:

| Backend | Description |
|---------|-------------|
| `classic_config` | Static list of peers |
| `dns` | DNS A/AAAA + reverse lookup |
| `aws` | EC2 tags or autoscaling groups |
| `kubernetes` | Lowest ordinal pod as seed |
| `consul` | Consul service discovery |
| `etcd` | etcd service discovery |

### Quorum Queue Requirements

- Must be durable (due to replication protocol)
- Requires odd number of nodes (3, 5, 7) for optimal quorum
- A 3-member queue tolerates 1 node failure
- A 5-member queue tolerates 2 node failures
- Quorum queues are unavailable during partial cluster formation

### Best Practices

- Use quorum queues for all production workloads
- Set `connection_name` capability for simplified troubleshooting
- Use separate connections for publishing and consuming (to isolate consumers from publisher-induced flow control)
- Monitor total connections, open/close rates, and file handles
- Set `collect_statistics_interval` to 30-60s for high-concurrency environments

---

## Performance Optimization

### Prefetch Count Tuning

- Fast consumers (< 100ms): prefetch 20-50
- Medium consumers (100ms-1s): prefetch 5-20
- Slow consumers (> 1s): prefetch 1-5

### Connection & Channel Pooling

- AMQP 0-9-1 allows multiple lightweight channels over a single TCP connection
- Maintain long-lived connections; explicitly close when no longer needed
- Use separate connections for publishing and consuming

### Lazy Queues for Large Backlogs

Use lazy queues when:
- Queue depth regularly exceeds 10,000 messages
- Consumers are slower than publishers
- Memory is constrained
- Message order isn't time-critical

### Message Batching

- Batch publishing with bulk confirms for better throughput
- Use `drain` event to back off when buffer is full
- Consider msgpack or binary formats for faster serialization

### Queue Scaling

- A single queue is an anti-pattern (limited to one CPU core on hot path)
- Use multiple queues or Streams for high-throughput workloads
- Scale horizontally with multiple queues or partitioned streams
