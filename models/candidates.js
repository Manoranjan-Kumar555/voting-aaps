const mongoose = require('mongoose');

// Create Candidate Schema
const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    party: {
        type: String, // Fixed typo here
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    votes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            votedAt: {
                type: Date,
                default: Date.now() // Use a function reference for default values
            }
        }
    ],
    voteCount: {
        type: Number,
        default: 0
    }
});

// Create Candidate model
const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
