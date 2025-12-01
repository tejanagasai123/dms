const express = require('express');
const router = express.Router();
const {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getPermissions,
    addPermission,
    removePermission,
} = require('../controllers/documentController');
const {
    uploadVersion,
    getVersions,
} = require('../controllers/versionController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/fileUpload');

// Document routes
router.route('/')
    .post(protect, upload.single('file'), createDocument)
    .get(protect, getDocuments);

router.route('/:id')
    .get(protect, getDocumentById)
    .put(protect, updateDocument)
    .delete(protect, deleteDocument);

// Version routes
router.route('/:id/versions')
    .post(protect, upload.single('file'), uploadVersion)
    .get(protect, getVersions);

// Permission routes
router.route('/:id/permissions')
    .get(protect, getPermissions)
    .post(protect, addPermission);

router.route('/:id/permissions/:userId')
    .delete(protect, removePermission);

module.exports = router;
