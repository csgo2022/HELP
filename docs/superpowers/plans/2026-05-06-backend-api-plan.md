# 互助养老平台 - 后端 API 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 Spring Boot 后端，为两个微信小程序提供 RESTful API 服务

**Architecture:** 单体 Spring Boot 应用，按业务模块分包 (user/service/announcement/mall/leaderboard)，使用 Spring Security + JWT 做认证，MySQL + JPA 持久化，Flyway 管理数据库迁移

**Tech Stack:** Java 17, Spring Boot 3.x, Spring Security, Spring Data JPA, MySQL 8, Flyway, JWT (jjwt), Maven

---

### Task 1: 初始化 Spring Boot 项目

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\pom.xml`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\MutualAidApplication.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\resources\application.yml`

- [ ] **Step 1: 创建 pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>

    <groupId>com.mutualaid</groupId>
    <artifactId>mutual-aid-api</artifactId>
    <version>1.0.0</version>
    <name>mutual-aid-api</name>
    <description>Backend API for Mutual Aid Platform</description>

    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.12.5</jjwt.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-mysql</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 2: 创建主应用类**

```java
package com.mutualaid;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MutualAidApplication {
    public static void main(String[] args) {
        SpringApplication.run(MutualAidApplication.class, args);
    }
}
```

- [ ] **Step 3: 创建 application.yml**

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mutual_aid?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

jwt:
  secret: YTJkNWY2YTctN2Y2MS00ZjA2LWJkYWMtM2I1YzQwN2U4ZjFh
  access-token-expiration: 604800000
  refresh-token-expiration: 2592000000
```

- [ ] **Step 4: 验证项目可以编译**
  Run: `cd D:/互助养老3/mutual-aid-api && mvn compile -q`
  Expected: BUILD SUCCESS

---

### Task 2: 统一响应封装和全局异常处理

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\common\response\ApiResponse.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\common\response\PageResult.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\common\exception\BusinessException.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\common\exception\GlobalExceptionHandler.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\common\enums\UserRoleEnum.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\common\enums\TaskStatusEnum.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\common\enums\OrderStatusEnum.java`

- [ ] **Step 1: 创建 ApiResponse.java**

```java
package com.mutualaid.common.response;

import lombok.Data;

@Data
public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;
    private long timestamp;

    private ApiResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "success", data);
    }

    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>(200, "success", null);
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(500, message, null);
    }
}
```

- [ ] **Step 2: 创建 PageResult.java**

```java
package com.mutualaid.common.response;

import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
public class PageResult<T> {
    private List<T> content;
    private int page;
    private int size;
    private long total;
    private int totalPages;

    public static <T> PageResult<T> of(Page<?> page, List<T> content) {
        PageResult<T> result = new PageResult<>();
        result.setContent(content);
        result.setPage(page.getNumber() + 1);
        result.setSize(page.getSize());
        result.setTotal(page.getTotalElements());
        result.setTotalPages(page.getTotalPages());
        return result;
    }
}
```

- [ ] **Step 3: 创建 BusinessException.java**

```java
package com.mutualaid.common.exception;

public class BusinessException extends RuntimeException {
    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(String message) {
        this(400, message);
    }

    public int getCode() {
        return code;
    }
}
```

- [ ] **Step 4: 创建 GlobalExceptionHandler.java**

```java
package com.mutualaid.common.exception;

import com.mutualaid.common.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleBusinessException(BusinessException e) {
        return ApiResponse.error(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleValidationException(MethodArgumentNotValidException e) {
        FieldError fieldError = e.getBindingResult().getFieldError();
        String message = fieldError != null ? fieldError.getDefaultMessage() : "参数校验失败";
        return ApiResponse.error(400, message);
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Void> handleAccessDeniedException() {
        return ApiResponse.error(403, "权限不足");
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleException(Exception e) {
        return ApiResponse.error(500, "服务器内部错误: " + e.getMessage());
    }
}
```

- [ ] **Step 5: 创建枚举类**

```java
// UserRoleEnum.java
package com.mutualaid.common.enums;

public enum UserRoleEnum {
    VOLUNTEER, ELDERLY, ADMIN
}
```

```java
// TaskStatusEnum.java
package com.mutualaid.common.enums;

public enum TaskStatusEnum {
    PENDING, MATCHING, IN_PROGRESS, COMPLETED, CANCELLED
}
```

```java
// OrderStatusEnum.java
package com.mutualaid.common.enums;

public enum OrderStatusEnum {
    PENDING, SHIPPED, DELIVERED, COMPLETED, CANCELLED
}
```

---

### Task 3: JWT 认证框架

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\security\JwtTokenProvider.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\security\JwtAuthenticationFilter.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\security\CurrentUser.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\config\SecurityConfig.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\config\WebMvcConfig.java`

- [ ] **Step 1: 创建 JwtTokenProvider.java**

```java
package com.mutualaid.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${jwt.refresh-token-expiration}") long refreshTokenExpiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String generateAccessToken(Long userId, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userId.toString())
                .claim("role", role)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessTokenExpiration))
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(Long userId) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + refreshTokenExpiration))
                .signWith(key)
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        return Long.parseLong(parseClaims(token).getSubject());
    }

    public String getRoleFromToken(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
```

- [ ] **Step 2: 创建 JwtAuthenticationFilter.java**

```java
package com.mutualaid.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request);

        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            String role = jwtTokenProvider.getRoleFromToken(token);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userId, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
            authentication.setDetails(role);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

- [ ] **Step 3: 创建 CurrentUser.java 注解**

```java
package com.mutualaid.security;

import java.lang.annotation.*;

@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CurrentUser {
}
```

- [ ] **Step 4: 创建 SecurityConfig.java**

```java
package com.mutualaid.config;

import com.mutualaid.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/login").permitAll()
                .requestMatchers("/api/mini/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

- [ ] **Step 5: 创建 WebMvcConfig.java**

```java
package com.mutualaid.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

- [ ] **Step 6: 创建 CurrentUser 参数解析器**

需要在 SecurityConfig 所在包或 config 包中创建 `CurrentUserMethodArgumentResolver.java`:

```java
package com.mutualaid.config;

import com.mutualaid.security.CurrentUser;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class CurrentUserMethodArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
                && parameter.getParameterType().equals(Long.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            return authentication.getPrincipal();
        }
        return null;
    }
}
```

然后在 WebMvcConfig.java 中注册这个解析器（添加 `implements WebMvcConfigurer` 已存在，在类中添加方法）:

```java
// 在 WebMvcConfig.java 中添加:
@Autowired
private CurrentUserMethodArgumentResolver currentUserResolver;

@Override
public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
    resolvers.add(currentUserResolver);
}
```

- [ ] **Step 7: 编译验证**
  Run: `cd D:/互助养老3/mutual-aid-api && mvn compile -q`
  Expected: BUILD SUCCESS

---

### Task 4: 数据库初始化 (Flyway)

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\resources\db\migration\V1__init_schema.sql`
- Create: `D:\互助养老3\mutual-aid-api\src\main\resources\db\migration\V2__seed_data.sql`

- [ ] **Step 1: 创建 V1__init_schema.sql**

```sql
-- 用户表
CREATE TABLE `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `phone` VARCHAR(20) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(50) DEFAULT NULL,
    `avatar` VARCHAR(500) DEFAULT NULL,
    `gender` TINYINT DEFAULT 0 COMMENT '0-未知 1-男 2-女',
    `birth_date` DATE DEFAULT NULL,
    `role` VARCHAR(20) NOT NULL COMMENT 'VOLUNTEER/ELDERLY/ADMIN',
    `status` TINYINT DEFAULT 0 COMMENT '0-正常 1-禁用',
    `points` INT DEFAULT 0 COMMENT '积分余额',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_phone` (`phone`),
    INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 志愿者扩展信息表
CREATE TABLE `volunteer_profile` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL UNIQUE,
    `total_hours` DECIMAL(10,1) DEFAULT 0,
    `rating` DECIMAL(2,1) DEFAULT 0,
    `verified` TINYINT(1) DEFAULT 0,
    `is_gold` TINYINT(1) DEFAULT 0,
    `service_count` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 实名认证表
CREATE TABLE `user_realname_auth` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `real_name` VARCHAR(50) NOT NULL,
    `id_card` VARCHAR(18) NOT NULL,
    `front_image` VARCHAR(500) DEFAULT NULL,
    `back_image` VARCHAR(500) DEFAULT NULL,
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING/APPROVED/REJECTED',
    `reject_reason` VARCHAR(255) DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 服务类型表
CREATE TABLE `service_type` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `icon` VARCHAR(100) DEFAULT NULL,
    `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 技能标签表
CREATE TABLE `skill` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `icon` VARCHAR(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 志愿者-技能关联表
CREATE TABLE `volunteer_skill` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `volunteer_id` BIGINT NOT NULL,
    `skill_id` BIGINT NOT NULL,
    UNIQUE KEY `uk_volunteer_skill` (`volunteer_id`, `skill_id`),
    FOREIGN KEY (`volunteer_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`skill_id`) REFERENCES `skill`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 服务任务表
