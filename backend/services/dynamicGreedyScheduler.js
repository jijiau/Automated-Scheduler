const GreedyScheduler = require('./greedyScheduler');

class DynamicGreedyScheduler {
    constructor(tasks) {
        this.tasks = this.preprocessTasks(tasks); // Preprocess tasks before scheduling
    }

    // Preprocess tasks to fill in missing fields
    preprocessTasks(tasks) {
        return tasks.map((task, index) => {
            return {
                id: task.id || `task-${index}`, // Generate ID if missing
                task_name: task.task_name || `Unnamed Task ${index + 1}`, // Default task name
                deadline: task.deadline || new Date(Date.now() + 3600 * 1000).toISOString(), // Default deadline 1 hour from now
                duration: task.duration || 100, // Default duration
                priority: task.priority || 1, // Default priority
                status: task.status || 'no', // Default status
            };
        });
    }

    // Schedule tasks using the original GreedyScheduler
    schedule() {
        const scheduler = new GreedyScheduler(this.tasks); // Pass preprocessed tasks to GreedyScheduler
        return scheduler.schedule();
    }
}

module.exports = DynamicGreedyScheduler;
