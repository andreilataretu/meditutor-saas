import { Router, Response } from 'express';
import pool from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import path from 'path';
import fs from 'fs';

const router = Router();
router.use(authMiddleware);

// Get all materials
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { subject, grade, materialType } = req.query;
    
    let query = 'SELECT * FROM materials WHERE user_id = $1';
    const params: any[] = [req.userId];
    let paramCount = 1;

    if (subject) {
      paramCount++;
      query += ` AND subject = $${paramCount}`;
      params.push(subject);
    }

    if (grade) {
      paramCount++;
      query += ` AND grade = $${paramCount}`;
      params.push(grade);
    }

    if (materialType) {
      paramCount++;
      query += ` AND material_type = $${paramCount}`;
      params.push(materialType);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// Get single material
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM materials WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
});

// Create material with file upload
router.post('/', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, materialType, subject, grade, fileUrl } = req.body;

    let filePath = null;
    if (req.file) {
      filePath = `/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      `INSERT INTO materials (user_id, title, description, material_type, subject, grade, file_path, file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, title, description, materialType, subject, grade, filePath, fileUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

// Update material
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, materialType, subject, grade, fileUrl } = req.body;

    const result = await pool.query(
      `UPDATE materials 
       SET title = $1, description = $2, material_type = $3, subject = $4, grade = $5, file_url = $6
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [title, description, materialType, subject, grade, fileUrl, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ error: 'Failed to update material' });
  }
});

// Delete material
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const material = await pool.query(
      'SELECT file_path FROM materials WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (material.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Delete file if exists
    if (material.rows[0].file_path) {
      const fullPath = path.join(process.cwd(), material.rows[0].file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await pool.query(
      'DELETE FROM materials WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

// Download file
router.get('/:id/download', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT file_path, title FROM materials WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].file_path) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(process.cwd(), result.rows[0].file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(filePath, result.rows[0].title);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

export default router;
