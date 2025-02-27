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
