package com.mutualaid.model.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AiGuidanceResponse {
    private List<String> tips;
    private QuizQuestion question;
    private List<CheckItem> checklist;

    @Data
    @Builder
    public static class QuizQuestion {
        private String question;
        private List<Option> options;
        private String correctAnswer;
        private String explanation;
    }

    @Data
    @Builder
    public static class Option {
        private String label;
        private String text;
    }

    @Data
    @Builder
    public static class CheckItem {
        private String text;
        private boolean checked;
    }
}
