import { Response } from 'express';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

export const addLoan = (req: AuthRequest, res: Response): void => {
  try {
    const { friendName, amount, dueDate } = req.body;
    const userId = req.userId!;

    if (!friendName || !amount || !dueDate) {
      res.status(400).json({ error: 'friendName, amount, and dueDate are required' });
      return;
    }

    const id = Math.random().toString(36).substring(2, 11);
    db.prepare('INSERT INTO loans (id, userId, friendName, amount, dueDate) VALUES (?, ?, ?, ?, ?)')
      .run(id, userId, friendName, parseFloat(amount), dueDate);

    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(id);
    res.status(201).json(loan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add loan entry' });
  }
};

export const getLoans = (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.userId!;
    const loans = db.prepare('SELECT * FROM loans WHERE userId = ? ORDER BY createdAt DESC').all(userId);
    
    // Format isRepaid from integer (0/1) to boolean
    const formattedLoans = loans.map((loan: any) => ({
      ...loan,
      isRepaid: Boolean(loan.isRepaid),
    }));

    res.json(formattedLoans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
};

export const markAsRepaid = (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    db.prepare('UPDATE loans SET isRepaid = 1 WHERE id = ? AND userId = ?').run(id, userId);

    res.json({ message: 'Marked as repaid successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update loan' });
  }
};

export const getSummary = (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.userId!;
    const loans: any[] = db.prepare('SELECT * FROM loans WHERE userId = ?').all(userId);

    const now = new Date();

    let totalLent = 0;
    let totalRepaid = 0;
    let overdueAmount = 0;

    loans.forEach((loan) => {
      totalLent += loan.amount;

      if (loan.isRepaid) {
        totalRepaid += loan.amount;
      } else {
        if (new Date(loan.dueDate) < now) {
          overdueAmount += loan.amount;
        }
      }
    });

    res.json({
      totalLent,
      totalRepaid,
      overdueAmount,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate summary' });
  }
};