CREATE TABLE `service_task` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `address` VARCHAR(500) DEFAULT NULL,
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING/MATCHING/IN_PROGRESS/COMPLETED/CANCELLED',
    `requester_id` BIGINT NOT NULL,
    `volunteer_id` BIGINT DEFAULT NULL,
    `appointment_date` DATE DEFAULT NULL,
    `appointment_time` VARCHAR(50) DEFAULT NULL,
    `duration` VARCHAR(20) DEFAULT NULL,
    `reward_hours` DECIMAL(4,1) DEFAULT 0,
    `remarks` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`requester_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`volunteer_id`) REFERENCES `user`(`id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_requester` (`requester_id`),
    INDEX `idx_volunteer` (`volunteer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 志愿者报名表
CREATE TABLE `service_task_applicant` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `task_id` BIGINT NOT NULL,
    `volunteer_id` BIGINT NOT NULL,
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING/ACCEPTED/REJECTED',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_task_volunteer` (`task_id`, `volunteer_id`),
    FOREIGN KEY (`task_id`) REFERENCES `service_task`(`id`),
    FOREIGN KEY (`volunteer_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 服务记录表
CREATE TABLE `service_record` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `task_id` BIGINT DEFAULT NULL,
    `volunteer_id` BIGINT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `time` DATETIME DEFAULT NULL,
    `location` VARCHAR(200) DEFAULT NULL,
    `duration` VARCHAR(20) DEFAULT NULL,
    `status` VARCHAR(20) DEFAULT NULL,
    `client` VARCHAR(50) DEFAULT NULL,
    `summary` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`volunteer_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评价表
CREATE TABLE `review` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `task_id` BIGINT NOT NULL,
    `from_user_id` BIGINT NOT NULL,
    `to_user_id` BIGINT NOT NULL,
    `rating` TINYINT NOT NULL COMMENT '1-5',
    `comment` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`task_id`) REFERENCES `service_task`(`id`),
    FOREIGN KEY (`from_user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`to_user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 公告表
CREATE TABLE `announcement` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `date` DATE DEFAULT NULL,
    `category` VARCHAR(50) DEFAULT NULL,
    `content` TEXT,
    `publisher` VARCHAR(50) DEFAULT NULL,
    `views` INT DEFAULT 0,
    `is_top` TINYINT(1) DEFAULT 0,
    `status` VARCHAR(20) DEFAULT 'PUBLISHED' COMMENT 'DRAFT/PUBLISHED',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商城商品表
CREATE TABLE `mall_product` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `points_required` INT NOT NULL,
    `stock` INT DEFAULT 0,
    `image` VARCHAR(500) DEFAULT NULL,
    `badge` VARCHAR(50) DEFAULT NULL,
    `status` VARCHAR(20) DEFAULT 'ON_SHELF' COMMENT 'ON_SHELF/OFF_SHELF',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 积分流水表
CREATE TABLE `point_transaction` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `type` VARCHAR(20) NOT NULL COMMENT 'EARN/SPEND',
    `amount` INT NOT NULL,
    `balance_after` INT NOT NULL,
    `reference_type` VARCHAR(50) DEFAULT NULL,
    `reference_id` BIGINT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 订单表
CREATE TABLE `orders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_no` VARCHAR(50) NOT NULL UNIQUE,
    `user_id` BIGINT NOT NULL,
    `product_id` BIGINT NOT NULL,
    `quantity` INT DEFAULT 1,
    `total_points` INT NOT NULL,
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING/SHIPPED/DELIVERED/COMPLETED/CANCELLED',
    `recipient_name` VARCHAR(50) DEFAULT NULL,
    `recipient_phone` VARCHAR(20) DEFAULT NULL,
    `address` VARCHAR(500) DEFAULT NULL,
    `courier` VARCHAR(50) DEFAULT NULL,
    `tracking_no` VARCHAR(100) DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`product_id`) REFERENCES `mall_product`(`id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 物流事件表
CREATE TABLE `order_logistics` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `time` DATETIME DEFAULT NULL,
    `status` VARCHAR(50) DEFAULT NULL,
    `description` TEXT,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 地址表
CREATE TABLE `address` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `address` VARCHAR(500) NOT NULL,
    `is_default` TINYINT(1) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 老人家属绑定表
CREATE TABLE `elderly_family` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `family_name` VARCHAR(50) NOT NULL,
    `family_phone` VARCHAR(20) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 健康记录表
CREATE TABLE `health_record` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `image` VARCHAR(500) DEFAULT NULL,
    `note` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 系统配置表
CREATE TABLE `sys_config` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `config_key` VARCHAR(100) NOT NULL UNIQUE,
    `config_value` TEXT,
    `description` VARCHAR(255) DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- [ ] **Step 2: 创建 V2__seed_data.sql**

```sql
-- 插入服务类型
INSERT INTO `service_type` (`name`, `icon`, `sort_order`) VALUES
('助餐服务', 'restaurant', 1),
('医疗陪护', 'medical', 2),
('家政清洁', 'cleaning', 3),
('代买代办', 'shopping-basket', 4),
('心理慰藉', 'campaign', 5),
('轮椅辅助', 'smart-toy', 6);

-- 插入技能标签
INSERT INTO `skill` (`name`, `icon`) VALUES
('医疗陪护', 'medical'),
('助餐服务', 'restaurant'),
('家政清洁', 'cleaning'),
('心理慰藉', 'campaign'),
('代买代办', 'shopping-basket'),
('轮椅辅助', 'smart-toy');

-- 插入默认管理员
INSERT INTO `user` (`phone`, `password`, `name`, `role`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '管理员', 'ADMIN');

-- 插入系统配置
INSERT INTO `sys_config` (`config_key`, `config_value`, `description`) VALUES
('exchange_rate', '10', '1小时服务时长兑换积分数量'),
('task_expire_hours', '48', '任务自动过期时间(小时)'),
('max_apply_per_task', '5', '每个任务最大报名人数');
```

- [ ] **Step 3: 运行 Flyway 迁移验证**
  Run: `cd D:/互助养老3/mutual-aid-api && mvn flyway:migrate -q`
  Expected: 数据库中创建所有表并插入种子数据

---

### Task 5: JPA 实体类

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\User.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\VolunteerProfile.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\UserRealnameAuth.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\ServiceTask.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\ServiceTaskApplicant.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\ServiceRecord.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\Review.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\ServiceType.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\Skill.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\Announcement.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\MallProduct.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\PointTransaction.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\Order.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\OrderLogistics.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\Address.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\ElderlyFamily.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\HealthRecord.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\SysConfig.java`

- [ ] **Step 1: 创建核心实体类**

```java
// User.java
package com.mutualaid.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "`user`")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(nullable = false)
    private String password;

    @Column(length = 50)
    private String name;

    @Column(length = 500)
    private String avatar;

    private Integer gender = 0;

    private LocalDate birthDate;

    @Column(nullable = false, length = 20)
    private String role;

    private Integer status = 0;

    private Integer points = 0;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

- [ ] **Step 2: 创建其他关键实体**

```java
// ServiceTask.java
package com.mutualaid.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "service_task")
public class ServiceTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String address;

    @Column(length = 20)
    private String status = "PENDING";

    @Column(name = "requester_id", nullable = false)
    private Long requesterId;

    @Column(name = "volunteer_id")
    private Long volunteerId;

    private LocalDate appointmentDate;

    @Column(length = 50)
    private String appointmentTime;

    @Column(length = 20)
    private String duration;

    @Column(name = "reward_hours")
    private java.math.BigDecimal rewardHours;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

```java
// Announcement.java
package com.mutualaid.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "announcement")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    private LocalDate date;

    @Column(length = 50)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 50)
    private String publisher;

    private Integer views = 0;

    @Column(name = "is_top")
    private Boolean isTop = false;

    @Column(length = 20)
    private String status = "PUBLISHED";

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

```java
// Order.java
package com.mutualaid.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String orderNo;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    private Integer quantity = 1;

    @Column(name = "total_points", nullable = false)
    private Integer totalPoints;

    @Column(length = 20)
    private String status = "PENDING";

    @Column(length = 50)
    private String recipientName;

    @Column(length = 20)
    private String recipientPhone;

    @Column(length = 500)
    private String address;

    @Column(length = 50)
    private String courier;

    @Column(length = 100)
    private String trackingNo;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

- [ ] **Step 3: 创建剩余的实体类（以下为简化版，全部写入一个步骤）**

创建以下文件（每个文件结构相似，使用 @Data @Entity @Table 注解映射到对应表）:
- `VolunteerProfile.java` — 字段: id, userId, totalHours, rating, verified, isGold, serviceCount
- `UserRealnameAuth.java` — 字段: id, userId, realName, idCard, frontImage, backImage, status, rejectReason
- `ServiceTaskApplicant.java` — 字段: id, taskId, volunteerId, status
- `ServiceRecord.java` — 字段: id, taskId, volunteerId, title, time, location, duration, status, client, summary
- `Review.java` — 字段: id, taskId, fromUserId, toUserId, rating, comment
- `ServiceType.java` — 字段: id, name, icon, sortOrder
- `Skill.java` — 字段: id, name, icon
- `MallProduct.java` — 字段: id, name, description, pointsRequired, stock, image, badge, status
- `PointTransaction.java` — 字段: id, userId, type, amount, balanceAfter, referenceType, referenceId
- `OrderLogistics.java` — 字段: id, orderId, time, status, description
- `Address.java` — 字段: id, userId, name, phone, address, isDefault
- `ElderlyFamily.java` — 字段: id, userId, familyName, familyPhone
- `HealthRecord.java` — 字段: id, userId, image, note
- `SysConfig.java` — 字段: id, configKey, configValue, description

