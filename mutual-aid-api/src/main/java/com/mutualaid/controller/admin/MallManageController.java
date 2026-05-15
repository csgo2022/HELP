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
