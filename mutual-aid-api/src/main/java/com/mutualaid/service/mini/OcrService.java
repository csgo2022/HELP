package com.mutualaid.service.mini;

import com.aliyuncs.CommonRequest;
import com.aliyuncs.CommonResponse;
import com.aliyuncs.DefaultAcsClient;
import com.aliyuncs.http.MethodType;
import com.aliyuncs.profile.DefaultProfile;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mutualaid.config.OssProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OcrService {

    private final OssProperties ossProperties;
    private final ObjectMapper objectMapper;

    public String extractText(String imageUrl) {
        try {
            DefaultProfile profile = DefaultProfile.getProfile(
                "cn-hangzhou",
                ossProperties.getAccessKeyId(),
                ossProperties.getAccessKeySecret()
            );
            DefaultAcsClient client = new DefaultAcsClient(profile);

            CommonRequest request = new CommonRequest();
            request.setSysDomain("ocr-api.cn-hangzhou.aliyuncs.com");
            request.setSysVersion("2021-07-07");
            request.setSysAction("RecognizeAdvanced");
            request.setSysMethod(MethodType.POST);
            request.putBodyParameter("Url", imageUrl);

            CommonResponse response = client.getCommonResponse(request);
            if (response.getData() != null) {
                // Data is a JSON string, need double parsing
                JsonNode root = objectMapper.readTree(response.getData());
                String dataStr = root.get("Data").asText();
                if (dataStr != null) {
                    JsonNode data = objectMapper.readTree(dataStr);
                    if (data.has("content")) {
                        return data.get("content").asText();
                    }
                }
            }
            return null;
        } catch (Exception e) {
            log.error("Aliyun OCR failed for image: {}", imageUrl, e);
            return null;
        }
    }
}
