package com.mutualaid.service.mini;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mutualaid.model.dto.HealthAnalysisResponse;
import com.mutualaid.service.ai.DeepSeekClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthAnalysisService {

    private final OcrService ocrService;
    private final DeepSeekClient deepSeekClient;
    private final ObjectMapper objectMapper;

    public HealthAnalysisResponse analyze(String imageUrl) {
        // 1. OCR 提取文字
        String ocrText = ocrService.extractText(imageUrl);

        // 2. OCR 失败时降级
        if (ocrText == null || ocrText.isBlank()) {
            log.warn("OCR returned no text for image: {}", imageUrl);
            return getDefaultResponse("未能从图片中识别出文字，请确保照片清晰完整。");
        }

        // 3. DeepSeek 分析
        String systemPrompt = "你是一个专业的体检报告分析助手。根据OCR提取的体检报告文本，提取关键指标并给出健康建议。" +
                "必须返回严格的JSON格式（不要markdown代码块），格式如下：\n" +
                "{\n" +
                "  \"metrics\": [\n" +
                "    {\"name\":\"指标名\",\"value\":\"数值\",\"unit\":\"单位\",\"range\":\"参考范围\",\"status\":\"正常/偏高/偏低\"}\n" +
                "  ],\n" +
                "  \"summary\":\"总体评价一句话\",\n" +
                "  \"advice\":[\"具体建议1\",\"建议2\",\"建议3\"],\n" +
                "  \"riskLevel\":\"normal/attention/warning\"\n" +
                "}\n" +
                "要求：metrics列表提取报告中所有可识别的指标，至少包含3个指标。status字段只能是\"正常\"、\"偏高\"或\"偏低\"。riskLevel只能是normal、attention或warning。";

        String userMessage = "以下是体检报告的OCR识别文本，请分析其中的健康指标：\n\n" + ocrText;

        String responseJson = deepSeekClient.chat(systemPrompt, userMessage);
        if (responseJson == null) {
            return getDefaultResponse("AI分析服务暂时不可用，请稍后再试。");
        }

        try {
            String cleaned = responseJson.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            return objectMapper.readValue(cleaned, HealthAnalysisResponse.class);
        } catch (Exception e) {
            log.warn("Failed to parse AI health analysis JSON: {}", e.getMessage());
            return getDefaultResponse("AI分析结果解析失败，请稍后再试。");
        }
    }

    private HealthAnalysisResponse getDefaultResponse(String summary) {
        return HealthAnalysisResponse.builder()
                .metrics(List.of(
                        HealthAnalysisResponse.Metric.builder().name("血压").value("--").unit("mmHg").range("120/80").status("--").build(),
                        HealthAnalysisResponse.Metric.builder().name("血糖").value("--").unit("mmol/L").range("3.9-6.1").status("--").build(),
                        HealthAnalysisResponse.Metric.builder().name("心率").value("--").unit("次/分").range("60-100").status("--").build()
                ))
                .summary(summary)
                .advice(List.of("建议重新拍摄清晰的照片上传", "或手动输入健康指标数据"))
                .riskLevel("normal")
                .build();
    }
}
