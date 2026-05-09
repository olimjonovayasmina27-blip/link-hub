import express from 'express';
import cors from 'cors';
import { upload } from './middleware/upload.middleware';
import { handlePhotoAnalysis } from './controllers/api.controller';
import { getAvailableProducts, addProduct, updateStock, deleteProduct } from './controllers/product.controller';
import { createOrder, getOrders, updateOrderStatus } from './controllers/order.controller';
import { generatePaymentUrl, clickWebhookHandler } from './controllers/payment.controller';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Body Analysis
app.post('/api/ai/analyze', upload.single('physique_image'), handlePhotoAnalysis);

// Core E-commerce Endpoints
app.get('/api/products', getAvailableProducts);
app.post('/api/orders', createOrder);

// Admin Endpoints
app.post('/api/products', addProduct);
app.put('/api/products/:id/stock', updateStock);
app.delete('/api/products/:id', deleteProduct);
app.get('/api/orders', getOrders);
app.put('/api/orders/:id/status', updateOrderStatus);

// Payment Integrations
app.post('/api/payments/generate', generatePaymentUrl);
app.post('/api/payments/callback/click', clickWebhookHandler);

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
