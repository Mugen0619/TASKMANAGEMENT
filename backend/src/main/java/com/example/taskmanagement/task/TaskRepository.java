package com.example.taskmanagement.task;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByOrderByStatusAscSortOrderAsc();

    Optional<Task> findTopByStatusOrderBySortOrderDesc(TaskStatus status);
}
