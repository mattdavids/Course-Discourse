const Chat = require('./models').Chat;

function init(io) {
    let connectedUsers = {};
    io.on('connection', (socket) => {
        let user = socket.request.user;
        console.log('user connected: ' + user.email);

        connectedUsers[user._id] = socket;
        
        socket.on('disconnect', () => {
            console.log('user disconnected: ' + user.email);
            delete connectedUsers[user._id];
        }); 

        socket.on('message', (messageEventData) => {
            let messageData = JSON.parse(messageEventData);
            Chat.findById(messageData.chatId, function(err, chat) {
                if (!chat) {
                    socket.emit('err', { message: 'chat not found' });
                    return;
                }

                if (!chat.isMember(user._id)) {
                    console.log(chat.members + ' ' + user._id);
                    socket.emit('err', 'not member of chat');
                    return;
                }

                let message = {
                    sender: user.email,
                    sentAt: Date.now(),
                    text: messageData.text
                } 
                
                chat.messages.push(message);
                chat.save();

                for (let memberId of chat.members) {
                    if (!memberId.equals(user._id)) {
                        console.log(memberId);
                        if (connectedUsers[memberId])
                            connectedUsers[memberId].emit('receivedMessage', {chatId: chat._id, message: message});
                    }
                }
            });
        });

        socket.on('fetch-latest', (req) => {
            let chatId = req.chatId;
            let amount = req.amount;

            Chat.findById(req.chatId, (err, chat) => {
                if (!chat) {
                    socket.emit('err', 'chat not found');
                    return;
                }

                if (!chat.isMember(user._id)) {
                    socket.emit('err', 'not member of chat');
                    return;
                }


            })    
        });
    });
}

module.exports = init;



// io.on('connection', (socket) => {
//    console.log('connected user');
//    console.log(socket.request.user);
   
//    socket.on('dog', (eventData) => {
//        console.log('dog recieved');
       
//    })
// });