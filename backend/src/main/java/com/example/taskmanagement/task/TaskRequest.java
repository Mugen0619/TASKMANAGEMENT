package com.example.taskmanagement.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * タスクの作成・編集（PUT）で受け取るリクエストボディ。
 */
public record TaskRequest(
    @NotBlank @Size(min = 1, max = 100) String title,
    TaskPriority priority,
    LocalDate dueDate,
    TaskStatus status
) {
}
