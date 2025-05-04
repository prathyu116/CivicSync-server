import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { signToken } from '../utils/jwt';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
         res.status(400).json({ message: 'Please provide name, email, and password' });
         return;
    }
    if (password.length < 6) {
         res.status(400).json({ message: 'Password must be at least 6 characters long' });
         return
    }

    let user = await User.findOne({ email });
    if (user) {
       res.status(400).json({ message: 'User already exists' });
      return
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword, 
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    const token = signToken(user.id);

     res.status(201).json({
      token,
      user: userResponse,
    });
  } catch (error: any) {
    console.error('Register error:', error.message);
     res.status(500).json({ message: 'Server error during registration' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
         res.status(400).json({ message: 'Please provide email and password' });
        return
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
       res.status(400).json({ message: 'Invalid credentials' }); 
       return
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
       res.status(400).json({ message: 'Invalid credentials' });
      return
    }

    const token = signToken(user.id);

    const userResponse = user.toObject();
    delete userResponse.password;

     res.json({
      token,
      user: userResponse,
    });
  } catch (error: any) {
    console.error('Login error:', error.message);
     res.status(500).json({ message: 'Server error during login' });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
         res.status(401).json({ message: 'Not authorized' }); 
         return
    }

    const user = await User.findById(req.user.id); 
    if (!user) {
       res.status(404).json({ message: 'User not found' });
      return
    }
     res.json(user);
  } catch (error: any) {
    console.error('Get profile error:', error.message);
     res.status(500).json({ message: 'Server error retrieving profile' });
  }
};