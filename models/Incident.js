const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['accident', 'bouchon', 'radar', 'travaux', 'danger'],
        required: true
    },
    lat: { 
        type: Number,
        required: true,
        min: -90,
        max: 90
    },
    lng: { 
        type: Number, 
        required: true,
        min: -180,
        max: 180
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: { 
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Incident', incidentSchema);