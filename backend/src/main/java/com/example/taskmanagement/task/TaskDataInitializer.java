package com.example.taskmanagement.task;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * 起動時にサンプルタスクを投入する。動作確認用（H2はインメモリなので再起動のたびに再投入される）。
 * TaskSortOrderInitializerより先に実行し、投入したタスクにも並び順が振られるようにする。
 */
@Component
@Order(1)
public class TaskDataInitializer implements CommandLineRunner {

    private final TaskRepository taskRepository;

    public TaskDataInitializer(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public void run(String... args) {
        if (taskRepository.count() > 0) {
            return;
        }

        taskRepository.save(new Task("要件定義書を書く", TaskStatus.DONE, TaskPriority.HIGH, LocalDate.now().minusDays(1)));
        taskRepository.save(new Task("画面設計をする", TaskStatus.DOING, TaskPriority.MEDIUM, LocalDate.now().plusDays(3)));
        taskRepository.save(new Task("Spring Bootの環境を整える", TaskStatus.TODO, TaskPriority.HIGH, null));
    }
}
