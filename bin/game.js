function connect(socket) {
    console.log(socket.id + ' connected');
}

function disconnect(socket) {
    console.log(socket.id + ' disconnected');
}

exports.start = function(io) {
    io.on('connection', function(socket) {
        connect(socket);
        socket.on('disconnect', function() {
            disconnect(socket);
        })
    })
};