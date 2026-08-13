package com.example.taskmanagement.task;

import jakarta.validation.constraints.NotNull;

/**
 * 状態変更（PATCH /api/tasks/{id}/status）で受け取るリクエストボディ。
 */
public record TaskStatusUpdateRequest(@NotNull TaskStatus status) {
}
