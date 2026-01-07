import { Request, Response } from 'express';
import { InventoryModel } from './inventory.model';

export const getInventory = async (req: Request, res: Response) => {
  try {
    const { variantId } = req.query;
    const query: any = {};
    if (variantId) query.variantId = variantId;

    const inventory = await InventoryModel.find(query)
      .populate('variantId');

    res.json({ inventory });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { variantId, quantity, reservedQuantity, lowStockThreshold } = req.body;

    if (!variantId) {
      return res.status(400).json({ error: 'variantId is required' });
    }

    const inventory = await InventoryModel.findOneAndUpdate(
      { variantId },
      {
        $set: {
          ...(quantity !== undefined && { quantity }),
          ...(reservedQuantity !== undefined && { reservedQuantity }),
          ...(lowStockThreshold !== undefined && { lowStockThreshold })
        }
      },
      { new: true, upsert: true }
    ).populate('variantId');

    res.json({ inventory });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
};

