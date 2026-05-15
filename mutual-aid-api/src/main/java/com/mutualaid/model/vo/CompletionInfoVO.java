package com.mutualaid.model.vo;

import lombok.Data;
import java.util.List;

@Data
public class CompletionInfoVO {
    private List<String> photos;
    private String summary;
}
