package com.example.taskmanagement.task;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * 並べ替え（PATCH /api/tasks/reorder）で受け取るリクエストボディ。
 * taskIdsは、対象status内での新しい表示順（先頭から順）を表す。
 */
public record TaskReorderRequest(
    @NotNull TaskStatus status,
    @NotEmpty List<Long> taskIds
) {
}