**额外创建 VolunteerSkill.java 关联实体:**
```java
// VolunteerSkill.java
package com.mutualaid.model.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "volunteer_skill")
public class VolunteerSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "volunteer_id", nullable = false)
    private Long volunteerId;

    @Column(name = "skill_id", nullable = false)
    private Long skillId;
}
```

- [ ] **Step 4: 编译验证**
  Run: `cd D:/互助养老3/mutual-aid-api && mvn compile -q`
  Expected: BUILD SUCCESS

---

### Task 6: JPA Repository 层

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\UserRepository.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\VolunteerProfileRepository.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\ServiceTaskRepository.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\ServiceTaskApplicantRepository.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\ServiceRecordRepository.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\AnnouncementRepository.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\MallProductRepository.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\OrderRepository.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\AddressRepository.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\OtherRepositories.java` (other simple ones)

- [ ] **Step 1: 创建核心 Repository**

```java
// UserRepository.java
package com.mutualaid.repository;

import com.mutualaid.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByPhone(String phone);
    boolean existsByPhone(String phone);
    long countByRole(String role);
}
```

```java
// ServiceTaskRepository.java
package com.mutualaid.repository;

import com.mutualaid.model.entity.ServiceTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceTaskRepository extends JpaRepository<ServiceTask, Long> {
    List<ServiceTask> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);
    List<ServiceTask> findByVolunteerId(Long volunteerId);
    List<ServiceTask> findByStatus(String status);
    long countByStatus(String status);
}
```

```java
// AnnouncementRepository.java
package com.mutualaid.repository;

import com.mutualaid.model.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByStatusOrderByIsTopDescDateDesc(String status);
}
```

```java
// OrderRepository.java
package com.mutualaid.repository;

import com.mutualaid.model.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
}
```

- [ ] **Step 2: 创建其余 Repository**

```java
// VolunteerProfileRepository.java
package com.mutualaid.repository;

import com.mutualaid.model.entity.VolunteerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VolunteerProfileRepository extends JpaRepository<VolunteerProfile, Long> {
    Optional<VolunteerProfile> findByUserId(Long userId);
}
```

```java
// ServiceTaskApplicantRepository.java
package com.mutualaid.repository;

import com.mutualaid.model.entity.ServiceTaskApplicant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceTaskApplicantRepository extends JpaRepository<ServiceTaskApplicant, Long> {
    List<ServiceTaskApplicant> findByTaskId(Long taskId);
    boolean existsByTaskIdAndVolunteerId(Long taskId, Long volunteerId);
}
```

```java
// ServiceRecordRepository.java
package com.mutualaid.repository;

import com.mutualaid.model.entity.ServiceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, Long> {
    List<ServiceRecord> findByVolunteerIdOrderByCreatedAtDesc(Long volunteerId);
}
```

```java
// MallProductRepository.java
package com.mutualaid.repository;

import com.mutualaid.model.entity.MallProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MallProductRepository extends JpaRepository<MallProduct, Long> {
    List<MallProduct> findByStatus(String status);
}
```

```java
// AddressRepository.java
package com.mutualaid.repository;

import com.mutualaid.model.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserIdOrderByIsDefaultDesc(Long userId);
}
```

以下简单 Repository 与上述模式相同，创建即可：
- `PointTransactionRepository.java` — findByUserIdOrderByCreatedAtDesc
- `UserRealnameAuthRepository.java` — findByUserId, findByStatus
- `SkillRepository.java` — findAll (extends JpaRepository)
- `ReviewRepository.java` — findByTaskId, findByToUserId
- `OrderLogisticsRepository.java` — findByOrderIdOrderByTimeAsc
- `ElderlyFamilyRepository.java` — findByUserId
- `HealthRecordRepository.java` — findByUserIdOrderByCreatedAtDesc
- `SysConfigRepository.java` — findByConfigKey

**额外创建（需要完整代码）:**
- `VolunteerSkillRepository.java`:
```java
package com.mutualaid.repository;

import com.mutualaid.model.entity.VolunteerSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VolunteerSkillRepository extends JpaRepository<VolunteerSkill, Long> {
    List<VolunteerSkill> findByVolunteerId(Long volunteerId);
    void deleteByVolunteerId(Long volunteerId);
}
```

- `ServiceTypeRepository.java`:
```java
package com.mutualaid.repository;

import com.mutualaid.model.entity.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {
}
```

- [ ] **Step 3: 编译验证**
  Run: `cd D:/互助养老3/mutual-aid-api && mvn compile -q`
  Expected: BUILD SUCCESS

---

### Task 7: DTO 定义

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\dto\LoginRequest.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\dto\RegisterRequest.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\dto\UserProfileUpdateRequest.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\dto\CreateTaskRequest.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\dto\ReviewRequest.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\vo\UserProfileVO.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\vo\TaskVO.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\vo\LoginVO.java`

- [ ] **Step 1: 创建请求 DTO**

```java
// LoginRequest.java
package com.mutualaid.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "手机号不能为空")
    private String phone;

    @NotBlank(message = "密码不能为空")
    private String password;
}
```

```java
// RegisterRequest.java
package com.mutualaid.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "手机号不能为空")
    private String phone;

    @NotBlank(message = "密码不能为空")
    private String password;

    @NotBlank(message = "角色不能为空")
    private String role; // VOLUNTEER or ELDERLY
}
```

```java
// UserProfileUpdateRequest.java
package com.mutualaid.model.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserProfileUpdateRequest {
    private String name;
    private Integer gender;
    private LocalDate birthDate;
    private String avatar;
}
```

```java
// CreateTaskRequest.java
package com.mutualaid.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateTaskRequest {
    @NotBlank(message = "服务类型不能为空")
    private String type;

    @NotBlank(message = "标题不能为空")
    private String title;

    private String description;
    private String address;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private String duration;
    private String remarks;
}
```

```java
// ReviewRequest.java
package com.mutualaid.model.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull
    private Long taskId;

    @NotNull
    private Long toUserId;

    @Min(1) @Max(5)
    private int rating;

    private String comment;
}
```

- [ ] **Step 2: 创建响应 VO**

```java
// LoginVO.java
package com.mutualaid.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginVO {
    private String accessToken;
    private String refreshToken;
    private Long userId;
    private String role;
    private String name;
}
```

```java
// UserProfileVO.java
package com.mutualaid.model.vo;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class UserProfileVO {
    private Long id;
    private String phone;
    private String name;
    private String avatar;
    private Integer gender;
    private LocalDate birthDate;
    private String role;
    private Integer points;
    private List<String> tags;
    // volunteer specific
    private java.math.BigDecimal totalHours;
    private java.math.BigDecimal rating;
    private Integer serviceCount;
    private Boolean verified;
    private Boolean isGold;
}
```

```java
// TaskVO.java
package com.mutualaid.model.vo;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TaskVO {
    private Long id;
    private String type;
    private String title;
    private String description;
    private String address;
    private String status;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private String duration;
    private java.math.BigDecimal rewardHours;
    private String requesterName;
    private String volunteerName;
    private Integer applicantCount;
    private LocalDateTime createdAt;
}
```

- [ ] **Step 3: 编译验证**
  Run: `cd D:/互助养老3/mutual-aid-api && mvn compile -q`
  Expected: BUILD SUCCESS

---

### Task 8: 认证模块 (Auth) — 小程序端

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\UserRealnameAuthRepository.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\AuthService.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\AuthController.java`

- [ ] **Step 1: 创建 AuthService.java**

```java
package com.mutualaid.service.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.dto.LoginRequest;
import com.mutualaid.model.dto.RegisterRequest;
import com.mutualaid.model.entity.User;
import com.mutualaid.model.entity.VolunteerProfile;
import com.mutualaid.model.vo.LoginVO;
import com.mutualaid.repository.UserRepository;
import com.mutualaid.repository.VolunteerProfileRepository;
import com.mutualaid.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public LoginVO login(LoginRequest request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new BusinessException("手机号未注册"));

        if (user.getStatus() == 1) {
            throw new BusinessException("账号已被禁用");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("密码错误");
        }

        return buildLoginVO(user);
    }

    @Transactional
    public LoginVO register(RegisterRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException("手机号已被注册");
        }

        User user = new User();
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user = userRepository.save(user);

        // 如果是志愿者，创建志愿者档案
        if ("VOLUNTEER".equals(request.getRole())) {
            VolunteerProfile profile = new VolunteerProfile();
            profile.setUserId(user.getId());
            volunteerProfileRepository.save(profile);
        }

        return buildLoginVO(user);
    }

    public LoginVO refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("刷新令牌已过期");
        }
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return buildLoginVO(user);
    }

    private LoginVO buildLoginVO(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        return new LoginVO(accessToken, refreshToken, user.getId(), user.getRole(), user.getName());
    }
}
```

- [ ] **Step 2: 创建 AuthController.java**

```java
package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.dto.LoginRequest;
import com.mutualaid.model.dto.RegisterRequest;
import com.mutualaid.model.vo.LoginVO;
import com.mutualaid.service.mini.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mini/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginVO> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/register")
    public ApiResponse<LoginVO> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginVO> refresh(@RequestBody Map<String, String> body) {
        return ApiResponse.success(authService.refresh(body.get("refreshToken")));
    }
}
```

- [ ] **Step 3: 编译验证**
  Run: `cd D:/互助养老3/mutual-aid-api && mvn compile -q`
  Expected: BUILD SUCCESS

---

### Task 9: 用户模块 — 小程序端

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\UserService.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\UserController.java`

