const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    bio:{
        type: String
    },

    githubusername: {
        type: String
    },

    website:{
        type: String
    },
    
    hometown:{
        type: String
    },

    college: [{
        degree:{
            type: String,
            required: true
        },
        branch: {
            type: String,
            required: true
        },
        year: {
            type: Number,
            required: true
        },
        rollno: {
            type: Number,
            required: true,
            unique: false
        },
        regno: {
            type: Number,
            required: true,
        },
        from: {
            type: Date,
            required: true
        },
        to: {
            type: Date,
            required: true
        }
    }],

    contactNo: {
        type: Number,
    },
    
    status: {
        type: String,
        required: true
    },

    skills: {
        type: [String],
        required: true
    },

    badges: [{
        title: {
            type: String
        }
    }],

    clubs: [{
        clubName: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: true
        }
    }],

    experience: [{
        company: {
            type:String,
            required: true
        },
        position: {
            type: String,
            required: true
        },
        from: {
            type: Date,
            required: true
        },
        to: {
            type: Date,
            required: true
        },
        description: {
            type: String
        }
    }],

    hostel: {
        type: String,
    },
    
    linkedin: {
        type: String
    },

    date: {
        type: Date,
        default: Date.now
    }
});


module.exports = Profile = mongoose.model('profile', ProfileSchema);