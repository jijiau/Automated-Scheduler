const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const { authenticateJWT } = require('./authRoutes');

// Tambahkan banyak tugas baru
router.post('/', authenticateJWT, async (req, res) => {
    const tasks = req.body; // Ambil array tugas dari body
    const userId = req.user.id;

    // Validasi input
    if (!Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ error: 'Invalid input, an array of tasks is required' });
    }

    // Tambahkan user_id ke setiap tugas
    const tasksWithUserId = tasks.map(task => {
        if (!task.task_name || !task.deadline || !task.duration || !task.priority) {
            throw new Error('Missing required fields in one or more tasks');
        }
        return {
            ...task,
            user_id: userId,
        };
    });

    try {
        // Query untuk menambahkan semua tugas
        const { data, error } = await supabase
            .from('tasks')
            .insert(tasksWithUserId)
            .select('*');

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ message: 'Tasks added successfully', data });
    } catch (err) {
        console.error('Error adding tasks:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Ambil semua tugas
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id; // Ambil user_id dari JWT
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId); // Hanya ambil tugas milik user

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Hapus tugas berdasarkan ID
router.delete('/', authenticateJWT, async (req, res) => {
    const { ids } = req.body; // Ambil array ID dari body
    const userId = req.user.id;

    // Validasi input: pastikan `ids` adalah array
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid input, an array of IDs is required' });
    }

    // Validasi format UUID untuk setiap ID
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const invalidIds = ids.filter(id => !uuidRegex.test(id));

    if (invalidIds.length > 0) {
        return res.status(400).json({ error: `Invalid ID format: ${invalidIds.join(', ')}` });
    }

    try {
        // Periksa apakah tugas milik user dan ada di database
        const { data: tasks, error: fetchError } = await supabase
            .from('tasks')
            .select('*')
            .in('id', ids)
            .eq('user_id', userId);

        if (fetchError) {
            console.error('Fetch error:', fetchError);
            return res.status(500).json({ error: fetchError.message });
        }

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ error: 'No tasks found to delete or not authorized' });
        }

        // Hapus semua tugas dengan ID yang ditemukan
        const { error: deleteError } = await supabase
            .from('tasks')
            .delete()
            .in('id', ids)
            .eq('user_id', userId);

        if (deleteError) {
            console.error('Delete error:', deleteError);
            return res.status(500).json({ error: deleteError.message });
        }

        res.json({
            message: 'Tasks deleted successfully',
            deletedIds: ids,
        });
    } catch (err) {
        console.error('Error deleting tasks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;