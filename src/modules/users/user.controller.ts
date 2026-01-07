import { Request, Response } from 'express';
import { UserModel } from './user.model';
import { AddressModel } from './address.model';
import { AuthRequest } from '../../middleware/auth';

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const addresses = await AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { line1, line2, city, state, postalCode, country, isDefault } = req.body;

    if (!line1 || !city || !state || !postalCode) {
      return res.status(400).json({ error: 'Required address fields are missing' });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await AddressModel.updateMany({ userId }, { isDefault: false });
    }

    const address = await AddressModel.create({
      userId,
      line1,
      line2,
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: isDefault || false
    });

    res.status(201).json({ address });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ error: 'Failed to create address' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const address = await AddressModel.findOne({ _id: id, userId });
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // If setting as default, unset other defaults
    if (req.body.isDefault) {
      await AddressModel.updateMany({ userId, _id: { $ne: id } }, { isDefault: false });
    }

    Object.assign(address, req.body);
    await address.save();

    res.json({ address });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const address = await AddressModel.findOneAndDelete({ _id: id, userId });
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
};

