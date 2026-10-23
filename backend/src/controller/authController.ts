import { Request, Response } from 'express';
import db from '../db';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'crypto';

const otpStore: { [key: string]: string } = {};

export const sendOtp = (req: Request, res: Response): void => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400).json({ error: 'Phone number is required' });
    return;
  }

  const mockOtp = '1234';
  otpStore[phone] = mockOtp;

  console.log(`\n====================================`);
  console.log(`[MOCK OTP SERVER LOG] Phone: ${phone} | OTP: ${mockOtp}`);
  console.log(`====================================\n`);

  res.json({ message: 'OTP sent successfully (Check server logs)' });
};

export const verifyOtp = (req: Request, res: Response): void => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    res.status(400).json({ error: 'Phone and OTP are required' });
    return;
  }

  if (otpStore[phone] !== otp) {
    res.status(400).json({ error: 'Invalid OTP' });
    return;
  }

  delete otpStore[phone];

  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as any;

  if (!user) {
    const id = Math.random().toString(36).substring(2, 11);
    db.prepare('INSERT INTO users (id, phone) VALUES (?, ?)').run(id, phone);
    user = { id, phone };
  }

  const token = jwt.sign({ userId: user.id, phone: user.phone }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });

  res.json({ token, user });
};