- [ ] **Step 1: 创建 UserService.java**

```java
package com.mutualaid.service.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.dto.UserProfileUpdateRequest;
import com.mutualaid.model.entity.*;
import com.mutualaid.model.vo.UserProfileVO;
import com.mutualaid.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final VolunteerSkillRepository volunteerSkillRepository;
    private final SkillRepository skillRepository;
    private final UserRealnameAuthRepository realnameAuthRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileVO getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        UserProfileVO vo = new UserProfileVO();
        vo.setId(user.getId());
        vo.setPhone(user.getPhone());
        vo.setName(user.getName());
        vo.setAvatar(user.getAvatar());
        vo.setGender(user.getGender());
        vo.setBirthDate(user.getBirthDate());
        vo.setRole(user.getRole());
        vo.setPoints(user.getPoints());

        // 志愿者补充信息
        if ("VOLUNTEER".equals(user.getRole())) {
            volunteerProfileRepository.findByUserId(userId).ifPresent(profile -> {
                vo.setTotalHours(profile.getTotalHours());
                vo.setRating(profile.getRating());
                vo.setServiceCount(profile.getServiceCount());
                vo.setVerified(profile.getVerified());
                vo.setIsGold(profile.getIsGold());
            });

            // 获取技能标签
            List<Long> skillIds = volunteerSkillRepository.findByVolunteerId(userId)
                    .stream().map(VolunteerSkill::getSkillId).toList();
            if (!skillIds.isEmpty()) {
                List<String> skillNames = skillRepository.findAllById(skillIds)
                        .stream().map(Skill::getName).collect(Collectors.toList());
                vo.setTags(skillNames);
            }
        }

        return vo;
    }

    @Transactional
    public void updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getBirthDate() != null) user.setBirthDate(request.getBirthDate());
        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());

        userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException("原密码错误");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void submitRealnameAuth(Long userId, String realName, String idCard) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        if (!"ELDERLY".equals(user.getRole())) {
            throw new BusinessException("仅老人用户可提交实名认证");
        }

        UserRealnameAuth auth = new UserRealnameAuth();
        auth.setUserId(userId);
        auth.setRealName(realName);
        auth.setIdCard(idCard);
        auth.setStatus("PENDING");
        realnameAuthRepository.save(auth);
    }

    @Transactional
    public void updateSkills(Long userId, List<Long> skillIds) {
        volunteerSkillRepository.deleteByVolunteerId(userId);
        for (Long skillId : skillIds) {
            VolunteerSkill vs = new VolunteerSkill();
            vs.setVolunteerId(userId);
            vs.setSkillId(skillId);
            volunteerSkillRepository.save(vs);
        }
    }
}
```

- [ ] **Step 2: 创建 UserController.java**

```java
package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.dto.UserProfileUpdateRequest;
import com.mutualaid.model.vo.UserProfileVO;
import com.mutualaid.security.CurrentUser;
import com.mutualaid.service.mini.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ApiResponse<UserProfileVO> getProfile(@CurrentUser Long userId) {
        return ApiResponse.success(userService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ApiResponse<Void> updateProfile(@CurrentUser Long userId,
                                           @Valid @RequestBody UserProfileUpdateRequest request) {
        userService.updateProfile(userId, request);
        return ApiResponse.success();
    }

    @PutMapping("/password")
    public ApiResponse<Void> changePassword(@CurrentUser Long userId,
                                            @RequestBody Map<String, String> body) {
        userService.changePassword(userId, body.get("oldPassword"), body.get("newPassword"));
        return ApiResponse.success();
    }

    @PostMapping("/realname-auth")
    public ApiResponse<Void> submitRealnameAuth(@CurrentUser Long userId,
                                                @RequestBody Map<String, String> body) {
        userService.submitRealnameAuth(userId, body.get("realName"), body.get("idCard"));
        return ApiResponse.success();
    }

    @PutMapping("/skills")
    public ApiResponse<Void> updateSkills(@CurrentUser Long userId,
                                          @RequestBody Map<String, List<Long>> body) {
        userService.updateSkills(userId, body.get("skillIds"));
        return ApiResponse.success();
    }
}
```

- [ ] **Step 3: 编译验证**
  Run: `cd D:/互助养老3/mutual-aid-api && mvn compile -q`
  Expected: BUILD SUCCESS

---

### Task 10: 服务任务模块 — 小程序端

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\TaskService.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\TaskController.java`

- [ ] **Step 1: 创建 TaskService.java**

```java
package com.mutualaid.service.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.dto.CreateTaskRequest;
import com.mutualaid.model.entity.*;
import com.mutualaid.model.vo.TaskVO;
import com.mutualaid.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final ServiceTaskRepository taskRepository;
    private final ServiceTaskApplicantRepository applicantRepository;
    private final UserRepository userRepository;

    public List<ServiceTask> getAvailableTasks() {
        return taskRepository.findByStatus("PENDING");
    }

    public List<ServiceTask> getMyTasks(Long requesterId) {
        return taskRepository.findByRequesterIdOrderByCreatedAtDesc(requesterId);
    }

    @Transactional
    public ServiceTask createTask(Long requesterId, CreateTaskRequest request) {
        ServiceTask task = new ServiceTask();
        task.setType(request.getType());
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setAddress(request.getAddress());
        task.setAppointmentDate(request.getAppointmentDate());
        task.setAppointmentTime(request.getAppointmentTime());
        task.setDuration(request.getDuration());
        task.setRemarks(request.getRemarks());
        task.setRequesterId(requesterId);
        task.setStatus("PENDING");
        return taskRepository.save(task);
    }

    public TaskVO getTaskDetail(Long taskId) {
        ServiceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));
        return convertToVO(task);
    }

    @Transactional
    public void applyTask(Long taskId, Long volunteerId) {
        ServiceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));

        if (!"PENDING".equals(task.getStatus())) {
            throw new BusinessException("该任务当前不可报名");
        }

        if (applicantRepository.existsByTaskIdAndVolunteerId(taskId, volunteerId)) {
            throw new BusinessException("您已报名该任务");
        }

        ServiceTaskApplicant applicant = new ServiceTaskApplicant();
        applicant.setTaskId(taskId);
        applicant.setVolunteerId(volunteerId);
        applicant.setStatus("PENDING");
        applicantRepository.save(applicant);

        // 状态改为匹配中
        task.setStatus("MATCHING");
        taskRepository.save(task);
    }

    @Transactional
    public void assignVolunteer(Long taskId, Long requesterId, Long volunteerId) {
        ServiceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));

        if (!task.getRequesterId().equals(requesterId)) {
            throw new BusinessException("只有发布者可以选定志愿者");
        }

        task.setVolunteerId(volunteerId);
        task.setStatus("IN_PROGRESS");
        taskRepository.save(task);
    }

    private TaskVO convertToVO(ServiceTask task) {
        TaskVO vo = new TaskVO();
        vo.setId(task.getId());
        vo.setType(task.getType());
        vo.setTitle(task.getTitle());
        vo.setDescription(task.getDescription());
        vo.setAddress(task.getAddress());
        vo.setStatus(task.getStatus());
        vo.setAppointmentDate(task.getAppointmentDate());
        vo.setAppointmentTime(task.getAppointmentTime());
        vo.setDuration(task.getDuration());
        vo.setRewardHours(task.getRewardHours());
        vo.setCreatedAt(task.getCreatedAt());

        userRepository.findById(task.getRequesterId()).ifPresent(u -> vo.setRequesterName(u.getName()));
        if (task.getVolunteerId() != null) {
            userRepository.findById(task.getVolunteerId()).ifPresent(u -> vo.setVolunteerName(u.getName()));
        }

        long applicantCount = applicantRepository.findByTaskId(task.getId()).size();
        vo.setApplicantCount((int) applicantCount);

        return vo;
    }
}
```

- [ ] **Step 2: 创建 TaskController.java**

```java
package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.dto.CreateTaskRequest;
import com.mutualaid.model.entity.ServiceTask;
import com.mutualaid.model.vo.TaskVO;
import com.mutualaid.security.CurrentUser;
import com.mutualaid.service.mini.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ApiResponse<List<ServiceTask>> getAvailableTasks() {
        return ApiResponse.success(taskService.getAvailableTasks());
    }

    @GetMapping("/my")
    public ApiResponse<List<ServiceTask>> getMyTasks(@CurrentUser Long userId) {
        return ApiResponse.success(taskService.getMyTasks(userId));
    }

    @PostMapping
    public ApiResponse<ServiceTask> createTask(@CurrentUser Long userId,
                                                @Valid @RequestBody CreateTaskRequest request) {
        return ApiResponse.success(taskService.createTask(userId, request));
    }

    @GetMapping("/{id}")
    public ApiResponse<TaskVO> getTaskDetail(@PathVariable Long id) {
        return ApiResponse.success(taskService.getTaskDetail(id));
    }

    @PostMapping("/{id}/apply")
    public ApiResponse<Void> applyTask(@PathVariable Long id, @CurrentUser Long userId) {
        taskService.applyTask(id, userId);
        return ApiResponse.success();
    }

    @PostMapping("/{id}/assign")
    public ApiResponse<Void> assignVolunteer(@PathVariable Long id,
                                              @CurrentUser Long userId,
                                              @RequestBody Map<String, Long> body) {
        taskService.assignVolunteer(id, userId, body.get("volunteerId"));
        return ApiResponse.success();
    }
}
```

- [ ] **Step 3: 编译验证**
  Run: `cd D:/互助养老3/mutual-aid-api && mvn compile -q`
  Expected: BUILD SUCCESS

---

### Task 11: 服务记录与评价模块

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\RecordService.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\RecordController.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\ReviewController.java`

