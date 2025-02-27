# Apache Pulsar POC Documentation

## Overview
This Proof of Concept (POC) demonstrates how Apache Pulsar can be used for event-driven microservices communication. The system consists of three services:

1. **Order Service** - Publishes order messages to a Pulsar topic.
2. **Payment Service** - Consumes order messages and processes payments.
3. **Notification Service** - Consumes order messages and sends notifications.

## Prerequisites
- Apache Pulsar installed and running (`pulsar://localhost:6650`)
- Node.js installed
- `pulsar-client` package installed (`npm install pulsar-client`)
- Run the apache Pulsar Docker container :
   1) docker pull apachepulsar/pulsar
   2) docker run -it -p 6650:6650 -p 8080:8080 --name pulsar apachepulsar/pulsar:latest bin/pulsar standaloneS
## Project Structure
```
.
├── OrderService.js
├── PaymentService.js
└── NotificationService.js
```

## Implementation

### 1. Order Service (Publisher)
The `OrderService.js` script creates an order and publishes it to the Pulsar topic `persistent://public/default/orders`.

#### Code:
```javascript
const pulsar = require('pulsar-client');

(async () => {
    const client = new pulsar.Client({
        serviceUrl: 'pulsar://localhost:6650'
    });

    const producer = await client.createProducer({
        topic: 'persistent://public/default/orders'
    });

    async function placeOrder(orderId, amount) {
        const order = JSON.stringify({ orderId, amount });
        await producer.send({ data: Buffer.from(order) });
        console.log(`🟢 Order placed: ${order}`);
    }

    await placeOrder(1004, 210.00);

    await producer.close();
    await client.close();
})();
```

### 2. Payment Service (Consumer)
The `PaymentService.js` subscribes to the `orders` topic, processes payments, and acknowledges messages.

#### Code:
```javascript
const pulsar = require('pulsar-client');

(async () => {
    const client = new pulsar.Client({
        serviceUrl: 'pulsar://localhost:6650'
    });

    const consumer = await client.subscribe({
        topic: 'persistent://public/default/orders',
        subscription: 'payment-subscription',
        subscriptionType: 'Exclusive'
    });

    const msg = await consumer.receive();
    const order = JSON.parse(msg.getData().toString());
    console.log(`💰 Processing payment for Order ${order.orderId} - Amount: $${order.amount}`);
    consumer.acknowledge(msg);

    await consumer.close();
    await client.close();
})();
```

### 3. Notification Service (Consumer)
The `NotificationService.js` listens to the same `orders` topic and sends order confirmations.

#### Code:
```javascript
const pulsar = require('pulsar-client');

(async () => {
    const client = new pulsar.Client({
        serviceUrl: 'pulsar://localhost:6650'
    });

    const consumer = await client.subscribe({
        topic: 'persistent://public/default/orders',
        subscription: 'notification-subscription',
        subscriptionType: 'Exclusive'
    });

    const msg = await consumer.receive();
    const order = JSON.parse(msg.getData().toString());
    console.log(`📩 Sending confirmation email for Order ${order.orderId}`);
    consumer.acknowledge(msg);

    await consumer.close();
    await client.close();
})();
```

## Running the POC
1. Start the Apache Pulsar broker.
2. Run the Order Service:
   ```sh
   node OrderService.js
   ```
3. Run the Payment Service:
   ```sh
   node PaymentService.js
   ```
4. Run the Notification Service:
   ```sh
   node NotificationService.js
   ```

## Expected Output
- The Order Service logs that an order has been placed.
- The Payment Service logs that payment is being processed.
- The Notification Service logs that an order confirmation email is being sent.

## Conclusion
This POC demonstrates a simple event-driven architecture using Apache Pulsar for messaging between microservices. The setup allows for scalable and decoupled services that can handle orders, payments, and notifications independently.

