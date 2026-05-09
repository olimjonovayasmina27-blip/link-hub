"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateStock = exports.addProduct = exports.getAvailableProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({ log: ['error'] });
const getAvailableProducts = async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Internal Server Error",
        });
    }
};
exports.getAvailableProducts = getAvailableProducts;
const addProduct = async (req, res) => {
    try {
        const { name, description, category, price, stock_quantity, imageUrl } = req.body;
        if (!name || !description || !category || price == null || stock_quantity == null) {
            return res.status(400).json({ success: false, error: "Missing required product fields" });
        }
        const newProduct = await prisma.product.create({
            data: { name, description, category, price: parseFloat(price), stock_quantity: parseInt(stock_quantity), imageUrl }
        });
        return res.status(201).json({ success: true, data: newProduct });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal Server Error" });
    }
};
exports.addProduct = addProduct;
const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock_quantity } = req.body;
        if (stock_quantity == null) {
            return res.status(400).json({ success: false, error: "Missing stock quantity" });
        }
        const updatedProduct = await prisma.product.update({
            where: { id: id },
            data: { stock_quantity: parseInt(stock_quantity) }
        });
        return res.status(200).json({ success: true, data: updatedProduct });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Error updating stock" });
    }
};
exports.updateStock = updateStock;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id: id }
        });
        return res.status(200).json({ success: true, message: "Product deleted" });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Error deleting product" });
    }
};
exports.deleteProduct = deleteProduct;
