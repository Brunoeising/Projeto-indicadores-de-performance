const mongoose = require("mongoose");
const Person = require('./PersonModel');
const { Schema } = mongoose;

const OwnerHistorySchema = new Schema({
    ownerTeam: { type: String, maxlength: 128 },
    changedDate: Date,
    permanencyTimeFullTime: Number,
    permanencyTimeWorkingTime: Number,
});

const StatusHistorySchema = new Schema({
    status: { type: String, maxlength: 128 },
    justification: { type: String, maxlength: 128 },
    changedDate: Date,
    permanencyTimeFullTime: Number,
    permanencyTimeWorkingTime: Number,
});

const SatisfactionSurveyResponseSchema = new Schema({
    id: { type: Number, required: true },
    respondedBy: Person.schema, // Utilizamos o esquema Person aqui
    responseDate: Date,
    satisfactionSurveyModel: { type: Number, required: true },
    satisfactionSurveyNetPromoterScoreResponse: Number,
    satisfactionSurveyPositiveNegativeResponse: Number,
    satisfactionSurveySmileyFacesResponse: Number,
    comments: String
});

const actionSchema = new Schema({
    id: Number,
    type: Number,
    status: String,
    createdDate: Date,
    createdBy: Person.schema, // Utilizamos o esquema Person aqui
    isDeleted: Boolean,
    tags: [String],
});

const customFieldSchema = new Schema({
    name: String,
    value: String,
});

const ownerSchema = new Schema({
    id: Number,
    personType: Number,
    profileType: Number,
    businessName: String,
    email: String,
});


const TicketSchema = new mongoose.Schema({
    redmineIssueId: Number,
    jiraIssueKey: String,
    slaRealResponseDate: Date,
    slaResponseDate: Date,
    slaSolutionDateIsPaused: Boolean,
    slaSolutionDate: Date,
    slaSolutionChangedByUser: Boolean,
    slaResponseTime: Number,
    slaSolutionTime: Number,
    slaAgreementRule: String,
    slaAgreement: String,
    sequence: String,
    chatWaitingTime: Number,
    chatTalkTime: Number,
    chatGroup: String,
    chatWidget: String,
    resolvedInFirstCall: Boolean,
    stoppedTimeWorkingTime: Number,
    stoppedTime: Number,
    lifeTimeWorkingTime: Number,
    lastUpdate: Date,
    actionCount: Number,
    lastActionDate: Date,
    closedIn: Date,
    reopenedIn: Date,
    resolvedIn: Date,
    cc: String,
    serviceThirdLevel: String,
    serviceSecondLevel: String,
    serviceFirstLevel: String,
    serviceFirstLevelId: Number,
    ownerTeam: String,
    originEmailAccount: String,
    createdDate: Date,
    origin: Number,
    justification: String,
    baseStatus: String,
    status: String,
    urgency: String,
    category: String,
    subject: String,
    type: Number,
    protocol: String,
    id: Number,
    owner: ownerSchema, 
    customFields: [customFieldSchema],
    actions: [actionSchema],
    satisfactionSurveyResponses: [SatisfactionSurveyResponseSchema],
    ownerHistories: [OwnerHistorySchema],
    statusHistories: [StatusHistorySchema],

    clients: [Person.schema]

}, { timestamps: true });

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;
