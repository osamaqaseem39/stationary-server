import { Request, Response } from 'express';
import { ProductVariantModel } from './productVariant.model';
import { InventoryModel } from '../inventory/inventory.model';

export const getVariants = async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    const query: any = { isActive: true };
    if (productId) query.productId = productId;

    const variants = await ProductVariantModel.find(query)
      .populate('productId')
      .sort({ createdAt: -1 });

    res.json({ variants });
  } catch (error) {
    console.error('Get variants error:', error);
    res.status(500).json({ error: 'Failed to fetch variants' });
  }
};

export const getVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const variant = await ProductVariantModel.findById(id)
      .populate('productId');

    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    // Get inventory
    const inventory = await InventoryModel.findOne({ variantId: id });
    
    res.json({
      variant: {
        ...variant.toObject(),
        inventory: inventory ? inventory.quantity : 0,
        available: inventory ? inventory.quantity - (inventory.reservedQuantity || 0) : 0
      }
    });
  } catch (error) {
    console.error('Get variant error:', error);
    res.status(500).json({ error: 'Failed to fetch variant' });
  }
};

export const createVariant = async (req: Request, res: Response) => {
  try {
    const {
      productId,
      sku,
      barcode,
      price,
      compareAtPrice,
      costPerItem,
      trackQuantity,
      quantity,
      allowBackorder,
      lowStockThreshold,
      weight,
      requiresShipping,
      attributes,
      isActive,
      taxable
    } = req.body;

    if (!productId || !sku || price === undefined) {
      return res.status(400).json({ error: 'productId, sku, and price are required' });
    }

    const variant = await ProductVariantModel.create({
      productId,
      sku,
      barcode,
      price,
      compareAtPrice,
      costPerItem,
      trackQuantity: trackQuantity !== false,
      quantity,
      allowBackorder: allowBackorder || false,
      lowStockThreshold,
      weight,
      requiresShipping: requiresShipping !== false,
      attributes: attributes || {},
      isActive: isActive !== false,
      taxable: taxable !== false
    });

    // Create inventory entry if tracking quantity
    if (variant.trackQuantity) {
      await InventoryModel.create({
        variantId: variant._id,
        quantity: variant.quantity || 0
      });
    }

    res.status(201).json({ variant });
  } catch (error) {
    console.error('Create variant error:', error);
    res.status(500).json({ error: 'Failed to create variant' });
  }
};

export const updateVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };
    
    // Handle attributes - ensure it's an object
    if (updateData.attributes && typeof updateData.attributes === 'object') {
      // Convert to Map-compatible format if needed
      updateData.attributes = updateData.attributes;
    }

    const variant = await ProductVariantModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    // Update inventory if quantity tracking is enabled
    if (variant.trackQuantity && updateData.quantity !== undefined) {
      await InventoryModel.findOneAndUpdate(
        { variantId: id },
        { quantity: updateData.quantity },
        { upsert: true }
      );
    }

    res.json({ variant });
  } catch (error) {
    console.error('Update variant error:', error);
    res.status(500).json({ error: 'Failed to update variant' });
  }
};

export const deleteVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const variant = await ProductVariantModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    res.json({ message: 'Variant deleted successfully' });
  } catch (error) {
    console.error('Delete variant error:', error);
    res.status(500).json({ error: 'Failed to delete variant' });
  }
};
