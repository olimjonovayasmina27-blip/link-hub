"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePhotoAnalysis = void 0;
const ai_service_1 = require("../services/ai.service");
const upload_middleware_1 = require("../middleware/upload.middleware");
const handlePhotoAnalysis = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No physique_image file uploaded' });
        }
        // 1. Instantly upload parallel backup to Cloudinary securely
        let cloudinaryUrl = null;
        try {
            const uploadResult = await (0, upload_middleware_1.uploadToCloudinary)(req.file.buffer);
            cloudinaryUrl = uploadResult.secure_url;
        }
        catch (e) {
            console.log('Cloudinary Warning:', e);
        }
        // 2. Perform lightning fast Analysis on the identical memory Buffer footprint.
        const base64Image = req.file.buffer.toString('base64');
        const result = await (0, ai_service_1.analyzePhysiqueAndRecommend)(base64Image, req.file.mimetype);
        // Inject permanent payload string for Frontend Database Storage schemas
        res.json({ success: true, data: result, persistentImageUrl: cloudinaryUrl });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Internal Server Error"
        });
    }
};
exports.handlePhotoAnalysis = handlePhotoAnalysis;
