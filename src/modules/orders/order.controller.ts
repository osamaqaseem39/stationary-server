import { Request, Response } from 'express';
import { OrderModel } from './order.model';
import { InventoryModel } from '../inventory/inventory.model';
import { ProductVariantModel } from '../products/productVariant.model';
import { ProductModel } from '../products/product.model';
import { AuthRequest } from '../../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, addressId, shippingCost = 0, tax = 0 } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    if (!addressId) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    // Validate inventory and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const variant = await ProductVariantModel.findById(item.variantId);
      if (!variant || !variant.isActive) {
        return res.status(400).json({ error: `Invalid variant: ${item.variantId}` });
      }

      const inventory = await InventoryModel.findOne({ variantId: item.variantId });
      const available = inventory ? inventory.quantity - (inventory.reservedQuantity || 0) : 0;

      if (available < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for variant ${item.variantId}. Available: ${available}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = variant.price * item.quantity;
      subtotal += itemTotal;

      // Fetch product to get name
      const product = await ProductModel.findById(variant.productId);
      const productName = product?.name || '';

      orderItems.push({
        variantId: variant._id,
        price: variant.price,
        quantity: item.quantity,
        productName,
        variantAttributes: variant.attributes
      });
    }

    const total = subtotal + shippingCost + tax;

    // Create order
    const order = await OrderModel.create({
      userId,
      addressId,
      items: orderItems,
      subtotal,
      shippingCost,
      tax,
      total,
      status: 'pending'
    });

    // Reserve inventory
    for (const item of items) {
      await InventoryModel.findOneAndUpdate(
        { variantId: item.variantId },
        { $inc: { reservedQuantity: item.quantity } }
      );
    }

    res.status(201).json({ order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const isAdmin = req.user?.roleId; // Should check actual role

    const query: any = {};
    if (!isAdmin) {
      query.userId = userId;
    }

    const orders = await OrderModel.find(query)
      .populate('userId', 'name email')
      .populate('addressId')
      .populate('items.variantId')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const order = await OrderModel.findById(id)
      .populate('userId', 'name email')
      .populate('addressId')
      .populate('items.variantId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

