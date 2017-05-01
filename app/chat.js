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

        socket.on('send', (messageData) => {
            Chat.findById(messageData.chatId, function(err, chat) {
                if (!chat) {
                    socket.emit('err', { message: 'chat not found' });
                    return;
                }

                if (!chat.isMember(user._id)) {
                    socket.emit('err', 'not member of chat');
                    return;
                }

                let message = {
                    sender: user._id,
                    senderName: user.firstName,
                    sentAt: Date.now(),
                    text: messageData.text,
                } 
                
                chat.messages.push(message);
                chat.save();

                for (let memberId of chat.members) {
                    if (!memberId.equals(user._id) && connectedUsers[memberId]) {
                        connectedUsers[memberId].emit('receiveMessage', {chatId: chat._id, message: message});
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

                let toSend = [];
                let numMessages = chat.messages.length;
                if (!req.amount || chat.messages.length <= req.amount) {
                    toSend = chat.messages;
                } else {
                    toSend = chat.messages.slice(numMessages - req.amount, numMessages);
                }

                socket.emit('messages', toSend);
            });
        });
    });
}

function notifyOfChatCreation(chatCreated) {
    for (let memberId of chatCreated.members) {
        let userSocket = connectedUsers[memberId]
        if (userSocket) {
            userSocket.emit('chat-created', chatCreated);
        }
    }
}

module.exports = {
    init: init, 
    notifyOfChatCreation: notifyOfChatCreation, 
}