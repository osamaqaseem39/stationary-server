import { Request, Response } from 'express';
import { ProductVariantModel } from './productVariant.model';
import { InventoryModel } from '../inventory/inventory.model';

export const getVariants = async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    const query: any = { isActive: true };
    if (productId) query.productId = productId;

    const variants = await ProductVariantModel.find(query)
      .populate('productId');

    res.json({ variants });
  } catch (error) {
    console.error('Get variants error:', error);
    res.status(500).json({ error: 'Failed to fetch variants' });
  }
};

export const createVariant = async (req: Request, res: Response) => {
  try {
    const { productId, sku, price, compareAtPrice, attributes } = req.body;

    if (!productId || !sku || !price) {
      return res.status(400).json({ error: 'productId, sku, and price are required' });
    }

    const variant = await ProductVariantModel.create({
      productId,
      sku,
      price,
      compareAtPrice,
      attributes: attributes || {}
    });

    // Create inventory entry
    await InventoryModel.create({
      variantId: variant._id,
      quantity: 0
    });

    res.status(201).json({ variant });
  } catch (error) {
    console.error('Create variant error:', error);
    res.status(500).json({ error: 'Failed to create variant' });
  }
};

export const updateVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const variant = await ProductVariantModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    res.json({ variant });
  } catch (error) {
    console.error('Update variant error:', error);
    res.status(500).json({ error: 'Failed to update variant' });
  }
};

