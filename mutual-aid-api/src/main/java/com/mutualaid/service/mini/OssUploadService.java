package com.mutualaid.service.mini;

import com.aliyun.oss.OSS;
import com.mutualaid.config.OssProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OssUploadService {

    private final OSS ossClient;
    private final OssProperties ossProperties;

    public String uploadAvatar(MultipartFile file) throws IOException {
        String bucketName = ossProperties.getBucketName();
        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = "avatars/" + UUID.randomUUID() + ext;

        ossClient.putObject(bucketName, fileName, file.getInputStream());

        return "https://" + bucketName + "." + ossProperties.getEndpoint() + "/" + fileName;
    }
}
