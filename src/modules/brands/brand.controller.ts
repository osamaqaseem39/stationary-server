import { Request, Response } from 'express';
import { BrandModel } from './brand.model';

export const getBrands = async (req: Request, res: Response) => {
  try {
    const brands = await BrandModel.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 });

    res.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
};

export const getBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const brand = await BrandModel.findById(id);

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json({ brand });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      shortDescription,
      seoTitle,
      seoDescription,
      seoKeywords,
      image,
      displayOrder,
      isActive,
      featured
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Generate slug if not provided
    let generatedSlug = slug;
    if (!generatedSlug) {
      generatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const brand = await BrandModel.create({
      name,
      slug: generatedSlug,
      description,
      shortDescription,
      seoTitle,
      seoDescription,
      seoKeywords,
      image,
      displayOrder: displayOrder || 0,
      isActive: isActive !== false,
      featured: featured || false
    });

    res.status(201).json({ brand });
  } catch (error: any) {
    console.error('Create brand error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Brand with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create brand' });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };
    
    // Generate slug if name changed and slug not provided
    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const brand = await BrandModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json({ brand });
  } catch (error: any) {
    console.error('Update brand error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Brand with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update brand' });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const brand = await BrandModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
};

