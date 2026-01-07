import { Request, Response } from 'express';
import { CategoryModel } from './category.model';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { parentId } = req.query;
    const query: any = { isActive: true };
    if (parentId) {
      query.parentId = parentId;
    } else if (parentId === null || parentId === 'null') {
      query.parentId = null;
    }

    const categories = await CategoryModel.find(query)
      .populate('parentId')
      .sort({ displayOrder: 1, name: 1 });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(id)
      .populate('parentId');

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      parentId,
      description,
      shortDescription,
      seoTitle,
      seoDescription,
      seoKeywords,
      image,
      displayOrder,
      isActive,
      showInMenu,
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

    const category = await CategoryModel.create({
      name,
      slug: generatedSlug,
      parentId: parentId || undefined,
      description,
      shortDescription,
      seoTitle,
      seoDescription,
      seoKeywords,
      image,
      displayOrder: displayOrder || 0,
      isActive: isActive !== false,
      showInMenu: showInMenu !== false,
      featured: featured || false
    });

    res.status(201).json({ category });
  } catch (error: any) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
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
    
    // Handle parentId - set to undefined if empty string
    if (updateData.parentId === '') {
      updateData.parentId = undefined;
    }

    const category = await CategoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error: any) {
    console.error('Update category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
