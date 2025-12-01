const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const fs = require('fs');

// @desc    Upload a new version of a document
// @route   POST /api/documents/:id/versions
// @access  Private
const uploadVersion = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload a file');
        }

        const document = await Document.findById(req.params.id);

        if (!document || document.isDeleted) {
            // Cleanup uploaded file
            fs.unlinkSync(req.file.path);
            res.status(404);
            throw new Error('Document not found');
        }

        // Check permissions (only admin or owner can upload new version)
        if (req.user.role !== 'admin' && document.createdBy.toString() !== req.user.id) {
            fs.unlinkSync(req.file.path);
            res.status(403);
            throw new Error('Not authorized to update this document');
        }

        // Get last version number
        const lastVersion = await DocumentVersion.findOne({ document: document._id })
            .sort({ versionNumber: -1 });

        const newVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

        // Create new DocumentVersion
        const version = await DocumentVersion.create({
            document: document._id,
            versionNumber: newVersionNumber,
            filePath: req.file.path,
            fileOriginalName: req.file.originalname,
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            updatedBy: req.user.id,
            changeLog: req.body.changeLog || '',
        });

        // Update Document currentVersion
        document.currentVersion = version._id;
        await document.save();

        res.status(201).json({
            success: true,
            data: version,
        });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

// @desc    Get all versions of a document
// @route   GET /api/documents/:id/versions
// @access  Private
const getVersions = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document || document.isDeleted) {
            res.status(404);
            throw new Error('Document not found');
        }

        // Check permissions
        if (
            req.user.role !== 'admin' &&
            document.createdBy.toString() !== req.user.id &&
            !document.allowedUsers.some(u => u.toString() === req.user.id)
        ) {
            res.status(403);
            throw new Error('Not authorized to view this document');
        }

        const versions = await DocumentVersion.find({ document: document._id })
            .sort({ versionNumber: -1 })
            .populate('updatedBy', 'name email');

        res.json({
            success: true,
            data: versions,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadVersion,
    getVersions,
};
