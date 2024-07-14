import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const authRouter = express.Router();


const userSchema = new mongoose.Schema({
  role:String,
  name: String,
  email: String,
  password: String,
  roleid: String,
  address:String,
});

const User = mongoose.model('User', userSchema);


authRouter.post('/signup', async (req, res) => {
  try {
    const {role, name, email, password ,roleid,address} = req.body;
  
    if (!role|| !name|| !email|| !password ||!roleid||!address) {
      return res.status(400).json({ error: 'fields are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const user = new User({ role,name, email, password: hashedPassword,roleid,address });
    await user.save();
    
    res.status(200).json({message:'Account Created Successfully'});
    console.log('Data saved in User db:', user);
  } catch (error) {
    console.error('Error saving User:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const {role, email, password,address } = req.body;
    
    if (!role||  !email|| !password ||!address ) {
      return res.status(400).json({ error: 'fields are required' });
    }
    const user = await User.findOne({role, email,address });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password); // Compare hashed password
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create and return JWT token on successful login
    const token = jwt.sign({ email: user.email, id: user._id }, "SECRET", { expiresIn: '1h' });
    res.status(200).json({ message:"Login Successful" });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/profile', async (req, res) => {
  try {
    const {role, email,address } = req.body;
    
    if (!role||  !email ||!address ) {
      return res.status(400).json({ error: 'fields are required' });
    }
    const user = await User.findOne({role, email,address });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message:"Profile fetched successfully",name:user.name,roleid:user.roleid });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  // jwt.verify(token, process.env.JWT_SECRET, (err, decoded)
  jwt.verify(token, "SECRET", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token expired or invalid' });
    }
    req.user = decoded;
    next();
  });
};

// Protected route example
authRouter.get('/JwtProfile', verifyToken, (req, res) => {
  res.json({ message: 'Protected route accessed successfully', user: req.user });
});

export default authRouter;

