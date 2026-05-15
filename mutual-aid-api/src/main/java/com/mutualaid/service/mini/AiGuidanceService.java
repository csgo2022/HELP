package com.mutualaid.service.mini;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.dto.AiGuidanceResponse;
import com.mutualaid.model.entity.ServiceTask;
import com.mutualaid.model.entity.User;
import com.mutualaid.repository.ServiceTaskRepository;
import com.mutualaid.repository.UserRepository;
import com.mutualaid.service.ai.DeepSeekClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiGuidanceService {

    private final ServiceTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final DeepSeekClient deepSeekClient;
    private final ObjectMapper objectMapper;

    public AiGuidanceResponse getGuidance(Long taskId) {
        ServiceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));

        if (!"IN_PROGRESS".equals(task.getStatus())) {
            throw new BusinessException("该任务不在服务中状态，无法获取指导");
        }

        User elderly = userRepository.findById(task.getRequesterId())
                .orElse(null);
        String elderlyInfo = buildElderlyInfo(elderly);

        String systemPrompt = "你是一个专业的志愿服务指导助手。请根据提供的任务信息，生成结构化的服务前指导内容。" +
                "必须返回严格的 JSON 格式（不要 markdown 代码块），格式如下：\n" +
                "{\n" +
                "  \"tips\": [\"贴士1\", \"贴士2\", \"贴士3\", \"贴士4\"],\n" +
                "  \"question\": {\n" +
                "    \"question\": \"问题文本\",\n" +
                "    \"options\": [\n" +
                "      {\"label\": \"A\", \"text\": \"选项A内容\"},\n" +
                "      {\"label\": \"B\", \"text\": \"选项B内容\"}\n" +
                "    ],\n" +
                "    \"correctAnswer\": \"A\",\n" +
                "    \"explanation\": \"解析文本\"\n" +
                "  },\n" +
                "  \"checklist\": [\n" +
                "    {\"text\": \"检查项1\", \"checked\": false},\n" +
                "    {\"text\": \"检查项2\", \"checked\": false}\n" +
                "  ]\n" +
                "}\n" +
                "要求：安全贴士至少4条，结合老人情况定制。问题应贴近服务场景。检查清单至少4项。";

        String userMessage = String.format(
            "服务类型：%s\n服务标题：%s\n服务描述：%s\n老人信息：%s\n老人备注：%s\n预约时间：%s %s\n服务时长：%s",
            task.getType() != null ? task.getType() : "未指定",
            task.getTitle() != null ? task.getTitle() : "未指定",
            task.getDescription() != null ? task.getDescription() : "无",
            elderlyInfo,
            task.getRemarks() != null ? task.getRemarks() : "无",
            task.getAppointmentDate() != null ? task.getAppointmentDate().toString() : "未指定",
            task.getAppointmentTime() != null ? task.getAppointmentTime() : "",
            task.getDuration() != null ? task.getDuration() : "未指定"
        );

        String responseJson = deepSeekClient.chat(systemPrompt, userMessage);
        if (responseJson == null) {
            return getDefaultGuidance();
        }

        try {
            String cleaned = responseJson.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            return objectMapper.readValue(cleaned, AiGuidanceResponse.class);
        } catch (Exception e) {
            log.warn("Failed to parse AI response JSON: {}", e.getMessage());
            return getDefaultGuidance();
        }
    }

    private String buildElderlyInfo(User elderly) {
        if (elderly == null) return "未知";
        StringBuilder sb = new StringBuilder();
        sb.append(elderly.getName() != null ? elderly.getName() : "未知");
        if (elderly.getGender() != null && elderly.getGender() == 1) sb.append("·男");
        else if (elderly.getGender() != null && elderly.getGender() == 2) sb.append("·女");
        if (elderly.getBirthDate() != null) {
            int age = (int) ChronoUnit.YEARS.between(elderly.getBirthDate(), LocalDate.now());
            sb.append("·").append(age).append("岁");
        }
        return sb.toString();
    }

    private AiGuidanceResponse getDefaultGuidance() {
        return AiGuidanceResponse.builder()
            .tips(List.of(
                "与服务对象沟通时请保持耐心和礼貌",
                "注意个人防护，佩戴口罩和手套",
                "如遇突发情况请及时联系平台",
                "服务完成后请填写服务记录"
            ))
            .question(AiGuidanceResponse.QuizQuestion.builder()
                .question("服务过程中如果老人感到不适，您应该怎么做？")
                .options(List.of(
                    AiGuidanceResponse.Option.builder().label("A").text("立即停止服务并联系紧急联系人或平台").build(),
                    AiGuidanceResponse.Option.builder().label("B").text("继续服务，让老人休息一下就好").build()
                ))
                .correctAnswer("A")
                .explanation("老人安全是第一位的，遇到任何不适情况都应立即停止并及时上报。")
                .build())
            .checklist(List.of(
                AiGuidanceResponse.CheckItem.builder().text("确认服务地址和预约时间").checked(false).build(),
                AiGuidanceResponse.CheckItem.builder().text("携带必要的服务工具和用品").checked(false).build(),
                AiGuidanceResponse.CheckItem.builder().text("保持手机畅通，方便联系").checked(false).build(),
                AiGuidanceResponse.CheckItem.builder().text("穿着志愿者服装并佩戴证件").checked(false).build()
            ))
            .build();
    }
}
