const { createClient } = require('node-thinkgear-sockets');
const io = require('socket.io')()
const neuroClient = createClient();
neuroClient.connect();

io.on('connection', (client) => {
    client.on('getEEG', () => {
        neuroClient.on('data', (data) => {
            console.log(data)
            client.setMaxListeners(1)
            client.emit('eeg', data)
        })
    });
})
const port = 8000
io.listen(port)

console.log('listening on port ', port)



