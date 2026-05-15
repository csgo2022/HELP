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
