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

