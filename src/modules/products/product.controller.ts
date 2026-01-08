import { Request, Response } from 'express';
import { ProductModel } from './product.model';
import { ProductVariantModel } from './productVariant.model';
import { InventoryModel } from '../inventory/inventory.model';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { categoryId, search, page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    
    // Only filter by isActive if status is not explicitly provided
    if (!status || status === 'active') {
      query.isActive = true;
    }
    
    if (status && status !== 'active') {
      query.status = status;
    }
    
    if (categoryId) query.categoryId = categoryId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await ProductModel.find(query)
      .populate('categoryId')
      .populate('brandId')
      .skip(skip)
      .limit(Number(limit))
      .sort({ menuOrder: 1, createdAt: -1 });

    const total = await ProductModel.countDocuments(query);

    res.json({
      products,
      total,
      page: Number(page),
      limit: Number(limit),
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
      .populate('categoryId')
      .populate('brandId');

    if (!product) {
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
    const {
      name,
      shortDescription,
      description,
      categoryId,
      productType,
      brand,
      brandId,
      vendor,
      tags,
      status,
      featured,
      regularPrice,
      salePrice,
      taxStatus,
      taxClass,
      sku,
      manageStock,
      stockQuantity,
      stockStatus,
      backorders,
      lowStockThreshold,
      weight,
      length,
      width,
      height,
      shippingClass,
      requiresShipping,
      shippingTaxable,
      seoTitle,
      seoDescription,
      seoSlug,
      seoKeywords,
      images,
      purchaseNote,
      menuOrder,
      reviewsAllowed,
      catalogVisibility,
      isActive,
      // Uniform fields
      size,
      color,
      gender,
      material,
      style,
      schoolName,
      grade,
      uniformType
    } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Name and categoryId are required' });
    }

    const product = await ProductModel.create({
      name,
      shortDescription,
      description,
      categoryId,
      productType,
      brand,
      brandId,
      vendor,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      status: status || 'active',
      featured: featured || false,
      regularPrice,
      salePrice,
      taxStatus: taxStatus || 'taxable',
      taxClass: taxClass || 'standard',
      sku,
      manageStock: manageStock !== false,
      stockQuantity,
      stockStatus: stockStatus || 'instock',
      backorders: backorders || 'no',
      lowStockThreshold,
      weight,
      length,
      width,
      height,
      shippingClass,
      requiresShipping: requiresShipping !== false,
      shippingTaxable: shippingTaxable !== false,
      seoTitle,
      seoDescription,
      seoSlug,
      seoKeywords,
      images: Array.isArray(images) ? images : [],
      purchaseNote,
      menuOrder: menuOrder || 0,
      reviewsAllowed: reviewsAllowed !== false,
      catalogVisibility: catalogVisibility || 'visible',
      isActive: isActive !== false,
      // Uniform fields
      size,
      color,
      gender,
      material,
      style,
      schoolName,
      grade,
      uniformType
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
    const updateData: any = { ...req.body };
    
    // Handle tags array conversion
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
    }
    
    // Handle images array
    if (updateData.images && !Array.isArray(updateData.images)) {
      updateData.images = [];
    }

    const product = await ProductModel.findByIdAndUpdate(
      id,
      updateData,
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
      { isActive: false, status: 'archived' },
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
