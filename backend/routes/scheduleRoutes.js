const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const GreedyScheduler = require('../services/greedyScheduler');
const { authenticateJWT } = require('./authRoutes');

// Generate jadwal otomatis
router.post('/generate', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;

        // Hapus jadwal lama untuk user ini
        const { error: deleteError } = await supabase.from('schedule').delete().eq('user_id', userId);
        if (deleteError) {
            console.error('Error deleting old schedule:', deleteError);
            return res.status(500).json({ error: 'Failed to delete old schedule' });
        }

        // Ambil semua tugas dari tabel `tasks` berdasarkan user_id
        const { data: tasks, error } = await supabase.from('tasks').select('*').eq('user_id', userId);
        if (error) return res.status(500).json({ error: error.message });

        // Log data tugas untuk debugging
        console.log('Tasks fetched from database:', tasks);

        // Validasi apakah ada tugas
        if (!tasks || tasks.length === 0) {
            return res.status(400).json({ error: 'No tasks available to schedule' });
        }

        // Gunakan GreedyScheduler untuk menghasilkan jadwal
        const scheduler = new GreedyScheduler(tasks);
        const { scheduledTasks, unscheduledTasks } = scheduler.schedule();

        // Simpan jadwal baru ke database
        for (const entry of scheduledTasks) {
            const { task_id, start_time, end_time } = entry;
            const { error } = await supabase
                .from('schedule')
                .insert([{ task_id, start_time, end_time, user_id: userId }])
                .select('*');
            if (error) {
                console.error(`Error saving schedule for task ${task_id}:`, error.message);
            }
        }

        res.json({
            message: 'Schedule generated successfully',
            scheduledTasks,
            unscheduledTasks,
        });
    } catch (err) {
        console.error('Error generating schedule:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Ambil semua jadwal
router.get('/', authenticateJWT, async (req, res) => {
    try {
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
            .eq('user_id', req.user.id); // Filter berdasarkan user
        if (error) return res.status(500).json({ error: error.message });

        res.json({ message: 'Schedules retrieved successfully', schedules });
    } catch (err) {
        console.error('Error retrieving schedules:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
