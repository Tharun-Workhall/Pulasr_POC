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
        await producer.send({ data: Buffer.from(order) });  // Wait for the message to be sent
        console.log(`🟢 Order placed: ${order}`);
    }

    await placeOrder(1004, 210.00);  // Use await here too

    await producer.close();
    await client.close();
})();
