const mongoose = require("mongoose");
const { Schema } = mongoose;

const RelationshipSchema = new Schema({
    id: String,
    name: String,
    slaAgreement: String,
    forceChildrenToHaveSomeAgreement: {
        type: Boolean,
        default: false
    },
    allowAllServices: {
        type: Boolean,
        default: true
    },
    includeInParents: {
        type: Boolean,
        default: false
    },
    loadChildOrganizations: {
        type: Boolean,
        default: false
    },
    services: [String] // Supondo que seja uma lista de nomes de serviços. Se for mais complexo, você pode precisar de um esquema separado.
});
const customFieldSchema = new Schema({
    name: String,
    value: String,
});

const PersonSchema = new Schema({
    id: String,
    codeReferenceAdditional: String,
    isActive: Boolean,
    personType: Number,
    profileType: Number,
    accessProfile: String,
    corporateName: String,
    businessName: String,
    businessBranch: String,
    cpfCnpj: String,
    userName: String,
    role: String,
    bossId: String,
    bossName: String,
    classification: String,
    cultureId: String,
    timeZoneId: String,
    authenticateOn: String,
    createdDate: Date,
    createdBy: String,
    changedDate: Date,
    changedBy: String,
    observations: String,
    addresses: [Schema.Types.Mixed], // Como um placeholder, você pode definir um esquema detalhado depois
    contacts: [Schema.Types.Mixed],
    emails: [Schema.Types.Mixed],
    teams: [String], // Supondo que seja apenas uma lista de nomes de equipes
    relationships: [Schema.Types.Mixed],
    customFieldValues: [customFieldSchema], // Usando o esquema que você já definiu
    atAssets: [Schema.Types.Mixed],
    customFields: [customFieldSchema],
    relationships: [RelationshipSchema], // Lista de relacionamentos
}, { timestamps: true });

const Person = mongoose.model('Person', PersonSchema);

module.exports = Person;
