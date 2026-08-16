package com.example.taskmanagement.task;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*") // 学習用プロトタイプ向けの暫定設定。公開する場合は許可元を絞ること
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAllByOrderByStatusAscSortOrderAsc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task createTask(@Valid @RequestBody TaskRequest request) {
        TaskStatus status = request.status() != null ? request.status() : TaskStatus.TODO;
        TaskPriority priority = request.priority() != null ? request.priority() : TaskPriority.MEDIUM;
        Task task = new Task(request.title(), status, priority, request.dueDate());
        task.setSortOrder(nextSortOrder(status));
        return taskRepository.save(task);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        Task task = findTaskOrThrow(id);
        task.setTitle(request.title());
        task.setPriority(request.priority() != null ? request.priority() : task.getPriority());
        task.setDueDate(request.dueDate());
        return taskRepository.save(task);
    }

    @PatchMapping("/{id}/status")
    public Task updateStatus(@PathVariable Long id, @Valid @RequestBody TaskStatusUpdateRequest request) {
        Task task = findTaskOrThrow(id);
        if (task.getStatus() != request.status()) {
            task.setStatus(request.status());
            task.setSortOrder(nextSortOrder(request.status()));
        }
        return taskRepository.save(task);
    }

    @PatchMapping("/reorder")
    public List<Task> reorderTasks(@Valid @RequestBody TaskReorderRequest request) {
        List<Task> reordered = new ArrayList<>();
        List<Long> taskIds = request.taskIds();
        for (int i = 0; i < taskIds.size(); i++) {
            Task task = findTaskOrThrow(taskIds.get(i));
            if (task.getStatus() != request.status()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "指定された状態のタスクではありません: id=" + task.getId());
            }
            task.setSortOrder(i + 1);
            reordered.add(task);
        }
        return taskRepository.saveAll(reordered);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long id) {
        Task task = findTaskOrThrow(id);
        taskRepository.delete(task);
    }

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "タスクが見つかりません: id=" + id));
    }

    private int nextSortOrder(TaskStatus status) {
        return taskRepository.findTopByStatusOrderBySortOrderDesc(status)
            .map(task -> task.getSortOrder() + 1)
            .orElse(1);
    }
}
