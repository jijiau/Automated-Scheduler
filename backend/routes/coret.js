router.post('/', authenticateJWT, async (req, res) => {
    const tasks = req.body; // Ambil array tugas dari body
    const userId = req.user.id;

    console.log('Received tasks:', tasks); // Log data yang diterima
    console.log('User ID:', userId); // Log user ID dari JWT

    // Validasi input
    if (!Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ error: 'Invalid input, an array of tasks is required' });
    }

    const tasksWithUserId = tasks.map(task => {
        console.log('Processing task:', task); // Log setiap tugas yang diproses
        if (!task.task_name || !task.deadline || !task.duration || !task.priority) {
            throw new Error('Missing required fields in one or more tasks');
        }
        return {
            ...task,
            user_id: userId,
        };
    });

    try {
        const { data, error } = await supabase
            .from('tasks')
            .insert(tasksWithUserId)
            .select('*');

        if (error) {
            console.error('Supabase insert error:', error); // Log error dari Supabase
            return res.status(500).json({ error: error.message });
        }

        console.log('Inserted tasks:', data); // Log hasil insert ke database
        res.json({ message: 'Tasks added successfully', data });
    } catch (err) {
        console.error('Error adding tasks:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});
