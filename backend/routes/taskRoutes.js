const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const { authenticateJWT } = require('./authRoutes');

// Tambahkan tugas baru
router.post('/', authenticateJWT, async (req, res) => {
    const { task_name, deadline, duration, priority } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!task_name || !deadline || !duration || !priority) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Query untuk menambahkan tugas dengan .select('*') agar mengembalikan data
        const { data, error } = await supabase
            .from('tasks')
            .insert([{ task_name, deadline, duration, priority, user_id: userId }])
            .select('*');

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ message: 'Task added successfully', data });
    } catch (err) {
        console.error('Error adding task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Ambil semua tugas
router.get('/', authenticateJWT, async (req, res) => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Hapus tugas berdasarkan ID
router.delete('/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;

    // Validasi UUID
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    try {
        // Periksa apakah task dengan ID tersebut ada
        const { data: taskExists, error: fetchError } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', id);

        if (fetchError) {
            console.error('Fetch error:', fetchError);
            return res.status(500).json({ error: fetchError.message });
        }

        if (!taskExists || taskExists.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Hapus task berdasarkan ID
        const { error: deleteError } = await supabase.from('tasks').delete().eq('id', id);

        if (deleteError) {
            console.error('Delete error:', deleteError);
            return res.status(500).json({ error: deleteError.message });
        }

        // Pastikan data berhasil dihapus
        const { data: verifyTask, error: verifyError } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', id);

        if (verifyError) {
            console.error('Verify error:', verifyError);
            return res.status(500).json({ error: verifyError.message });
        }

        if (!verifyTask || verifyTask.length === 0) {
            return res.json({ message: 'Task deleted successfully' });
        }

        res.status(500).json({ error: 'Failed to delete task' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
