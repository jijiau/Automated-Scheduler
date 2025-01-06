class GreedyScheduler {
    constructor(tasks) {
        this.tasks = tasks; // Semua tugas
    }

    schedule() {
        console.log("Initial tasks:", this.tasks);

        // Filter tugas yang belum selesai
        const pendingTasks = this.tasks.filter((task) => task.status === "no");
        console.log("Pending tasks:", pendingTasks);

        // Urutkan tugas berdasarkan prioritas, deadline, dan durasi
        const sortedTasks = pendingTasks.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority; // Prioritas lebih tinggi lebih dulu
            const deadlineDiff = new Date(a.deadline) - new Date(b.deadline);
            if (deadlineDiff !== 0) return deadlineDiff; // Deadline lebih awal lebih dulu
            return a.duration - b.duration; // Durasi lebih pendek lebih dulu
        });

        console.log("Sorted tasks:", sortedTasks);

        const schedule = [];
        const unscheduledTasks = [];
        let currentTime = new Date().getTime(); // Mulai dari waktu saat ini
        console.log("Initial currentTime:", new Date(currentTime));

        // Tahap 1: Jadwalkan tugas berdasarkan prioritas tinggi terlebih dahulu
        const scheduledIds = new Set(); // Untuk melacak tugas yang telah dijadwalkan
        for (const task of sortedTasks) {
            const taskDeadline = new Date(task.deadline).getTime();
            const startTime = Math.max(
                currentTime,
                taskDeadline - task.duration * 60 * 1000
            );
            const endTime = startTime + task.duration * 60 * 1000;

            // Pastikan tugas dapat diselesaikan dalam rentang waktu
            if (endTime <= taskDeadline) {
                schedule.push({
                    task_id: task.id,
                    task_name: task.task_name,
                    priority: task.priority,
                    start_time: new Date(startTime).toISOString(),
                    end_time: new Date(endTime).toISOString(),
                    status: "no",
                });

                console.log(
                    `Task ${task.task_name} scheduled from ${new Date(
                        startTime
                    )} to ${new Date(endTime)}`
                );
                currentTime = endTime; // Update waktu untuk tugas berikutnya
                scheduledIds.add(task.id);
            } else {
                console.log(
                    `Task ${task.task_name} skipped (priority): Cannot fit within the deadline.`
                );
                unscheduledTasks.push(task); // Simpan tugas yang tidak dapat dijadwalkan di tahap ini
            }
        }

        // Tahap 2: Isi slot waktu kosong dengan prioritas lebih rendah
        for (const task of sortedTasks) {
            if (scheduledIds.has(task.id)) continue; // Lewati tugas yang sudah dijadwalkan

            let slotFound = false;
            for (let i = 0; i <= schedule.length; i++) {
                const prevEndTime =
                    i === 0
                        ? new Date().getTime() // Awal waktu (jika slot pertama)
                        : new Date(schedule[i - 1].end_time).getTime();
                const nextStartTime =
                    i === schedule.length
                        ? Infinity // Tidak ada batas waktu berikutnya (jika slot terakhir)
                        : new Date(schedule[i].start_time).getTime();

                const taskStartTime = Math.max(
                    prevEndTime,
                    new Date(task.deadline).getTime() - task.duration * 60 * 1000
                );
                const taskEndTime = taskStartTime + task.duration * 60 * 1000;

                // Periksa apakah tugas dapat dijadwalkan di slot ini
                if (taskStartTime >= prevEndTime && taskEndTime <= nextStartTime) {
                    schedule.splice(i, 0, {
                        task_id: task.id,
                        task_name: task.task_name,
                        priority: task.priority,
                        start_time: new Date(taskStartTime).toISOString(),
                        end_time: new Date(taskEndTime).toISOString(),
                        status: "no",
                    });

                    console.log(
                        `Task ${task.task_name} scheduled (low priority) from ${new Date(
                            taskStartTime
                        )} to ${new Date(taskEndTime)}`
                    );
                    slotFound = true;
                    scheduledIds.add(task.id);
                    break;
                }
            }

            if (!slotFound) {
                console.log(
                    `Task ${task.task_name} skipped (low priority): No available slot.`
                );
                unscheduledTasks.push(task);
            }
        }

        console.log("Final schedule:", schedule);
        console.log("Unscheduled tasks:", unscheduledTasks);

        return {
            scheduledTasks: schedule,
            unscheduledTasks, // Daftar tugas yang tidak berhasil dijadwalkan
        };
    }
}

module.exports = GreedyScheduler;
