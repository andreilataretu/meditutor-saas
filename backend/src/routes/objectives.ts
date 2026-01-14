import { Router, Response } from 'express';
import pool from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Get objectives for a client
router.get('/client/:clientId', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM client_objectives WHERE client_id = $1 AND user_id = $2 ORDER BY created_at DESC',
      [req.params.clientId, req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get objectives error:', error);
    res.status(500).json({ error: 'Failed to fetch objectives' });
  }
});

// Create objective
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, objectiveText, status, targetDate } = req.body;

    const result = await pool.query(
      `INSERT INTO client_objectives (user_id, client_id, objective_text, status, target_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, clientId, objectiveText, status || 'În progres', targetDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create objective error:', error);
    res.status(500).json({ error: 'Failed to create objective' });
  }
});

// Update objective
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { objectiveText, status, targetDate } = req.body;

    const result = await pool.query(
      `UPDATE client_objectives 
       SET objective_text = $1, status = $2, target_date = $3
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [objectiveText, status, targetDate, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Objective not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update objective error:', error);
    res.status(500).json({ error: 'Failed to update objective' });
  }
});

// Delete objective
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM client_objectives WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Objective not found' });
    }

    res.json({ message: 'Objective deleted successfully' });
  } catch (error) {
    console.error('Delete objective error:', error);
    res.status(500).json({ error: 'Failed to delete objective' });
  }
});

export default router;
