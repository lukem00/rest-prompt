const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Rx = require('rxjs/Rx');

var subject = new Rx.Subject();

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

subject.subscribe(v => console.log('Observed value: ' + v));

app.get('/api/prompt/:message', (req, res) => {
    console.log('/api/prompt/' + req.params.message);
    io.emit('chat message', req.params.message);
    var subscription = subject.subscribe(v => {
        console.log('Observed within REST handler: ' + v);
        res.send(v);
        subscription.unsubscribe();
    });
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        io.emit('chat message', msg);
        subject.next(msg);
    }); 
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});