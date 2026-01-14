import { Router, Response } from 'express';
import pool from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Dashboard statistics
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    // Total clients
    const clientsResult = await pool.query(
      'SELECT COUNT(*) as total FROM clients WHERE user_id = $1',
      [req.userId]
    );

    // Total sessions
    const sessionsResult = await pool.query(
      'SELECT COUNT(*) as total FROM sessions WHERE user_id = $1',
      [req.userId]
    );

    // Paid sessions
    const paidResult = await pool.query(
      "SELECT COUNT(*) as total FROM sessions WHERE user_id = $1 AND payment_status = 'Plătit'",
      [req.userId]
    );

    // Unpaid amount
    const unpaidResult = await pool.query(
      `SELECT SUM(c.rate) as total
       FROM sessions s
       JOIN clients c ON s.client_id = c.id
       WHERE s.user_id = $1 AND s.payment_status = 'Neplătit'`,
      [req.userId]
    );

    // Today's sessions
    const todayResult = await pool.query(
      `SELECT s.*, c.student_name
       FROM sessions s
       JOIN clients c ON s.client_id = c.id
       WHERE s.user_id = $1 AND s.session_date = CURRENT_DATE
       ORDER BY s.session_time`,
      [req.userId]
    );

    // Upcoming sessions
    const upcomingResult = await pool.query(
      `SELECT s.*, c.student_name
       FROM sessions s
       JOIN clients c ON s.client_id = c.id
       WHERE s.user_id = $1 AND s.session_date > CURRENT_DATE
       ORDER BY s.session_date, s.session_time
       LIMIT 5`,
      [req.userId]
    );

    // Recent unpaid sessions
    const unpaidSessionsResult = await pool.query(
      `SELECT s.*, c.student_name, c.rate
       FROM sessions s
       JOIN clients c ON s.client_id = c.id
       WHERE s.user_id = $1 AND s.payment_status = 'Neplătit'
       ORDER BY s.session_date DESC
       LIMIT 10`,
      [req.userId]
    );

    res.json({
      totalClients: parseInt(clientsResult.rows[0].total),
      totalSessions: parseInt(sessionsResult.rows[0].total),
      paidSessions: parseInt(paidResult.rows[0].total),
      unpaidAmount: parseFloat(unpaidResult.rows[0].total) || 0,
      todaySessions: todayResult.rows,
      upcomingSessions: upcomingResult.rows,
      unpaidSessions: unpaidSessionsResult.rows,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Financial statistics
router.get('/financial', async (req: AuthRequest, res: Response) => {
  try {
    const { months = 6 } = req.query;

    // Monthly revenue (paid vs unpaid)
    const monthlyResult = await pool.query(
      `SELECT 
        TO_CHAR(s.session_date, 'YYYY-MM') as month,
        SUM(CASE WHEN s.payment_status = 'Plătit' THEN c.rate ELSE 0 END) as paid,
        SUM(CASE WHEN s.payment_status = 'Neplătit' THEN c.rate ELSE 0 END) as unpaid
       FROM sessions s
       JOIN clients c ON s.client_id = c.id
       WHERE s.user_id = $1 AND s.session_date >= CURRENT_DATE - INTERVAL '${months} months'
       GROUP BY month
       ORDER BY month`,
      [req.userId]
    );

    // Total paid
    const totalPaidResult = await pool.query(
      `SELECT SUM(c.rate) as total
       FROM sessions s
       JOIN clients c ON s.client_id = c.id
       WHERE s.user_id = $1 AND s.payment_status = 'Plătit'`,
      [req.userId]
    );

    // Total unpaid
    const totalUnpaidResult = await pool.query(
      `SELECT SUM(c.rate) as total
       FROM sessions s
       JOIN clients c ON s.client_id = c.id
       WHERE s.user_id = $1 AND s.payment_status = 'Neplătit'`,
      [req.userId]
    );

    // Client breakdown
    const clientBreakdownResult = await pool.query(
      `SELECT 
        c.id,
        c.student_name,
        COUNT(s.id) as total_sessions,
        SUM(CASE WHEN s.payment_status = 'Plătit' THEN c.rate ELSE 0 END) as paid,
        SUM(CASE WHEN s.payment_status = 'Neplătit' THEN c.rate ELSE 0 END) as unpaid
       FROM clients c
       LEFT JOIN sessions s ON c.id = s.client_id
       WHERE c.user_id = $1
       GROUP BY c.id, c.student_name
       ORDER BY total_sessions DESC`,
      [req.userId]
    );

    res.json({
      monthlyRevenue: monthlyResult.rows,
      totalPaid: parseFloat(totalPaidResult.rows[0].total) || 0,
      totalUnpaid: parseFloat(totalUnpaidResult.rows[0].total) || 0,
      clientBreakdown: clientBreakdownResult.rows,
    });
  } catch (error) {
    console.error('Financial stats error:', error);
    res.status(500).json({ error: 'Failed to fetch financial statistics' });
  }
});

// Client activity statistics
router.get('/clients-activity', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.status,
        COUNT(*) as count
       FROM clients c
       WHERE c.user_id = $1
       GROUP BY c.status`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Client activity stats error:', error);
    res.status(500).json({ error: 'Failed to fetch client activity statistics' });
  }
});

// Monthly summary for reports
router.get('/monthly-summary', async (req: AuthRequest, res: Response) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }

    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;

    // Total sessions
    const sessionsResult = await pool.query(
      `SELECT COUNT(*) as total FROM sessions 
       WHERE user_id = $1 AND session_date >= $2 AND session_date <= $3`,
      [req.userId, startDate, endDate]
    );

    // Active clients
    const clientsResult = await pool.query(
      `SELECT COUNT(DISTINCT client_id) as total FROM sessions 
       WHERE user_id = $1 AND session_date >= $2 AND session_date <= $3`,
      [req.userId, startDate, endDate]
    );

    // Total revenue
    const revenueResult = await pool.query(
      `SELECT 
        SUM(CASE WHEN s.payment_status = 'Plătit' THEN c.rate ELSE 0 END) as paid,
        SUM(CASE WHEN s.payment_status = 'Neplătit' THEN c.rate ELSE 0 END) as unpaid
       FROM sessions s
       JOIN clients c ON s.client_id = c.id
       WHERE s.user_id = $1 AND s.session_date >= $2 AND s.session_date <= $3`,
      [req.userId, startDate, endDate]
    );

    // Client details
    const clientDetailsResult = await pool.query(
      `SELECT 
        c.student_name,
        COUNT(s.id) as sessions,
        SUM(CASE WHEN s.payment_status = 'Plătit' THEN c.rate ELSE 0 END) as paid,
        SUM(CASE WHEN s.payment_status = 'Neplătit' THEN c.rate ELSE 0 END) as unpaid
       FROM clients c
       LEFT JOIN sessions s ON c.id = s.client_id AND s.session_date >= $2 AND s.session_date <= $3
       WHERE c.user_id = $1
       GROUP BY c.id, c.student_name
       HAVING COUNT(s.id) > 0
       ORDER BY sessions DESC`,
      [req.userId, startDate, endDate]
    );

    res.json({
      totalSessions: parseInt(sessionsResult.rows[0].total),
      activeClients: parseInt(clientsResult.rows[0].total),
      totalPaid: parseFloat(revenueResult.rows[0].paid) || 0,
      totalUnpaid: parseFloat(revenueResult.rows[0].unpaid) || 0,
      clientDetails: clientDetailsResult.rows,
    });
  } catch (error) {
    console.error('Monthly summary error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly summary' });
  }
});

export default router;
