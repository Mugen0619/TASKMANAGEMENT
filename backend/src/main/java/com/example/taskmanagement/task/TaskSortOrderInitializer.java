package com.example.taskmanagement.task;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * sortOrder未設定のタスクに、状態（列）ごとに作成日時の昇順で初期値（1, 2, 3...）を振る。
 * 既にsortOrderを持つタスクには触れないため、起動のたびに実行しても安全（冪等）。
 */
@Component
@Order(2)
public class TaskSortOrderInitializer implements CommandLineRunner {

    private final TaskRepository taskRepository;

    public TaskSortOrderInitializer(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public void run(String... args) {
        Map<TaskStatus, List<Task>> tasksWithoutSortOrderByStatus = taskRepository.findAll().stream()
            .filter(task -> task.getSortOrder() == null)
            .collect(Collectors.groupingBy(Task::getStatus));

        tasksWithoutSortOrderByStatus.forEach((status, tasks) -> {
            tasks.sort(Comparator.comparing(Task::getCreatedAt));
            for (int i = 0; i < tasks.size(); i++) {
                tasks.get(i).setSortOrder(i + 1);
            }
            taskRepository.saveAll(tasks);
        });
    }
}
