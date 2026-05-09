import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error'] });

const CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID || '12345';
const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID || '9999';
const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY || 'SECRETKEY';

export const generatePaymentUrl = async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;
    if (!orderId || !amount) {
      return res.status(400).json({ success: false, error: "Missing orderId or amount" });
    }

    // Format: https://my.click.uz/services/pay?service_id={service_id}&merchant_id={merchant_id}&amount={amount}&transaction_param={order_id}
    const paymentUrl = `https://my.click.uz/services/pay?service_id=${CLICK_SERVICE_ID}&merchant_id=${CLICK_MERCHANT_ID}&amount=${amount}&transaction_param=${orderId}`;
    
    return res.status(200).json({ success: true, paymentUrl });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to generate payment url" });
  }
};

export const clickWebhookHandler = async (req: Request, res: Response) => {
  try {
    const { 
      click_trans_id, service_id, click_paydoc_id, 
      merchant_trans_id, amount, action, error, 
      error_note, sign_time, sign_string 
    } = req.body;

    // We recreate MD5 signature to verify authenticity.
    const strToHash = `${click_trans_id}${service_id}${CLICK_SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`;
    const generatedSign = crypto.createHash('md5').update(strToHash).digest('hex');

    if (generatedSign !== sign_string) {
      return res.json({ error: -1, error_note: "Sign check error" });
    }

    // Action 0 = Prepare
    if (parseInt(action) === 0) {
      return res.json({
        click_trans_id,
        merchant_trans_id,
        merchant_prepare_id: click_trans_id,
        error: 0,
        error_note: "Success"
      });
    }
    
    // Action 1 = Complete
    if (parseInt(action) === 1) {
      const dbOrder = await prisma.order.findUnique({ where: { id: merchant_trans_id } });
      if (!dbOrder) return res.json({ error: -5, error_note: "Order does not exist" });

      if (parseInt(error) === 0) { // Success status from Click gateway
        await prisma.order.update({
          where: { id: merchant_trans_id },
          data: { status: 'PAID' }
        });
      }

      return res.json({
        click_trans_id,
        merchant_trans_id,
        merchant_confirm_id: click_trans_id,
        error: 0,
        error_note: "Success"
      });
    }

    return res.json({ error: -3, error_note: "Action not found" });

  } catch (error) {
    return res.json({ error: -8, error_note: "Error in request from click" });
  }
};
