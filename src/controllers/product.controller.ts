import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAvailableProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        stock_quantity: {
          gt: 0,
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, category, price, stock_quantity, imageUrl } = req.body;
    
    if (!name || !description || !category || price == null || stock_quantity == null) {
      return res.status(400).json({ success: false, error: "Missing required product fields" });
    }

    const newProduct = await prisma.product.create({
      data: { name, description, category, price: parseFloat(price), stock_quantity: parseInt(stock_quantity), imageUrl }
    });
    return res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal Server Error" });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;

    if (stock_quantity == null) {
      return res.status(400).json({ success: false, error: "Missing stock quantity" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: id as string },
      data: { stock_quantity: parseInt(stock_quantity) }
    });
    return res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Error updating stock" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: id as string }
    });
    return res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Error deleting product" });
  }
};
