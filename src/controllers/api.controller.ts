import { Request, Response } from 'express';
import { analyzePhysiqueAndRecommend } from '../services/ai.service';
import { uploadToCloudinary } from '../middleware/upload.middleware';

export const handlePhotoAnalysis = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No physique_image file uploaded' });
    }

    // 1. Instantly upload parallel backup to Cloudinary securely
    let cloudinaryUrl = null;
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      cloudinaryUrl = uploadResult.secure_url;
    } catch(e) {
      console.log('Cloudinary Warning:', e);
    }

    // 2. Perform lightning fast Analysis on the identical memory Buffer footprint.
    const base64Image = req.file.buffer.toString('base64');
    const result = await analyzePhysiqueAndRecommend(base64Image, req.file.mimetype);
    
    // Inject permanent payload string for Frontend Database Storage schemas
    res.json({ success: true, data: result, persistentImageUrl: cloudinaryUrl });
  } catch (error) {
    res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Internal Server Error" 
    });
  }
};
