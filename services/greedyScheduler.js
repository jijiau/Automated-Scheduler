class GreedyScheduler {
    constructor(tasks) {
        this.tasks = tasks; // Semua tugas
    }

    schedule() {
        console.log('Initial tasks:', this.tasks);

        // Filter tugas yang belum selesai
        const pendingTasks = this.tasks.filter(task => task.status === 'no');
        console.log('Pending tasks:', pendingTasks);

        // Urutkan tugas berdasarkan prioritas, deadline, dan durasi
        const sortedTasks = pendingTasks.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority; // Prioritas lebih tinggi (angka lebih kecil) lebih dulu
            const deadlineDiff = new Date(a.deadline) - new Date(b.deadline);
            if (deadlineDiff !== 0) return deadlineDiff; // Deadline lebih awal lebih dulu
            return a.duration - b.duration; // Durasi lebih pendek lebih dulu
        });

        console.log('Sorted tasks:', sortedTasks);

        const schedule = [];
        const unscheduledTasks = []; // Untuk menyimpan tugas yang tidak bisa dijadwalkan
        let currentTime = new Date().getTime(); // Mulai dari waktu saat ini
        console.log('Initial currentTime:', new Date(currentTime));

        for (const task of sortedTasks) {
            const taskDeadline = new Date(task.deadline).getTime(); // Deadline tugas
            const startTime = Math.max(currentTime, taskDeadline - task.duration * 60 * 1000); // Waktu mulai tugas
            const endTime = startTime + task.duration * 60 * 1000; // Waktu selesai tugas

            // Pastikan tugas dapat diselesaikan dalam rentang waktu
            if (endTime <= taskDeadline) {
                schedule.push({
                    task_id: task.id,
                    task_name: task.task_name,
                    priority: task.priority,
                    start_time: new Date(startTime).toISOString(),
                    end_time: new Date(endTime).toISOString(),
                    status: 'no', // Default status
                });

                console.log(`Task ${task.task_name} scheduled from ${new Date(startTime)} to ${new Date(endTime)}`);
                currentTime = endTime; // Update waktu untuk tugas berikutnya
            } else {
                // Tambahkan tugas ke daftar tugas yang tidak terjadwal
                unscheduledTasks.push({
                    task_id: task.id,
                    task_name: task.task_name,
                    priority: task.priority,
                    deadline: task.deadline,
                    duration: task.duration,
                });
                console.log(`Task ${task.task_name} skipped: Cannot fit within the deadline.`);
            }
        }

        console.log('Final schedule:', schedule);
        console.log('Unscheduled tasks:', unscheduledTasks);

        return {
            scheduledTasks: schedule,
            unscheduledTasks, // Daftar tugas yang tidak berhasil dijadwalkan
        };
    }

    adjustSchedule(newTasks) {
        // Gabungkan tugas lama dengan tugas baru
        this.tasks = [...this.tasks, ...newTasks];

        console.log('Tasks after adding new ones:', this.tasks);

        // Lakukan penjadwalan ulang
        return this.schedule();
    }

    rescheduleMissedTasks() {
        const now = new Date().getTime();

        // Tandai tugas yang terlewatkan deadline-nya sebagai `missed`
        this.tasks = this.tasks.map(task => {
            const taskEndTime = new Date(task.end_time).getTime();
            if (task.status === 'no' && taskEndTime < now) {
                console.log(`Task ${task.task_name} missed its deadline, rescheduling.`);
                task.status = 'no'; // Tandai ulang untuk penjadwalan
            }
            return task;
        });

        // Lakukan penjadwalan ulang untuk semua tugas yang belum selesai
        return this.schedule();
    }
}

module.exports = GreedyScheduler;
