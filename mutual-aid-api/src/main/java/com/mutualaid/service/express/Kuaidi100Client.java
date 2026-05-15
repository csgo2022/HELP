package com.mutualaid.service.express;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mutualaid.config.Kuaidi100Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class Kuaidi100Client {

    private final Kuaidi100Properties properties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public Kuaidi100Response queryTracking(String com, String num, String phone) {
        return queryTracking(com, num, phone, null, null);
    }

    public Kuaidi100Response queryTracking(String com, String num, String phone,
                                            String from, String to) {
        try {
            Map<String, String> paramMap = new LinkedHashMap<>();
            paramMap.put("com", com);
            paramMap.put("num", num);
            paramMap.put("resultv2", "2");
            if (phone != null && !phone.isEmpty()) {
                paramMap.put("phone", phone);
            }
            if (from != null && !from.isEmpty()) {
                paramMap.put("from", from);
            }
            if (to != null && !to.isEmpty()) {
                paramMap.put("to", to);
            }
            String paramJson = objectMapper.writeValueAsString(paramMap);

            String signSource = paramJson + properties.getKey() + properties.getCustomer();
            String sign = DigestUtils.md5DigestAsHex(signSource.getBytes(StandardCharsets.UTF_8)).toUpperCase();

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("customer", properties.getCustomer());
            body.add("sign", sign);
            body.add("param", paramJson);

            String response = restTemplate.postForObject(properties.getQueryUrl(), body, String.class);
            log.info("Kuaidi100 RAW response for {} {}: {}", com, num, response);
            // 临时写入文件用于调试
            try {
                java.nio.file.Files.writeString(
                    java.nio.file.Paths.get("kuaidi100_debug.log"),
                    java.time.LocalDateTime.now() + " | " + com + " " + num + " | " + response + "\n",
                    java.nio.file.StandardOpenOption.CREATE,
                    java.nio.file.StandardOpenOption.APPEND
                );
            } catch (Exception ignored) {}
            return objectMapper.readValue(response, Kuaidi100Response.class);
        } catch (Exception e) {
            log.error("Failed to query Kuaidi100 for com={}, num={}: {}", com, num, e.getMessage());
            return null;
        }
    }
}
