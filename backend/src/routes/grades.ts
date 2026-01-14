import { Router, Response } from 'express';
import pool from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Get grades for a client
router.get('/client/:clientId', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM client_grades WHERE client_id = $1 AND user_id = $2 ORDER BY grade_date DESC',
      [req.params.clientId, req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

// Create grade
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, gradeType, gradeValue, maxGrade, subject, gradeDate, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO client_grades (user_id, client_id, grade_type, grade_value, max_grade, subject, grade_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, clientId, gradeType, gradeValue, maxGrade || 10, subject, gradeDate, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({ error: 'Failed to create grade' });
  }
});

// Update grade
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { gradeType, gradeValue, maxGrade, subject, gradeDate, notes } = req.body;

    const result = await pool.query(
      `UPDATE client_grades 
       SET grade_type = $1, grade_value = $2, max_grade = $3, subject = $4, grade_date = $5, notes = $6
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [gradeType, gradeValue, maxGrade, subject, gradeDate, notes, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({ error: 'Failed to update grade' });
  }
});

// Delete grade
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM client_grades WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ error: 'Failed to delete grade' });
  }
});

export default router;
