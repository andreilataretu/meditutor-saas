import { Router, Response } from 'express';
import pool from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Get journal for a session
router.get('/session/:sessionId', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM session_journals WHERE session_id = $1 AND user_id = $2',
      [req.params.sessionId, req.userId]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Get journal error:', error);
    res.status(500).json({ error: 'Failed to fetch journal' });
  }
});

// Create or update journal
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, topicsCovered, homeworkAssigned, studentMood, notes } = req.body;

    // Check if journal exists
    const existing = await pool.query(
      'SELECT id FROM session_journals WHERE session_id = $1 AND user_id = $2',
      [sessionId, req.userId]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update
      result = await pool.query(
        `UPDATE session_journals 
         SET topics_covered = $1, homework_assigned = $2, student_mood = $3, notes = $4
         WHERE session_id = $5 AND user_id = $6 RETURNING *`,
        [topicsCovered, homeworkAssigned, studentMood, notes, sessionId, req.userId]
      );
    } else {
      // Create
      result = await pool.query(
        `INSERT INTO session_journals (user_id, session_id, topics_covered, homework_assigned, student_mood, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [req.userId, sessionId, topicsCovered, homeworkAssigned, studentMood, notes]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Save journal error:', error);
    res.status(500).json({ error: 'Failed to save journal' });
  }
});

// Delete journal
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM session_journals WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    res.json({ message: 'Journal deleted successfully' });
  } catch (error) {
    console.error('Delete journal error:', error);
    res.status(500).json({ error: 'Failed to delete journal' });
  }
});

export default router;
