import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { userId, items } = req.body;
    // items should be an array of { productId, quantity, priceAtBuy }

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid order data" });
    }

    // Calculate total price
    const totalPrice = items.reduce((sum: number, item: any) => sum + (item.priceAtBuy * item.quantity), 0);

    // Create order and order items in a transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // 1. Create the base order
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalPrice,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtBuy: item.priceAtBuy
            }))
          }
        },
        include: {
          items: true
        }
      });

      // 2. Decrement stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock_quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Error fetching orders" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, error: "Missing status" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });
    return res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Error updating order status" });
  }
};
