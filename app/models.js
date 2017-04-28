const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String, 
    password: String,
    profile: {
        classes: [{type: Schema.Types.ObjectId, ref: 'Class'}]
    }
});

const classSchema = new Schema({
    title: String,
    department: String,
    departmentCode: String,
    number: String,
    season: String,
    year: String, 
});

const chatSchema = new Schema({
    members: [{type: Schema.Types.ObjectId, ref: 'User'}],
    messages: [
        {
            sender: String,
            sentAt: Date,
            seen: Boolean,
            text: String,  
        }
    ]
});


const User = mongoose.model('User', userSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Class = mongoose.model('Class', classSchema);
module.exports = {
    User: User,
    Chat: Chat,
    Class: Class,
}