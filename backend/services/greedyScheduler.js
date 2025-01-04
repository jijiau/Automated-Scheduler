class GreedyScheduler {
    constructor(tasks) {
        this.tasks = tasks; // Tugas yang akan dijadwalkan
    }

    schedule() {
        console.log('Initial tasks:', this.tasks);

        // Urutkan tugas berdasarkan prioritas (angka lebih kecil lebih penting), deadline (terdekat lebih dulu), dan durasi (terpendek lebih dulu)
        const sortedTasks = this.tasks.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority; // Prioritas lebih tinggi (angka lebih kecil) lebih dulu
            const deadlineDiff = new Date(a.deadline) - new Date(b.deadline);
            if (deadlineDiff !== 0) return deadlineDiff; // Deadline lebih awal lebih dulu
            return a.duration - b.duration; // Durasi lebih pendek lebih dulu
        });

        console.log('Sorted tasks by priority, deadline, and duration:', sortedTasks);

        const schedule = [];
        let currentTime = Math.min(
            ...this.tasks.map(task => new Date(task.deadline).getTime())
        ); // Waktu awal berdasarkan deadline paling awal
        console.log('Initial currentTime:', new Date(currentTime));

        for (const task of sortedTasks) {
            const endTime = new Date(task.deadline).getTime(); // Waktu deadline tugas
            const startTime = endTime - task.duration * 60 * 1000; // Hitung waktu mulai yang ideal agar tugas selesai tepat waktu

            // Pastikan waktu mulai tidak overlap dengan tugas sebelumnya
            if (startTime < currentTime) {
                console.log(`Adjusting start time for task: ${task.task_name}`);
                currentTime = currentTime + task.duration * 60 * 1000; // Geser waktu mulai
            } else {
                currentTime = startTime; // Gunakan waktu mulai ideal
            }

            // Tentukan waktu selesai
            const adjustedEndTime = currentTime + task.duration * 60 * 1000;

            // Tambahkan tugas ke jadwal
            schedule.push({
                task_id: task.id,
                task_name: task.task_name,
                priority: task.priority,
                start_time: new Date(currentTime).toISOString(),
                end_time: new Date(adjustedEndTime).toISOString(),
            });

            console.log(`Task ${task.task_name} scheduled from ${new Date(currentTime)} to ${new Date(adjustedEndTime)}`);

            // Perbarui currentTime untuk tugas berikutnya
            currentTime = adjustedEndTime;
        }

        console.log('Final schedule:', schedule);
        return schedule; // Return array jadwal
    }
}

module.exports = GreedyScheduler;
