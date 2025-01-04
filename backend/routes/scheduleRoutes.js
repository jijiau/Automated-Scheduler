const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const GreedyScheduler = require('../services/greedyScheduler');
const { authenticateJWT } = require('./authRoutes');

// Generate jadwal otomatis
router.post('/generate', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id; // Ambil user_id dari JWT

        // Ambil semua tugas dari tabel `tasks` milik user
        const { data: tasks, error: taskError } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId); // Hanya ambil tugas milik user

        if (taskError) return res.status(500).json({ error: taskError.message });

        // Validasi apakah ada tugas
        if (!tasks || tasks.length === 0) {
            return res.status(400).json({ error: 'No tasks available to schedule' });
        }

        // Gunakan GreedyScheduler untuk menghasilkan jadwal
        const scheduler = new GreedyScheduler(tasks);
        const schedule = scheduler.schedule();

        if (!schedule || schedule.length === 0) {
            return res.status(400).json({ error: 'Failed to generate a schedule. Check task constraints.' });
        }

        // Simpan jadwal ke database dengan user_id
        for (const entry of schedule) {
            const { task_id, start_time, end_time } = entry;
            const { error: insertError } = await supabase
                .from('schedule')
                .insert([{ task_id, start_time, end_time, user_id: userId }])
                .select('*');
            if (insertError) {
                console.error(`Error saving schedule for task ${task_id}:`, insertError.message);
            }
        }

        res.json({ message: 'Schedule generated successfully', schedule });
    } catch (err) {
        console.error('Error generating schedule:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Ambil semua jadwal
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id; // Ambil user_id dari JWT

        // Query untuk mengambil jadwal user dari tabel `schedule`
        const { data: schedules, error } = await supabase
            .from('schedule')
            .select(`
                task_id,
                start_time,
                end_time,
                tasks (
                    task_name,
                    priority,
                    deadline
                )
            `)
            .eq('user_id', userId); // Hanya ambil jadwal milik user

        if (error) return res.status(500).json({ error: error.message });

        if (!schedules || schedules.length === 0) {
            return res.status(404).json({ message: 'No schedules found' });
        }

        res.json({ message: 'Schedules retrieved successfully', schedules });
    } catch (err) {
        console.error('Error retrieving schedules:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