- [ ] **Step 1: 创建 RecordService.java**

```java
package com.mutualaid.service.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.entity.Review;
import com.mutualaid.model.entity.ServiceRecord;
import com.mutualaid.repository.ReviewRepository;
import com.mutualaid.repository.ServiceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final ServiceRecordRepository recordRepository;
    private final ReviewRepository reviewRepository;

    public List<ServiceRecord> getMyRecords(Long volunteerId) {
        return recordRepository.findByVolunteerIdOrderByCreatedAtDesc(volunteerId);
    }

    public ServiceRecord getRecordDetail(Long id) {
        return recordRepository.findById(id)
                .orElseThrow(() -> new BusinessException("记录不存在"));
    }

    @Transactional
    public void submitReview(Long fromUserId, Long taskId, Long toUserId, int rating, String comment) {
        Review review = new Review();
        review.setTaskId(taskId);
        review.setFromUserId(fromUserId);
        review.setToUserId(toUserId);
        review.setRating(rating);
        review.setComment(comment);
        reviewRepository.save(review);
    }
}
```

- [ ] **Step 2: 创建 RecordController.java**

```java
package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.ServiceRecord;
import com.mutualaid.security.CurrentUser;
import com.mutualaid.service.mini.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mini/records")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;

    @GetMapping
    public ApiResponse<List<ServiceRecord>> getMyRecords(@CurrentUser Long userId) {
        return ApiResponse.success(recordService.getMyRecords(userId));
    }

    @GetMapping("/{id}")
    public ApiResponse<ServiceRecord> getRecordDetail(@PathVariable Long id) {
        return ApiResponse.success(recordService.getRecordDetail(id));
    }

    @PostMapping("/{id}/review")
    public ApiResponse<Void> submitReview(@CurrentUser Long userId,
                                          @PathVariable Long id,
                                          @RequestBody com.mutualaid.model.dto.ReviewRequest request) {
        recordService.submitReview(userId, id, request.getToUserId(), request.getRating(), request.getComment());
        return ApiResponse.success();
    }
}
```

---

### Task 12: 公告模块

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\AnnouncementService.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\AnnouncementController.java`

- [ ] **Step 1: 创建 AnnouncementService.java**

```java
package com.mutualaid.service.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.entity.Announcement;
import com.mutualaid.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public List<Announcement> getPublishedAnnouncements() {
        return announcementRepository.findByStatusOrderByIsTopDescDateDesc("PUBLISHED");
    }

    @Transactional
    public Announcement getAnnouncementDetail(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new BusinessException("公告不存在"));
        announcement.setViews(announcement.getViews() + 1);
        return announcementRepository.save(announcement);
    }
}
```

- [ ] **Step 2: 创建 AnnouncementController.java**

```java
package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.Announcement;
import com.mutualaid.service.mini.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mini/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ApiResponse<List<Announcement>> getAnnouncements() {
        return ApiResponse.success(announcementService.getPublishedAnnouncements());
    }

    @GetMapping("/{id}")
    public ApiResponse<Announcement> getAnnouncementDetail(@PathVariable Long id) {
        return ApiResponse.success(announcementService.getAnnouncementDetail(id));
    }
}
```

---

### Task 13: 积分商城模块

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\MallService.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\MallController.java`

- [ ] **Step 1: 创建 MallService.java**

```java
package com.mutualaid.service.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.entity.*;
import com.mutualaid.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MallService {

    private final MallProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderLogisticsRepository logisticsRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final UserRepository userRepository;

    public List<MallProduct> getProducts() {
        return productRepository.findByStatus("ON_SHELF");
    }

    public Integer getPointsBalance(Long userId) {
        return userRepository.findById(userId)
                .map(User::getPoints)
                .orElse(0);
    }

    @Transactional
    public Order createOrder(Long userId, Long productId, int quantity,
                              String recipientName, String recipientPhone, String address) {
        MallProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException("商品不存在"));

        if (product.getStock() < quantity) {
            throw new BusinessException("库存不足");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        int totalPoints = product.getPointsRequired() * quantity;
        if (user.getPoints() < totalPoints) {
            throw new BusinessException("积分不足");
        }

        // 扣积分
        user.setPoints(user.getPoints() - totalPoints);
        userRepository.save(user);

        // 扣库存
        product.setStock(product.getStock() - quantity);
        productRepository.save(product);

        // 创建订单
        Order order = new Order();
        order.setOrderNo("ORD" + System.currentTimeMillis());
        order.setUserId(userId);
        order.setProductId(productId);
        order.setQuantity(quantity);
        order.setTotalPoints(totalPoints);
        order.setRecipientName(recipientName);
        order.setRecipientPhone(recipientPhone);
        order.setAddress(address);
        order.setStatus("PENDING");
        order = orderRepository.save(order);

        // 积分流水
        PointTransaction pt = new PointTransaction();
        pt.setUserId(userId);
        pt.setType("SPEND");
        pt.setAmount(totalPoints);
        pt.setBalanceAfter(user.getPoints());
        pt.setReferenceType("ORDER");
        pt.setReferenceId(order.getId());
        pointTransactionRepository.save(pt);

        return order;
    }

    public List<Order> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Order getOrderDetail(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException("订单不存在"));
    }

    public List<OrderLogistics> getLogistics(Long orderId) {
        return logisticsRepository.findByOrderIdOrderByTimeAsc(orderId);
    }
}
```

- [ ] **Step 2: 创建 MallController.java**

```java
package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.MallProduct;
import com.mutualaid.model.entity.Order;
import com.mutualaid.model.entity.OrderLogistics;
import com.mutualaid.security.CurrentUser;
import com.mutualaid.service.mini.MallService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/point-mall")
@RequiredArgsConstructor
public class MallController {

    private final MallService mallService;

    @GetMapping("/products")
    public ApiResponse<List<MallProduct>> getProducts() {
        return ApiResponse.success(mallService.getProducts());
    }

    @GetMapping("/balance")
    public ApiResponse<Integer> getBalance(@CurrentUser Long userId) {
        return ApiResponse.success(mallService.getPointsBalance(userId));
    }
}

@RestController
@RequestMapping("/api/mini/orders")
@RequiredArgsConstructor
class OrderController {

    private final MallService mallService;

    @GetMapping
    public ApiResponse<List<Order>> getMyOrders(@CurrentUser Long userId) {
        return ApiResponse.success(mallService.getMyOrders(userId));
    }

    @PostMapping
    public ApiResponse<Order> createOrder(@CurrentUser Long userId, @RequestBody Map<String, Object> body) {
        Order order = mallService.createOrder(userId,
                Long.valueOf(body.get("productId").toString()),
                Integer.parseInt(body.get("quantity").toString()),
                (String) body.get("recipientName"),
                (String) body.get("recipientPhone"),
                (String) body.get("address"));
        return ApiResponse.success(order);
    }

    @GetMapping("/{id}")
    public ApiResponse<Order> getOrderDetail(@PathVariable Long id) {
        return ApiResponse.success(mallService.getOrderDetail(id));
    }

    @GetMapping("/{id}/logistics")
    public ApiResponse<List<OrderLogistics>> getLogistics(@PathVariable Long id) {
        return ApiResponse.success(mallService.getLogistics(id));
    }
}
```

---

### Task 14: 排行榜与地址模块

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\LeaderboardController.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\LeaderboardService.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\AddressController.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\AddressService.java`

- [ ] **Step 1: 创建 LeaderboardService.java**

```java
package com.mutualaid.service.mini;

