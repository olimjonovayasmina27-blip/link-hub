"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const upload_middleware_1 = require("./middleware/upload.middleware");
const api_controller_1 = require("./controllers/api.controller");
const product_controller_1 = require("./controllers/product.controller");
const order_controller_1 = require("./controllers/order.controller");
const payment_controller_1 = require("./controllers/payment.controller");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// AI Body Analysis
app.post('/api/ai/analyze', upload_middleware_1.upload.single('physique_image'), api_controller_1.handlePhotoAnalysis);
// Core E-commerce Endpoints
app.get('/api/products', product_controller_1.getAvailableProducts);
app.post('/api/orders', order_controller_1.createOrder);
// Admin Endpoints
app.post('/api/products', product_controller_1.addProduct);
app.put('/api/products/:id/stock', product_controller_1.updateStock);
app.delete('/api/products/:id', product_controller_1.deleteProduct);
app.get('/api/orders', order_controller_1.getOrders);
app.put('/api/orders/:id/status', order_controller_1.updateOrderStatus);
// Payment Integrations
app.post('/api/payments/generate', payment_controller_1.generatePaymentUrl);
app.post('/api/payments/callback/click', payment_controller_1.clickWebhookHandler);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
