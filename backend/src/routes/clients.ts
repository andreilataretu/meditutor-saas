import { Router, Response } from 'express';
import pool from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all clients
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get single client
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Create client
router.post(
  '/',
  [
    body('studentName').trim().notEmpty(),
    body('grade').isInt({ min: 8, max: 12 }),
    body('subject').isIn(['Fizică', 'Matematică', 'Ambele']),
    body('rate').isNumeric(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        studentName,
        parentName,
        studentPhone,
        parentPhone,
        grade,
        subject,
        rate,
        status = 'activ'
      } = req.body;

      const result = await pool.query(
        `INSERT INTO clients (user_id, student_name, parent_name, student_phone, parent_phone, grade, subject, rate, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [req.userId, studentName, parentName, studentPhone, parentPhone, grade, subject, rate, status]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create client error:', error);
      res.status(500).json({ error: 'Failed to create client' });
    }
  }
);

// Update client
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const {
      studentName,
      parentName,
      studentPhone,
      parentPhone,
      grade,
      subject,
      rate,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE clients 
       SET student_name = $1, parent_name = $2, student_phone = $3, parent_phone = $4,
           grade = $5, subject = $6, rate = $7, status = $8
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [studentName, parentName, studentPhone, parentPhone, grade, subject, rate, status, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Get client statistics
router.get('/:id/stats', async (req: AuthRequest, res: Response) => {
  try {
    const statsResult = await pool.query(
      `SELECT 
        COUNT(s.id) as total_sessions,
        SUM(CASE WHEN s.payment_status = 'Plătit' THEN c.rate ELSE 0 END) as total_paid,
        SUM(CASE WHEN s.payment_status = 'Neplătit' THEN c.rate ELSE 0 END) as total_unpaid
       FROM sessions s
       JOIN clients c ON s.client_id = c.id
       WHERE s.client_id = $1 AND s.user_id = $2`,
      [req.params.id, req.userId]
    );

    res.json(statsResult.rows[0]);
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({ error: 'Failed to fetch client statistics' });
  }
});

export default router;