import com.mutualaid.model.entity.User;
import com.mutualaid.model.entity.VolunteerProfile;
import com.mutualaid.repository.UserRepository;
import com.mutualaid.repository.VolunteerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final VolunteerProfileRepository profileRepository;
    private final UserRepository userRepository;

    public List<Map<String, Object>> getLeaderboard(String period) {
        List<VolunteerProfile> profiles = profileRepository.findAll();
        // 按 totalHours 降序排序
        profiles.sort((a, b) -> b.getTotalHours().compareTo(a.getTotalHours()));

        List<Map<String, Object>> result = new ArrayList<>();
        int rank = 1;
        for (VolunteerProfile p : profiles.subList(0, Math.min(profiles.size(), 50))) {
            User user = userRepository.findById(p.getUserId()).orElse(null);
            if (user == null) continue;

            Map<String, Object> entry = new HashMap<>();
            entry.put("rank", rank++);
            entry.put("name", user.getName());
            entry.put("score", p.getTotalHours() + "h");
            entry.put("avatar", user.getAvatar());
            entry.put("hours", p.getTotalHours());
            result.add(entry);
        }
        return result;
    }
}
```

- [ ] **Step 2: 创建 LeaderboardController.java**

```java
package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.service.mini.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getLeaderboard(
            @RequestParam(defaultValue = "all") String period) {
        return ApiResponse.success(leaderboardService.getLeaderboard(period));
    }
}
```

- [ ] **Step 3: 创建 AddressService.java**

```java
package com.mutualaid.service.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.entity.Address;
import com.mutualaid.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    public List<Address> getAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDesc(userId);
    }

    @Transactional
    public Address createAddress(Long userId, String name, String phone, String addressText, boolean isDefault) {
        if (isDefault) {
            clearDefaultFlag(userId);
        }
        Address address = new Address();
        address.setUserId(userId);
        address.setName(name);
        address.setPhone(phone);
        address.setAddress(addressText);
        address.setIsDefault(isDefault);
        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(Long id, Long userId, String name, String phone, String addressText, boolean isDefault) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new BusinessException("地址不存在"));

        if (!address.getUserId().equals(userId)) {
            throw new BusinessException("无权修改该地址");
        }

        if (isDefault) {
            clearDefaultFlag(userId);
        }

        if (name != null) address.setName(name);
        if (phone != null) address.setPhone(phone);
        if (addressText != null) address.setAddress(addressText);
        address.setIsDefault(isDefault);

        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Long id, Long userId) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new BusinessException("地址不存在"));
        if (!address.getUserId().equals(userId)) {
            throw new BusinessException("无权删除该地址");
        }
        addressRepository.delete(address);
    }

    private void clearDefaultFlag(Long userId) {
        List<Address> addresses = addressRepository.findByUserIdOrderByIsDefaultDesc(userId);
        for (Address addr : addresses) {
            if (addr.getIsDefault()) {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            }
        }
    }
}
```

- [ ] **Step 4: 创建 AddressController.java**

```java
package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.Address;
import com.mutualaid.security.CurrentUser;
import com.mutualaid.service.mini.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ApiResponse<List<Address>> getAddresses(@CurrentUser Long userId) {
        return ApiResponse.success(addressService.getAddresses(userId));
    }

    @PostMapping
    public ApiResponse<Address> createAddress(@CurrentUser Long userId, @RequestBody Map<String, Object> body) {
        return ApiResponse.success(addressService.createAddress(userId,
                (String) body.get("name"),
                (String) body.get("phone"),
                (String) body.get("address"),
                Boolean.TRUE.equals(body.get("isDefault"))));
    }

    @PutMapping("/{id}")
    public ApiResponse<Address> updateAddress(@PathVariable Long id, @CurrentUser Long userId,
                                               @RequestBody Map<String, Object> body) {
        return ApiResponse.success(addressService.updateAddress(id, userId,
                (String) body.get("name"),
                (String) body.get("phone"),
                (String) body.get("address"),
                Boolean.TRUE.equals(body.get("isDefault"))));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAddress(@PathVariable Long id, @CurrentUser Long userId) {
        addressService.deleteAddress(id, userId);
        return ApiResponse.success();
    }
}
```

---

### Task 15: 健康记录与家人绑定模块

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\HealthController.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\FamilyController.java`

- [ ] **Step 1: 创建 HealthController.java**

```java
package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.HealthRecord;
import com.mutualaid.repository.HealthRecordRepository;
import com.mutualaid.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/health-records")
@RequiredArgsConstructor
public class HealthController {

    private final HealthRecordRepository healthRecordRepository;

    @GetMapping
    public ApiResponse<List<HealthRecord>> getRecords(@CurrentUser Long userId) {
        return ApiResponse.success(healthRecordRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping
    public ApiResponse<HealthRecord> createRecord(@CurrentUser Long userId,
                                                   @RequestBody Map<String, String> body) {
        HealthRecord record = new HealthRecord();
        record.setUserId(userId);
        record.setImage(body.get("image"));
        record.setNote(body.get("note"));
        return ApiResponse.success(healthRecordRepository.save(record));
    }
}
```

- [ ] **Step 2: 创建 FamilyController.java**

```java
package com.mutualaid.controller.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.ElderlyFamily;
import com.mutualaid.repository.ElderlyFamilyRepository;
import com.mutualaid.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/family-bindings")
@RequiredArgsConstructor
public class FamilyController {

    private final ElderlyFamilyRepository familyRepository;

    @GetMapping
    public ApiResponse<List<ElderlyFamily>> getBindings(@CurrentUser Long userId) {
        return ApiResponse.success(familyRepository.findByUserId(userId));
    }

    @PostMapping
    public ApiResponse<ElderlyFamily> createBinding(@CurrentUser Long userId,
                                                     @RequestBody Map<String, String> body) {
        ElderlyFamily family = new ElderlyFamily();
        family.setUserId(userId);
        family.setFamilyName(body.get("familyName"));
        family.setFamilyPhone(body.get("familyPhone"));
        return ApiResponse.success(familyRepository.save(family));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBinding(@PathVariable Long id, @CurrentUser Long userId) {
        ElderlyFamily family = familyRepository.findById(id)
                .orElseThrow(() -> new BusinessException("绑定不存在"));
        if (!family.getUserId().equals(userId)) {
            throw new BusinessException("无权解绑");
        }
        familyRepository.delete(family);
        return ApiResponse.success();
    }
}
```

---

### Task 16: 管理端 API — 用户管理与认证审核

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\admin\AdminAuthController.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\admin\AdminUserService.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\admin\UserManageController.java`

- [ ] **Step 1: 创建 AdminAuthController.java**

```java
package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.dto.LoginRequest;
import com.mutualaid.model.vo.LoginVO;
import com.mutualaid.service.mini.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginVO> login(@Valid @RequestBody LoginRequest request) {
        LoginVO vo = authService.login(request);
        // 非管理员不能登录管理后台
        if (!"ADMIN".equals(vo.getRole())) {
            return ApiResponse.error(403, "无权登录管理后台");
        }
        return ApiResponse.success(vo);
    }
}
```

- [ ] **Step 2: 创建 AdminUserService.java**

```java
package com.mutualaid.service.admin;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.entity.User;
import com.mutualaid.model.entity.UserRealnameAuth;
import com.mutualaid.repository.UserRealnameAuthRepository;
import com.mutualaid.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserRealnameAuthRepository realnameAuthRepository;

    public Page<User> getUsers(String keyword, String role, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (keyword != null && !keyword.isEmpty()) {
                predicates.add(cb.or(
                        cb.like(root.get("name"), "%" + keyword + "%"),
                        cb.like(root.get("phone"), "%" + keyword + "%")
                ));
            }
            if (role != null && !role.isEmpty()) {
                predicates.add(cb.equal(root.get("role"), role));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return userRepository.findAll(spec, pageable);
    }

    public User getUserDetail(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));
    }

    @Transactional
    public void toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        user.setStatus(user.getStatus() == 0 ? 1 : 0);
        userRepository.save(user);
    }

    public List<UserRealnameAuth> getPendingRealnameAuths() {
        return realnameAuthRepository.findByStatus("PENDING");
    }

    @Transactional
    public void reviewRealnameAuth(Long id, String status, String rejectReason) {
        UserRealnameAuth auth = realnameAuthRepository.findById(id)
                .orElseThrow(() -> new BusinessException("认证记录不存在"));
        auth.setStatus(status);
        if ("REJECTED".equals(status)) {
            auth.setRejectReason(rejectReason);
        }
        realnameAuthRepository.save(auth);
    }
}
```

- [ ] **Step 3: 创建 UserManageController.java**

```java
package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.common.response.PageResult;
import com.mutualaid.model.entity.User;
import com.mutualaid.model.entity.UserRealnameAuth;
import com.mutualaid.service.admin.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class UserManageController {

    private final AdminUserService adminUserService;

    @GetMapping("/users")
    public ApiResponse<PageResult<User>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page - 1, size);
        return ApiResponse.success(PageResult.of(
                adminUserService.getUsers(keyword, role, pageable), null));
    }

    @GetMapping("/users/{id}")
    public ApiResponse<User> getUserDetail(@PathVariable Long id) {
        return ApiResponse.success(adminUserService.getUserDetail(id));
    }

    @PutMapping("/users/{id}/status")
    public ApiResponse<Void> toggleUserStatus(@PathVariable Long id) {
        adminUserService.toggleUserStatus(id);
        return ApiResponse.success();
    }

    @GetMapping("/realname-auth/list")
    public ApiResponse<List<UserRealnameAuth>> getPendingRealnameAuths() {
        return ApiResponse.success(adminUserService.getPendingRealnameAuths());
    }

    @PutMapping("/realname-auth/{id}")
    public ApiResponse<Void> reviewRealnameAuth(@PathVariable Long id,
                                                 @RequestBody Map<String, String> body) {
        adminUserService.reviewRealnameAuth(id, body.get("status"), body.get("rejectReason"));
        return ApiResponse.success();
    }
}
```

---

### Task 17: 管理端 API — 服务/公告/商城管理

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\admin\ServiceManageController.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\admin\AnnouncementManageController.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\admin\MallManageController.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\admin\OrderManageController.java`

- [ ] **Step 1: 创建 ServiceManageController.java**

