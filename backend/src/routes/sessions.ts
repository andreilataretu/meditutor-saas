import { Router, Response } from 'express';
import pool from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();
router.use(authMiddleware);

// Get all sessions
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, clientId, paymentStatus } = req.query;
    
    let query = `
      SELECT s.*, c.student_name, c.rate 
      FROM sessions s
      JOIN clients c ON s.client_id = c.id
      WHERE s.user_id = $1
    `;
    const params: any[] = [req.userId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      query += ` AND s.session_date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND s.session_date <= $${paramCount}`;
      params.push(endDate);
    }

    if (clientId) {
      paramCount++;
      query += ` AND s.client_id = $${paramCount}`;
      params.push(clientId);
    }

    if (paymentStatus) {
      paramCount++;
      query += ` AND s.payment_status = $${paramCount}`;
      params.push(paymentStatus);
    }

    query += ' ORDER BY s.session_date DESC, s.session_time DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get single session
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.*, c.student_name, c.rate 
       FROM sessions s
       JOIN clients c ON s.client_id = c.id
       WHERE s.id = $1 AND s.user_id = $2`,
      [req.params.id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Create session
router.post(
  '/',
  [
    body('clientId').isUUID(),
    body('sessionDate').isDate(),
    body('sessionTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        clientId,
        sessionDate,
        sessionTime,
        description,
        paymentStatus = 'Neplătit'
      } = req.body;

      const result = await pool.query(
        `INSERT INTO sessions (user_id, client_id, session_date, session_time, description, payment_status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.userId, clientId, sessionDate, sessionTime, description, paymentStatus]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  }
);

// Update session
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const {
      clientId,
      sessionDate,
      sessionTime,
      description,
      paymentStatus
    } = req.body;

    const result = await pool.query(
      `UPDATE sessions 
       SET client_id = $1, session_date = $2, session_time = $3, 
           description = $4, payment_status = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [clientId, sessionDate, sessionTime, description, paymentStatus, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete session
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Mark session as paid
router.patch('/:id/mark-paid', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `UPDATE sessions 
       SET payment_status = 'Plătit'
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Mark paid error:', error);
    res.status(500).json({ error: 'Failed to mark session as paid' });
  }
});

export default router;
