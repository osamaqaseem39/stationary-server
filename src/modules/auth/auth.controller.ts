import { Request, Response } from 'express';
import { UserModel } from '../users/user.model';
import { RoleModel } from './role.model';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../../utils/jwt';
import { AuthRequest } from '../../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Get or create customer role
    let customerRole = await RoleModel.findOne({ name: 'customer' });
    if (!customerRole) {
      // Create customer role if it doesn't exist
      customerRole = await RoleModel.create({
        name: 'customer',
        permissions: ['read:products', 'read:categories', 'create:orders', 'read:own:orders']
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await UserModel.create({
      name,
      email,
      passwordHash,
      roleId: customerRole._id
    });

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      roleId: user.roleId.toString()
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await UserModel.findOne({ email }).populate('roleId');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      roleId: user.roleId.toString()
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);

    // Verify user still exists and is active
    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      roleId: user.roleId.toString()
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.user?.userId)
      .select('-passwordHash')
      .populate('roleId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

