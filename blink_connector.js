const { createClient } = require('node-thinkgear-sockets');
const io = require('socket.io')()
const neuroClient = createClient();
neuroClient.connect();

io.on('connection', (client) => {
    client.on('getBlink', () => {
        neuroClient.on('blink_data', (data_b) => {
            console.log(data_b)
            client.setMaxListeners(1)
            client.emit('blink', data_b)
        })
    });
})
const port = 8001
io.listen(port)

console.log('listening on port ', port)



