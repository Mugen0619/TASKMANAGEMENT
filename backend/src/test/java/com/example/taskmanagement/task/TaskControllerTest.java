package com.example.taskmanagement.task;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
}
