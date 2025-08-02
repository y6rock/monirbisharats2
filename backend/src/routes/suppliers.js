const express = require('express');
const dbSingleton = require('../../dbSingleton.js');
const { authenticateToken, requireAdmin } = require('../middleware/auth.js');

const router = express.Router();
const db = dbSingleton.getConnection();

// Get all suppliers
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [suppliers] = await db.query('SELECT supplier_id, name FROM suppliers ORDER BY name');
        res.json(suppliers);
    } catch (err) {
        console.error("Error fetching suppliers:", err);
        res.status(500).json({ message: "Database error" });
    }
});

// Add new supplier
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, contact } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Supplier name is required' });
        }

        const [result] = await db.query(
            'INSERT INTO suppliers (name, contact) VALUES (?, ?)',
            [name, contact || null]
        );

        res.status(201).json({ 
            message: 'Supplier added successfully',
            supplier_id: result.insertId 
        });
    } catch (err) {
        console.error("Error adding supplier:", err);
        res.status(500).json({ message: "Failed to add supplier" });
    }
});

module.exports = router; 