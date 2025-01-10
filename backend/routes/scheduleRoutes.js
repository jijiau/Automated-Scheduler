const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const GreedyScheduler = require('../services/greedyScheduler');
const { authenticateJWT } = require('./authRoutes');
const authenticateService = require('../middlewares/authenticateService');
const authenticate = require('../middlewares/authenticate');
const DynamicGreedyScheduler = require('../services/dynamicGreedyScheduler');

// Generate jadwal otomatis
router.post('/generate', authenticate, async (req, res) => {
    try {
        let userId;

        // Determine if the request is from a user or a service
        if (req.authType === 'user') {
            // For user, fetch the ID from the JWT token
            userId = req.user.id;
        } else if (req.authType === 'service') {
            // For service, ensure `userId` is provided in the request body
            userId = req.body.userId;
            if (!userId) {
                return res.status(400).json({ error: 'Missing userId for service request' });
            }
        } else {
            return res.status(403).json({ error: 'Invalid authentication type' });
        }

        console.log(`Generating schedule for userId: ${userId}`);

        // Delete existing schedules for the user
        const { error: deleteError } = await supabase.from('schedule').delete().eq('user_id', userId);
        if (deleteError) {
            console.error('Error deleting old schedule:', deleteError);
            return res.status(500).json({ error: 'Failed to delete old schedule' });
        }

        // Fetch tasks for the specified user
        const { data: tasks, error } = await supabase.from('tasks').select('*').eq('user_id', userId);
        if (error) {
            console.error('Error fetching tasks:', error);
            return res.status(500).json({ error: error.message });
        }

        if (!tasks || tasks.length === 0) {
            return res.status(400).json({ error: 'No tasks available to schedule' });
        }

        console.log(`Tasks fetched for userId ${userId}:`, tasks);

        // Generate schedule using the GreedyScheduler
        const scheduler = new GreedyScheduler(tasks);
        const { scheduledTasks, unscheduledTasks } = scheduler.schedule();

        console.log('Scheduled Tasks:', scheduledTasks);
        console.log('Unscheduled Tasks:', unscheduledTasks);

        // Save the newly generated schedule to the database
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

router.post('/external', authenticateService, async (req, res) => {
    try {
        // Extract tasks and options from the request body
        const { tasks } = req.body;

        if (!tasks || tasks.length === 0) {
            return res.status(400).json({ error: 'Tasks are required' });
        }

        // Validate tasks format
        const invalidTasks = tasks.filter(
            (task) => !task.task_name || !task.deadline
        );
        if (invalidTasks.length > 0) {
            return res.status(400).json({
                error: 'One or more tasks have invalid or missing fields: task_name and deadline are required.',
            });
        }

        // Instantiate the DynamicGreedyScheduler
        const scheduler = new DynamicGreedyScheduler(tasks);

        // Generate the schedule
        const { scheduledTasks, unscheduledTasks } = scheduler.schedule();

        res.json({
            message: 'Schedule generated successfully',
            scheduledTasks,
            unscheduledTasks,
        });
    } catch (error) {
        console.error('Error in external scheduling:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
