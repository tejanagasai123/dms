const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema({
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
    },
    versionNumber: {
        type: Number,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    fileOriginalName: {
        type: String,
        required: true,
    },
    mimeType: {
        type: String,
    },
    fileSize: {
        type: Number,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    changeLog: {
        type: String,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('DocumentVersion', documentVersionSchema);
