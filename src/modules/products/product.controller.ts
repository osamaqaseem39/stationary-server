import { Request, Response } from 'express';
import { ProductModel } from './product.model';
import { ProductVariantModel } from './productVariant.model';
import { InventoryModel } from '../inventory/inventory.model';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { categoryId, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { isActive: true };
    if (categoryId) query.categoryId = categoryId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await ProductModel.find(query)
      .populate('categoryId')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await ProductModel.countDocuments(query);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id)
      .populate('categoryId');

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get variants with inventory
    const variants = await ProductVariantModel.find({ productId: id, isActive: true });
    const variantIds = variants.map(v => v._id);
    const inventory = await InventoryModel.find({ variantId: { $in: variantIds } });

    const variantsWithInventory = variants.map(variant => {
      const inv = inventory.find(i => i.variantId.toString() === variant._id.toString());
      return {
        ...variant.toObject(),
        inventory: inv ? inv.quantity : 0,
        available: inv ? inv.quantity - (inv.reservedQuantity || 0) : 0
      };
    });

    res.json({
      product,
      variants: variantsWithInventory
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, categoryId, brand } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Name and categoryId are required' });
    }

    const product = await ProductModel.create({
      name,
      description,
      categoryId,
      brand
    });

    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

