package com.mutualaid.config;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OssConfig {

    @Bean
    @ConfigurationProperties(prefix = "aliyun.oss")
    public OssProperties ossProperties() {
        return new OssProperties();
    }

    @Bean
    public OSS ossClient(OssProperties props) {
        return new OSSClientBuilder().build(props.getEndpoint(), props.getAccessKeyId(), props.getAccessKeySecret());
    }
}
