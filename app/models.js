const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String, 
    password: String,
    firstName: String, 
    lastName: String,
    profile: {type: Schema.Types.ObjectId, ref: 'Profile'}
});

const profileSchema = new Schema({
    coursesTaken: [{
        course: {type: Schema.Types.ObjectId, ref: 'Course'},
        reason: String,
    }],
    interests: [String],
    clubs: [String],
    majors: [String], 
    minor: [String],
})

const courseSchema = new Schema({
    departmentName: String,
    departmentCode: String,
    courseName: String,
    courseNumber: String,
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

const dataSchema = new Schema({
    name: String,
    values: [String]
})

const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Course = mongoose.model('Course', courseSchema);
const Data = mongoose.model('Data', dataSchema);

module.exports = {
    User: User,
    Profile: Profile,
    Chat: Chat,
    Course: Course,
    Data: Data,
}