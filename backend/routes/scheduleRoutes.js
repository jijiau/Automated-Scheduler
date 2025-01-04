// const express = require('express');
// const router = express.Router();
// const supabase = require('../services/supabaseClient');
// const { Solver } = require('google-or-tools'); // Gunakan pustaka optimisasi seperti OR-Tools

// // Generate jadwal otomatis
// router.post('/schedule', async (req, res) => {
//     const { data: tasks, error } = await supabase.from('tasks').select('*');
//     if (error) return res.status(500).json({ error: error.message });

//     const solver = new Solver('scheduler');
//     const variables = tasks.map((task) => solver.intVar(0, 1440, `start_${task.id}`));

//     tasks.forEach((task, i) => {
//         solver.addConstraint(variables[i] + task.duration <= task.deadline);
//     });

//     solver.minimize(variables.reduce((a, b) => a + b));
//     const result = solver.solve();
//     if (!result) return res.status(500).json({ error: 'No solution found' });

//     const schedule = tasks.map((task, i) => ({
//         task_id: task.id,
//         start_time: variables[i].value(),
//         end_time: variables[i].value() + task.duration,
//     }));

//     res.json({ schedule });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const GreedyScheduler = require('../services/greedyScheduler');

// Generate jadwal otomatis
router.post('/generate', async (req, res) => {
    try {
        // Ambil semua tugas dari tabel `tasks`
        const { data: tasks, error } = await supabase.from('tasks').select('*');
        if (error) return res.status(500).json({ error: error.message });

        // Log data tugas untuk debugging
        console.log('Tasks fetched from database:', tasks);

        // Validasi apakah ada tugas
        if (!tasks || tasks.length === 0) {
            return res.status(400).json({ error: 'No tasks available to schedule' });
        }

        // Gunakan GreedyScheduler untuk menghasilkan jadwal
        const scheduler = new GreedyScheduler(tasks);
        const schedule = scheduler.schedule();

        // Log jadwal yang dihasilkan
        console.log('Generated schedule:', schedule);

        // Validasi apakah jadwal berhasil dibuat
        if (!schedule || schedule.length === 0) {
            return res.status(400).json({ error: 'Failed to generate a schedule. Check task constraints.' });
        }

        // Simpan jadwal ke database
        for (const entry of schedule) {
            const { task_id, start_time, end_time } = entry;
            const { error } = await supabase
                .from('schedule')
                .insert([{ task_id, start_time, end_time }])
                .select('*');
            if (error) {
                console.error(`Error saving schedule for task ${task_id}:`, error.message);
            }
        }

        res.json({ message: 'Schedule generated successfully', schedule });
    } catch (err) {
        console.error('Error generating schedule:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Ambil semua jadwal
router.get('/', async (req, res) => {
    try {
        // Query untuk mengambil semua jadwal dari tabel `schedule`
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
            `); // Mengambil data dari tabel `schedule` dan detail dari tabel `tasks`

        if (error) return res.status(500).json({ error: error.message });

        // Validasi apakah ada jadwal
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
