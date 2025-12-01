const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const fs = require('fs');
const path = require('path');

// @desc    Create a new document
// @route   POST /api/documents
// @access  Private
const createDocument = async (req, res, next) => {
    try {
        console.log('createDocument called');
        console.log('req.file:', req.file);
        console.log('req.body:', JSON.stringify(req.body, null, 2));
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload a file');
        }

        const { title, description, tags, allowedUsers } = req.body;

        console.log('Creating document with data:', { title, description, tags, createdBy: req.user.id });
        // Create Document
        const document = await Document.create({
            title,
            description,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            allowedUsers: allowedUsers ? allowedUsers.split(',') : [],
            createdBy: req.user.id,
        });
        console.log('Document created:', document._id);

        // Create first DocumentVersion
        const version = await DocumentVersion.create({
            document: document._id,
            versionNumber: 1,
            filePath: req.file.path,
            fileOriginalName: req.file.originalname,
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            updatedBy: req.user.id,
            changeLog: 'Initial upload',
        });
        console.log('Version created:', version._id);

        // Update Document with currentVersion
        document.currentVersion = version._id;
        await document.save();
        console.log('Document updated with version');

        res.status(201).json({
            success: true,
            data: document,
        });
    } catch (error) {
        // Cleanup uploaded file if error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

// @desc    Get all documents (paginated, filtered)
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res, next) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;

        const q = req.query.q ? req.query.q.trim() : '';
        const keyword = q
            ? {
                title: { $regex: q, $options: 'i' }
            }
            : {};

        const tagFilter = req.query.tags
            ? { tags: { $in: req.query.tags.split(',') } }
            : {};

        // Access control query
        let accessQuery = {};
        if (req.user.role !== 'admin') {
            accessQuery = {
                $or: [
                    { createdBy: req.user.id },
                    { allowedUsers: req.user.id },
                ],
            };
        }

        const count = await Document.countDocuments({ ...keyword, ...tagFilter, ...accessQuery, isDeleted: false });
        const documents = await Document.find({ ...keyword, ...tagFilter, ...accessQuery, isDeleted: false })
            .populate('currentVersion')
            .populate('createdBy', 'name email')
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            success: true,
            data: documents,
            page,
            pages: Math.ceil(count / pageSize),
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate('currentVersion')
            .populate('createdBy', 'name email')
            .populate('allowedUsers', 'name email');

        if (!document || document.isDeleted) {
            res.status(404);
            throw new Error('Document not found');
        }

        // Check permissions
        if (
            req.user.role !== 'admin' &&
            document.createdBy._id.toString() !== req.user.id &&
            !document.allowedUsers.some(u => u._id.toString() === req.user.id)
        ) {
            res.status(403);
            throw new Error('Not authorized to view this document');
        }

        res.json({
            success: true,
            data: document,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update document metadata
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document || document.isDeleted) {
            res.status(44);
            throw new Error('Document not found');
        }

        // Check permissions
        if (req.user.role !== 'admin' && document.createdBy.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Not authorized to update this document');
        }

        document.title = req.body.title || document.title;
        document.description = req.body.description || document.description;
        if (req.body.tags) {
            document.tags = req.body.tags.split(',').map(tag => tag.trim());
        }
        if (req.body.allowedUsers) {
            document.allowedUsers = req.body.allowedUsers.split(',');
        }

        const updatedDocument = await document.save();

        res.json({
            success: true,
            data: updatedDocument,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete document (soft delete)
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res, next) => {
    try {
        console.log('deleteDocument called for ID:', req.params.id);
        console.log('User requesting delete:', req.user.id, 'Role:', req.user.role);

        const document = await Document.findById(req.params.id);

        if (!document || document.isDeleted) {
            res.status(404);
            throw new Error('Document not found');
        }

        // Check permissions
        const userId = req.user._id.toString();
        const creatorId = document.createdBy.toString();

        console.log(`Checking permissions: User ${userId} (Role: ${req.user.role}) vs Creator ${creatorId}`);

        if (req.user.role !== 'admin' && creatorId !== userId) {
            res.status(403);
            throw new Error('Restricted to delete by the owner');
        }

        document.isDeleted = true;
        await document.save();

        res.json({
            success: true,
            data: {},
            message: 'Document removed',
        });
    } catch (error) {
        next(error);
    }
};



// @desc    Get document permissions
// @route   GET /api/documents/:id/permissions
// @access  Private
const getPermissions = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id).populate('allowedUsers', 'name email');

        if (!document || document.isDeleted) {
            res.status(404);
            throw new Error('Document not found');
        }

        // Check permissions (only owner, admin, or allowed users can view permissions)
        if (
            req.user.role !== 'admin' &&
            document.createdBy.toString() !== req.user.id &&
            !document.allowedUsers.some(u => u._id.toString() === req.user.id)
        ) {
            res.status(403);
            throw new Error('Not authorized to view permissions');
        }

        res.json(document.allowedUsers);
    } catch (error) {
        next(error);
    }
};

// @desc    Add permission to document
// @route   POST /api/documents/:id/permissions
// @access  Private
const addPermission = async (req, res, next) => {
    try {
        const { email } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document || document.isDeleted) {
            res.status(404);
            throw new Error('Document not found');
        }

        // Only owner or admin can manage permissions
        if (req.user.role !== 'admin' && document.createdBy.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Not authorized to manage permissions');
        }

        const User = require('../models/User');
        const userToAdd = await User.findOne({ email });

        if (!userToAdd) {
            res.status(404);
            throw new Error('User not found');
        }

        if (document.allowedUsers.includes(userToAdd._id)) {
            res.status(400);
            throw new Error('User already has access');
        }

        if (document.createdBy.toString() === userToAdd._id.toString()) {
            res.status(400);
            throw new Error('User is the owner');
        }

        document.allowedUsers.push(userToAdd._id);
        await document.save();

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove permission from document
// @route   DELETE /api/documents/:id/permissions/:userId
// @access  Private
const removePermission = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document || document.isDeleted) {
            res.status(404);
            throw new Error('Document not found');
        }

        // Only owner or admin can manage permissions
        if (req.user.role !== 'admin' && document.createdBy.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Not authorized to manage permissions');
        }

        document.allowedUsers = document.allowedUsers.filter(
            id => id.toString() !== req.params.userId
        );
        await document.save();

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getPermissions,
    addPermission,
    removePermission
};
