import { Router, Response } from 'express';
import pool from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Get notes for a client
router.get('/client/:clientId', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM client_notes WHERE client_id = $1 AND user_id = $2 ORDER BY created_at DESC',
      [req.params.clientId, req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create note
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, noteText } = req.body;

    const result = await pool.query(
      'INSERT INTO client_notes (user_id, client_id, note_text) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, clientId, noteText]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { noteText } = req.body;

    const result = await pool.query(
      'UPDATE client_notes SET note_text = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [noteText, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM client_notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
