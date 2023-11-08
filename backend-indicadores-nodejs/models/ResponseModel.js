const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SurveyResponseSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    questionId: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4]
    },
    ticketId: {
        type: Number,
        required: true
    },
    responseDate: {
        type: Date,
        required: true
    },
    commentary: {
        type: String
    },
    value: {
        type: Number,
        required: true
    }
});

const SurveyResponse = mongoose.model('SurveyResponse', SurveyResponseSchema);

module.exports = SurveyResponse;
