package com.mutualaid.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mutualaid.config.DeepSeekProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeepSeekClient {

    private final DeepSeekProperties properties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public String chat(String systemPrompt, String userMessage) {
        try {
            DeepSeekRequest request = new DeepSeekRequest();
            request.setModel(properties.getModel());
            request.setMessages(List.of(
                new DeepSeekRequest.Message("system", systemPrompt),
                new DeepSeekRequest.Message("user", userMessage)
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(properties.getApiKey());

            String body = objectMapper.writeValueAsString(request);
            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            String json = restTemplate.postForObject(properties.getApiUrl(), entity, String.class);
            DeepSeekResponse response = objectMapper.readValue(json, DeepSeekResponse.class);

            if (response.getChoices() != null && !response.getChoices().isEmpty()) {
                return response.getChoices().get(0).getMessage().getContent();
            }
            return null;
        } catch (Exception e) {
            log.error("DeepSeek API call failed: {}", e.getMessage());
            return null;
        }
    }
}
