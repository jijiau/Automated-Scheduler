router.post('/generate', authenticateService, async (req, res) => {
    try {
        const serviceName = req.serviceName; // Nama layanan dari middleware

        // Ambil semua tugas untuk layanan ini
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('service_name', serviceName);

        if (error) {
            console.error('Error fetching tasks:', error);
            return res.status(500).json({ error: 'Failed to fetch tasks' });
        }

        if (!tasks || tasks.length === 0) {
            return res.status(400).json({ error: 'No tasks available for scheduling' });
        }

        // Proses penjadwalan
        const scheduler = new GreedyScheduler(tasks);
        const { scheduledTasks, unscheduledTasks } = scheduler.schedule();

        res.json({
            message: 'Schedule generated successfully',
            scheduledTasks,
            unscheduledTasks,
        });
    } catch (error) {
        console.error('Error generating schedule:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});