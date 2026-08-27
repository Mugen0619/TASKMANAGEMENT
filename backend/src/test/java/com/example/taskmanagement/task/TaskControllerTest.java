package com.example.taskmanagement.task;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskRepository taskRepository;

    @Test
    void createTask_正常なリクエストは201でタスクを作成しDBに保存する() throws Exception {
        String body = """
            {"title":"新規タスク","priority":"HIGH","dueDate":"2026-09-01","status":"TODO"}
            """;

        mockMvc.perform(post("/api/tasks")
                .contentType("application/json")
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.title").value("新規タスク"))
            .andExpect(jsonPath("$.status").value("TODO"))
            .andExpect(jsonPath("$.priority").value("HIGH"));

        assertThat(taskRepository.findAll())
            .anyMatch(task -> task.getTitle().equals("新規タスク"));
    }

    @Test
    void createTask_タイトルが空文字だと400を返す() throws Exception {
        String body = """
            {"title":"","priority":"HIGH","dueDate":"2026-09-01","status":"TODO"}
            """;

        mockMvc.perform(post("/api/tasks")
                .contentType("application/json")
                .content(body))
            .andExpect(status().isBadRequest());
    }

    @Test
    void createTask_タイトルが101文字だと400を返す() throws Exception {
        String title = "あ".repeat(101);
        String body = """
            {"title":"%s","priority":"HIGH","dueDate":"2026-09-01","status":"TODO"}
            """.formatted(title);

        mockMvc.perform(post("/api/tasks")
                .contentType("application/json")
                .content(body))
            .andExpect(status().isBadRequest());
    }

    @Test
    void createTask_statusとpriority未指定時はTODOとMEDIUMが初期値になる() throws Exception {
        String body = """
            {"title":"初期値確認タスク","dueDate":null}
            """;

        mockMvc.perform(post("/api/tasks")
                .contentType("application/json")
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("TODO"))
            .andExpect(jsonPath("$.priority").value("MEDIUM"));
    }

    @Test
    void updateTask_正常なリクエストは200でタイトル優先度期限日を更新し状態は変えない() throws Exception {
        Task task = saveTask("元のタイトル", TaskStatus.DOING, TaskPriority.LOW, null, 1);

        String body = """
            {"title":"更新後のタイトル","priority":"HIGH","dueDate":"2026-10-01"}
            """;

        mockMvc.perform(put("/api/tasks/" + task.getId())
                .contentType("application/json")
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("更新後のタイトル"))
            .andExpect(jsonPath("$.priority").value("HIGH"))
            .andExpect(jsonPath("$.dueDate").value("2026-10-01"))
            .andExpect(jsonPath("$.status").value("DOING"));
    }

    @Test
    void updateTask_priority未指定時は既存の優先度を維持する() throws Exception {
        Task task = saveTask("優先度維持確認", TaskStatus.TODO, TaskPriority.HIGH, null, 1);

        String body = """
            {"title":"優先度維持確認"}
            """;

        mockMvc.perform(put("/api/tasks/" + task.getId())
                .contentType("application/json")
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.priority").value("HIGH"));
    }

    @Test
    void updateTask_タイトルが空文字だと400を返す() throws Exception {
        Task task = saveTask("バリデーション確認", TaskStatus.TODO, TaskPriority.MEDIUM, null, 1);

        String body = """
            {"title":"","priority":"HIGH"}
            """;

        mockMvc.perform(put("/api/tasks/" + task.getId())
                .contentType("application/json")
                .content(body))
            .andExpect(status().isBadRequest());
    }

    @Test
    void updateTask_存在しないIDだと404を返す() throws Exception {
        String body = """
            {"title":"存在しないタスク","priority":"HIGH"}
            """;

        mockMvc.perform(put("/api/tasks/999999")
                .contentType("application/json")
                .content(body))
            .andExpect(status().isNotFound());
    }

    @Test
    void updateStatus_状態変更時は新しい状態の末尾のsortOrderが振られる() throws Exception {
        saveTask("DOING列の既存タスク", TaskStatus.DOING, TaskPriority.MEDIUM, null, 1);
        Task task = saveTask("状態変更対象", TaskStatus.TODO, TaskPriority.MEDIUM, null, 1);

        String body = """
            {"status":"DOING"}
            """;

        mockMvc.perform(patch("/api/tasks/" + task.getId() + "/status")
                .contentType("application/json")
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("DOING"))
            .andExpect(jsonPath("$.sortOrder").value(2));
    }

    @Test
    void updateStatus_同じ状態を指定した場合はsortOrderが変わらない() throws Exception {
        Task task = saveTask("状態維持対象", TaskStatus.TODO, TaskPriority.MEDIUM, null, 3);

        String body = """
            {"status":"TODO"}
            """;

        mockMvc.perform(patch("/api/tasks/" + task.getId() + "/status")
                .contentType("application/json")
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sortOrder").value(3));
    }

    @Test
    void updateStatus_存在しないIDだと404を返す() throws Exception {
        String body = """
            {"status":"DONE"}
            """;

        mockMvc.perform(patch("/api/tasks/999999/status")
                .contentType("application/json")
                .content(body))
            .andExpect(status().isNotFound());
    }

    @Test
    void reorderTasks_指定した順にsortOrderを振り直す() throws Exception {
        Task first = saveTask("タスクA", TaskStatus.TODO, TaskPriority.MEDIUM, null, 1);
        Task second = saveTask("タスクB", TaskStatus.TODO, TaskPriority.MEDIUM, null, 2);
        Task third = saveTask("タスクC", TaskStatus.TODO, TaskPriority.MEDIUM, null, 3);

        String body = """
            {"status":"TODO","taskIds":[%d,%d,%d]}
            """.formatted(third.getId(), first.getId(), second.getId());

        mockMvc.perform(patch("/api/tasks/reorder")
                .contentType("application/json")
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(third.getId()))
            .andExpect(jsonPath("$[0].sortOrder").value(1))
            .andExpect(jsonPath("$[1].id").value(first.getId()))
            .andExpect(jsonPath("$[1].sortOrder").value(2))
            .andExpect(jsonPath("$[2].id").value(second.getId()))
            .andExpect(jsonPath("$[2].sortOrder").value(3));

        assertThat(taskRepository.findById(third.getId()).orElseThrow().getSortOrder()).isEqualTo(1);
    }

    @Test
    void reorderTasks_状態が一致しないタスクIDを含むと400を返しDBは変更されない() throws Exception {
        Task inTodo = saveTask("TODO列のタスク", TaskStatus.TODO, TaskPriority.MEDIUM, null, 1);
        Task inDoing = saveTask("DOING列のタスク", TaskStatus.DOING, TaskPriority.MEDIUM, null, 5);

        String body = """
            {"status":"TODO","taskIds":[%d,%d]}
            """.formatted(inTodo.getId(), inDoing.getId());

        mockMvc.perform(patch("/api/tasks/reorder")
                .contentType("application/json")
                .content(body))
            .andExpect(status().isBadRequest());

        assertThat(taskRepository.findById(inDoing.getId()).orElseThrow().getSortOrder()).isEqualTo(5);
    }

    @Test
    void reorderTasks_存在しないタスクIDだと404を返す() throws Exception {
        String body = """
            {"status":"TODO","taskIds":[999999]}
            """;

        mockMvc.perform(patch("/api/tasks/reorder")
                .contentType("application/json")
                .content(body))
            .andExpect(status().isNotFound());
    }

    @Test
    void reorderTasks_taskIdsが空だと400を返す() throws Exception {
        String body = """
            {"status":"TODO","taskIds":[]}
            """;

        mockMvc.perform(patch("/api/tasks/reorder")
                .contentType("application/json")
                .content(body))
            .andExpect(status().isBadRequest());
    }

    @Test
    void deleteTask_正常に削除されると204を返しDBから消える() throws Exception {
        Task task = saveTask("削除対象", TaskStatus.TODO, TaskPriority.MEDIUM, null, 1);

        mockMvc.perform(delete("/api/tasks/" + task.getId()))
            .andExpect(status().isNoContent());

        assertThat(taskRepository.findById(task.getId())).isEmpty();
    }

    @Test
    void deleteTask_存在しないIDだと404を返す() throws Exception {
        mockMvc.perform(delete("/api/tasks/999999"))
            .andExpect(status().isNotFound());
    }

    private Task saveTask(String title, TaskStatus status, TaskPriority priority, LocalDate dueDate, Integer sortOrder) {
        Task task = new Task(title, status, priority, dueDate);
        task.setSortOrder(sortOrder);
        return taskRepository.save(task);
    }
}