```java
package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.ServiceType;
import com.mutualaid.model.entity.Skill;
import com.mutualaid.repository.ServiceTypeRepository;
import com.mutualaid.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ServiceManageController {

    private final ServiceTypeRepository serviceTypeRepository;
    private final SkillRepository skillRepository;

    // 服务类型管理
    @GetMapping("/service-types")
    public ApiResponse<List<ServiceType>> getServiceTypes() {
        return ApiResponse.success(serviceTypeRepository.findAll());
    }

    @PostMapping("/service-types")
    public ApiResponse<ServiceType> createServiceType(@RequestBody Map<String, Object> body) {
        ServiceType st = new ServiceType();
        st.setName((String) body.get("name"));
        st.setIcon((String) body.get("icon"));
        st.setSortOrder(body.get("sortOrder") != null ? Integer.parseInt(body.get("sortOrder").toString()) : 0);
        return ApiResponse.success(serviceTypeRepository.save(st));
    }

    @PutMapping("/service-types/{id}")
    public ApiResponse<ServiceType> updateServiceType(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        ServiceType st = serviceTypeRepository.findById(id).orElseThrow();
        if (body.containsKey("name")) st.setName((String) body.get("name"));
        if (body.containsKey("icon")) st.setIcon((String) body.get("icon"));
        if (body.containsKey("sortOrder")) st.setSortOrder(Integer.parseInt(body.get("sortOrder").toString()));
        return ApiResponse.success(serviceTypeRepository.save(st));
    }

    @DeleteMapping("/service-types/{id}")
    public ApiResponse<Void> deleteServiceType(@PathVariable Long id) {
        serviceTypeRepository.deleteById(id);
        return ApiResponse.success();
    }

    // 技能管理
    @GetMapping("/skills")
    public ApiResponse<List<Skill>> getSkills() {
        return ApiResponse.success(skillRepository.findAll());
    }

    @PostMapping("/skills")
    public ApiResponse<Skill> createSkill(@RequestBody Map<String, String> body) {
        Skill skill = new Skill();
        skill.setName(body.get("name"));
        skill.setIcon(body.get("icon"));
        return ApiResponse.success(skillRepository.save(skill));
    }

    @PutMapping("/skills/{id}")
    public ApiResponse<Skill> updateSkill(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Skill skill = skillRepository.findById(id).orElseThrow();
        if (body.containsKey("name")) skill.setName(body.get("name"));
        if (body.containsKey("icon")) skill.setIcon(body.get("icon"));
        return ApiResponse.success(skillRepository.save(skill));
    }

    @DeleteMapping("/skills/{id}")
    public ApiResponse<Void> deleteSkill(@PathVariable Long id) {
        skillRepository.deleteById(id);
        return ApiResponse.success();
    }
}
```

- [ ] **Step 2: 创建 AnnouncementManageController.java**

```java
package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.Announcement;
import com.mutualaid.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/announcements")
@RequiredArgsConstructor
public class AnnouncementManageController {

    private final AnnouncementRepository announcementRepository;

    @GetMapping
    public ApiResponse<Page<Announcement>> getAnnouncements(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(announcementRepository.findAll(PageRequest.of(page - 1, size)));
    }

    @PostMapping
    public ApiResponse<Announcement> createAnnouncement(@RequestBody Map<String, Object> body) {
        Announcement announcement = new Announcement();
        announcement.setTitle((String) body.get("title"));
        announcement.setContent((String) body.get("content"));
        announcement.setCategory((String) body.get("category"));
        announcement.setPublisher((String) body.get("publisher"));
        announcement.setDate(LocalDate.now());
        announcement.setIsTop(Boolean.TRUE.equals(body.get("isTop")));
        return ApiResponse.success(announcementRepository.save(announcement));
    }

    @PutMapping("/{id}")
    public ApiResponse<Announcement> updateAnnouncement(@PathVariable Long id,
                                                         @RequestBody Map<String, Object> body) {
        Announcement announcement = announcementRepository.findById(id).orElseThrow();
        if (body.containsKey("title")) announcement.setTitle((String) body.get("title"));
        if (body.containsKey("content")) announcement.setContent((String) body.get("content"));
        if (body.containsKey("category")) announcement.setCategory((String) body.get("category"));
        if (body.containsKey("isTop")) announcement.setIsTop(Boolean.TRUE.equals(body.get("isTop")));
        if (body.containsKey("status")) announcement.setStatus((String) body.get("status"));
        return ApiResponse.success(announcementRepository.save(announcement));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementRepository.deleteById(id);
        return ApiResponse.success();
    }
}
```

- [ ] **Step 3: 创建 MallManageController.java**

```java
package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.MallProduct;
import com.mutualaid.repository.MallProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class MallManageController {

    private final MallProductRepository productRepository;

    @GetMapping
    public ApiResponse<List<MallProduct>> getProducts() {
        return ApiResponse.success(productRepository.findAll());
    }

    @PostMapping
    public ApiResponse<MallProduct> createProduct(@RequestBody Map<String, Object> body) {
        MallProduct product = new MallProduct();
        product.setName((String) body.get("name"));
        product.setDescription((String) body.get("description"));
        product.setPointsRequired(Integer.parseInt(body.get("pointsRequired").toString()));
        product.setStock(Integer.parseInt(body.get("stock").toString()));
        product.setImage((String) body.get("image"));
        product.setBadge((String) body.get("badge"));
        product.setStatus("ON_SHELF");
        return ApiResponse.success(productRepository.save(product));
    }

    @PutMapping("/{id}")
    public ApiResponse<MallProduct> updateProduct(@PathVariable Long id,
                                                   @RequestBody Map<String, Object> body) {
        MallProduct product = productRepository.findById(id).orElseThrow();
        if (body.containsKey("name")) product.setName((String) body.get("name"));
        if (body.containsKey("description")) product.setDescription((String) body.get("description"));
        if (body.containsKey("pointsRequired"))
            product.setPointsRequired(Integer.parseInt(body.get("pointsRequired").toString()));
        if (body.containsKey("stock"))
            product.setStock(Integer.parseInt(body.get("stock").toString()));
        if (body.containsKey("image")) product.setImage((String) body.get("image"));
        if (body.containsKey("badge")) product.setBadge((String) body.get("badge"));
        if (body.containsKey("status")) product.setStatus((String) body.get("status"));
        return ApiResponse.success(productRepository.save(product));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ApiResponse.success();
    }
}
```

- [ ] **Step 4: 创建 OrderManageController.java**

```java
package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.Order;
import com.mutualaid.model.entity.OrderLogistics;
import com.mutualaid.repository.OrderLogisticsRepository;
import com.mutualaid.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class OrderManageController {

    private final OrderRepository orderRepository;
    private final OrderLogisticsRepository logisticsRepository;

    @GetMapping
    public ApiResponse<List<Order>> getOrders() {
        return ApiResponse.success(orderRepository.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Order> getOrderDetail(@PathVariable Long id) {
        return ApiResponse.success(orderRepository.findById(id).orElseThrow());
    }

    @PutMapping("/{id}/logistics")
    public ApiResponse<Void> updateLogistics(@PathVariable Long id,
                                              @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setCourier(body.get("courier"));
        order.setTrackingNo(body.get("trackingNo"));
        order.setStatus("SHIPPED");
        orderRepository.save(order);

        OrderLogistics log = new OrderLogistics();
        log.setOrderId(id);
        log.setTime(LocalDateTime.now());
        log.setStatus("已发货");
        log.setDescription("您的订单已通过" + body.get("courier") + "发出，运单号：" + body.get("trackingNo"));
        logisticsRepository.save(log);

        return ApiResponse.success();
    }
}
```

---

### Task 18: 管理端 API — 仪表盘与系统设置

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\admin\DashboardController.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\admin\SystemConfigController.java`

- [ ] **Step 1: 创建 DashboardController.java**

```java
package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final ServiceTaskRepository taskRepository;
    private final OrderRepository orderRepository;
    private final AnnouncementRepository announcementRepository;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVolunteers", userRepository.countByRole("VOLUNTEER"));
        stats.put("totalElderly", userRepository.countByRole("ELDERLY"));
        stats.put("pendingTasks", taskRepository.countByStatus("PENDING"));
        stats.put("inProgressTasks", taskRepository.countByStatus("IN_PROGRESS"));
        stats.put("completedTasks", taskRepository.countByStatus("COMPLETED"));
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalAnnouncements", announcementRepository.count());
        return ApiResponse.success(stats);
    }
}
```

- [ ] **Step 2: 创建 SystemConfigController.java**

```java
package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.SysConfig;
import com.mutualaid.repository.SysConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SysConfigRepository sysConfigRepository;

    @GetMapping
    public ApiResponse<List<SysConfig>> getSettings() {
        return ApiResponse.success(sysConfigRepository.findAll());
    }

    @PutMapping
    public ApiResponse<Void> updateSettings(@RequestBody Map<String, String> body) {
        body.forEach((key, value) -> {
            SysConfig config = sysConfigRepository.findByConfigKey(key).orElse(null);
            if (config != null) {
                config.setConfigValue(value);
                sysConfigRepository.save(config);
            }
        });
        return ApiResponse.success();
    }
}
```

---

### Task 19: 管理员后台 (Vue 3 + Element Plus) — 项目初始化

**Files:**
- Create: `D:\互助养老3\mutual-aid-admin\package.json`
- Create: `D:\互助养老3\mutual-aid-admin\vite.config.ts`
- Create: `D:\互助养老3\mutual-aid-admin\tsconfig.json`
- Create: `D:\互助养老3\mutual-aid-admin\index.html`
- Create: `D:\互助养老3\mutual-aid-admin\src\main.ts`
- Create: `D:\互助养老3\mutual-aid-admin\src\App.vue`
- Create: `D:\互助养老3\mutual-aid-admin\src\env.d.ts`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "mutual-aid-admin",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.3.0",
    "pinia": "^2.1.0",
    "element-plus": "^2.7.0",
    "axios": "^1.7.0",
    "@element-plus/icons-vue": "^2.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vue-tsc": "^2.0.0"
  }
}
```

