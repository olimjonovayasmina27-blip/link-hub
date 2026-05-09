"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzePhysiqueAndRecommend = void 0;
const generative_ai_1 = require("@google/generative-ai");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const analyzePhysiqueAndRecommend = async (imageBase64, mimeType, language = 'en') => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            generationConfig: { responseMimeType: "application/json" }
        });
        const prompt = `You are a professional fitness coach. Analyze this physique photo.
    Return JSON only with this schema:
    {
      "bodyType": "Ectomorph|Mesomorph|Endomorph",
      "fitnessGoal": "Build Muscle|Lose Fat|Maintain",
      "explanation": "Brief string explaining why",
      "recommendedCategories": ["Protein", "Gainer", "Creatine", "BCAA", "Fat_Burner", "Pre_Workout", "Vitamins"]
    }. PLEASE NOTE: IT IS MANDATORY TO PROVIDE THE "explanation" AND "bodyType" SPECIFICALLY TRANSLATED INTO ISO-639-1 LANGUAGE CODE: "${language.toUpperCase()}".`;
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType
            }
        };
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        const aiAnalysis = JSON.parse(responseText);
        const recommendedProducts = await prisma.product.findMany({
            where: {
                category: {
                    in: aiAnalysis.recommendedCategories
                },
                stock_quantity: {
                    gt: 0
                }
            },
            take: 6
        });
        return {
            aiAnalysis,
            recommendedProducts
        };
    }
    catch (error) {
        console.error("AI Analysis Failed:", error);
        throw new Error("Failed to analyze image and generate recommendations");
    }
};
exports.analyzePhysiqueAndRecommend = analyzePhysiqueAndRecommend;
