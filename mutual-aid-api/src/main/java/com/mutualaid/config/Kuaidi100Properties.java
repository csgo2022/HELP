package com.mutualaid.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "kuaidi100")
public class Kuaidi100Properties {
    private String key;
    private String customer;
    private String queryUrl;
    private int cacheMinutes = 30;
}