- [ ] **Step 2: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

- [ ] **Step 3: 创建 main.ts**

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// Register all icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
```

- [ ] **Step 4: 创建 router/index.ts**

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('@/layout/MainLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/user/UserList.vue'),
        },
        {
          path: 'users/detail/:id',
          name: 'UserDetail',
          component: () => import('@/views/user/UserDetail.vue'),
        },
        {
          path: 'realname-auth',
          name: 'RealnameAuth',
          component: () => import('@/views/user/RealnameAuth.vue'),
        },
        {
          path: 'service-types',
          name: 'ServiceTypes',
          component: () => import('@/views/service/ServiceTypeList.vue'),
        },
        {
          path: 'skills',
          name: 'Skills',
          component: () => import('@/views/service/SkillList.vue'),
        },
        {
          path: 'announcements',
          name: 'Announcements',
          component: () => import('@/views/announcement/AnnouncementList.vue'),
        },
        {
          path: 'products',
          name: 'Products',
          component: () => import('@/views/mall/ProductList.vue'),
        },
        {
          path: 'orders',
          name: 'Orders',
          component: () => import('@/views/mall/OrderList.vue'),
        },
        {
          path: 'leaderboard',
          name: 'Leaderboard',
          component: () => import('@/views/leaderboard/LeaderboardView.vue'),
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/settings/SettingsView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

- [ ] **Step 5: 创建 API 请求封装 src/api/request.ts**

```typescript
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    return res.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      router.push('/login')
    }
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
```

- [ ] **Step 6: 创建 API 模块 src/api/user.ts**

```typescript
import request from './request'

export const getUsers = (params?: any) => request.get('/admin/users', { params })
export const getUserDetail = (id: number) => request.get(`/admin/users/${id}`)
export const toggleUserStatus = (id: number) => request.put(`/admin/users/${id}/status`)
export const getRealnameAuthList = () => request.get('/admin/realname-auth/list')
export const reviewRealnameAuth = (id: number, data: any) => request.put(`/admin/realname-auth/${id}`, data)
```

- [ ] **Step 7: 创建布局组件 src/layout/MainLayout.vue**

```vue
<template>
  <el-container style="min-height: 100vh">
    <el-aside :width="isCollapse ? '64px' : '220px'">
      <div class="logo">{{ isCollapse ? '互助' : '互助养老管理' }}</div>
      <el-menu
        :default-active="route.path"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#ff8c42"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-sub-menu index="user">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/users">用户列表</el-menu-item>
          <el-menu-item index="/realname-auth">实名认证</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="service">
          <template #title>
            <el-icon><List /></el-icon>
            <span>服务管理</span>
          </template>
          <el-menu-item index="/service-types">服务类型</el-menu-item>
          <el-menu-item index="/skills">技能管理</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/announcements">
          <el-icon><Warning /></el-icon>
          <span>公告管理</span>
        </el-menu-item>
        <el-sub-menu index="mall">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>商城管理</span>
          </template>
          <el-menu-item index="/products">商品管理</el-menu-item>
          <el-menu-item index="/orders">订单管理</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/leaderboard">
          <el-icon><TrendCharts /></el-icon>
          <span>排行榜</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-left">
          <el-icon @click="isCollapse = !isCollapse" style="cursor: pointer">
            <Fold />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta?.title || route.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-info">
              {{ userName }} <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)
const userName = computed(() => userStore.name || '管理员')

const logout = () => {
  localStorage.removeItem('admin_token')
  router.push('/login')
}
</script>

<style scoped>
.el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.header-right {
  display: flex;
  align-items: center;
}
.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}
.el-aside {
  background-color: #304156;
}
</style>
```

- [ ] **Step 8: 创建登录页 src/views/login/LoginView.vue**

```vue
<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 style="text-align: center; margin-bottom: 24px">互助养老管理平台</h2>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="0">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="管理员账号" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = reactive({ phone: '', password: '' })
const rules = {
  phone: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const res: any = await request.post('/admin/login', form)
    localStorage.setItem('admin_token', res.accessToken)
    localStorage.setItem('admin_name', res.name)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e) {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #ff8c42 100%);
}
.login-card {
  width: 400px;
}
</style>
```

- [ ] **Step 9: 创建仪表盘页 src/views/dashboard/DashboardView.vue**

```vue
<template>
  <div>
    <h2>系统概览</h2>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="6" v-for="item in stats" :key="item.label">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const stats = ref([
  { label: '志愿者', value: 0 },
  { label: '老人用户', value: 0 },
  { label: '待处理任务', value: 0 },
  { label: '进行中任务', value: 0 },
  { label: '已完成任务', value: 0 },
  { label: '总订单', value: 0 },
  { label: '公告数', value: 0 },
])

onMounted(async () => {
  try {
    const data: any = await request.get('/admin/dashboard/stats')
    stats.value = [
      { label: '志愿者', value: data.totalVolunteers },
      { label: '老人用户', value: data.totalElderly },
      { label: '待处理任务', value: data.pendingTasks },
      { label: '进行中任务', value: data.inProgressTasks },
      { label: '已完成任务', value: data.completedTasks },
      { label: '总订单', value: data.totalOrders },
      { label: '公告数', value: data.totalAnnouncements },
    ]
  } catch (e) {
    // handled by interceptor
  }
})
</script>

<style scoped>
.stat-item { text-align: center; padding: 12px; }
.stat-value { font-size: 32px; font-weight: bold; color: #ff8c42; }
.stat-label { font-size: 14px; color: #666; margin-top: 8px; }
</style>
```

- [ ] **Step 10: 创建用户管理列表页 src/views/user/UserList.vue**

```vue
<template>
  <div>
    <h2>用户管理</h2>
    <el-card style="margin-top: 16px">
      <el-form :inline="true">
        <el-form-item label="关键词">
          <el-input v-model="keyword" placeholder="姓名/手机号" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="role" clearable placeholder="全部">
            <el-option label="志愿者" value="VOLUNTEER" />
            <el-option label="老人" value="ELDERLY" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">搜索</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="users" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'VOLUNTEER' ? 'success' : 'warning'">
              {{ row.role === 'VOLUNTEER' ? '志愿者' : row.role === 'ELDERLY' ? '老人' : '管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row.id)">详情</el-button>
            <el-button
              :type="row.status === 0 ? 'warning' : 'success'"
              link size="small"
              @click="toggleStatus(row.id)"
            >
              {{ row.status === 0 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="page"
        :page-size="20"
        :total="total"
        layout="total, prev, pager, next"
        style="margin-top: 16px; justify-content: center"
        @current-change="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { getUsers, toggleUserStatus } from '@/api/user'

const router = useRouter()
const users = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')
const role = ref('')
const page = ref(1)
const total = ref(0)

const fetchData = async () => {
  loading.value = true
  try {
    const data: any = await getUsers({ keyword: keyword.value, role: role.value, page: page.value, size: 20 })
    // if response is PageResult with content
    users.value = data.content || data
    total.value = data.total || users.value.length
  } catch (e) {
    // handled
  } finally {
    loading.value = false
  }
}

const reset = () => {
  keyword.value = ''
  role.value = ''
  page.value = 1
  fetchData()
}

const toggleStatus = async (id: number) => {
  try {
    await toggleUserStatus(id)
    fetchData()
  } catch (e) { /* handled */ }
}

const viewDetail = (id: number) => {
  router.push(`/users/detail/${id}`)
}

onMounted(fetchData)
</script>
```

- [ ] **Step 11: 创建其他管理页面（简写）**

创建以下 Vue 页面（每个都是一个标准 Element Plus CRUD 页面）:

1. **src/views/user/UserDetail.vue** — 用户详情展示（基本信息、服务记录、订单列表）
2. **src/views/user/RealnameAuth.vue** — 实名认证审核列表，通过/驳回操作
3. **src/views/service/ServiceTypeList.vue** — 服务类型 CRUD（表格 + 对话框编辑）
4. **src/views/service/SkillList.vue** — 技能标签 CRUD
5. **src/views/announcement/AnnouncementList.vue** — 公告管理（列表 + 富文本编辑器添加/编辑）
6. **src/views/mall/ProductList.vue** — 商品管理 CRUD（带上下架切换）
7. **src/views/mall/OrderList.vue** — 订单列表（查看详情、发货操作）
8. **src/views/leaderboard/LeaderboardView.vue** — 排行榜展示
9. **src/views/settings/SettingsView.vue** — 系统配置编辑

---

### Task 20: 最终验证

- [ ] **Step 1: 启动后端**
  Run: `cd D:/互助养老3/mutual-aid-api && mvn spring-boot:run`
  Expected: Spring Boot 启动成功，监听 8080 端口

- [ ] **Step 2: 启动 Admin**
  Run: `cd D:/互助养老3/mutual-aid-admin && npm install && npm run dev`
  Expected: Vite 启动成功，监听 3000 端口

- [ ] **Step 3: 验证核心流程**
  - 注册用户: `POST /api/mini/auth/register`
  - 登录: `POST /api/mini/auth/login`
  - 获取公告: `GET /api/mini/announcements`
  - 管理员登录: `POST /api/admin/login` (admin/admin)
  - Admin 页面: 打开 `http://localhost:3000` 验证
