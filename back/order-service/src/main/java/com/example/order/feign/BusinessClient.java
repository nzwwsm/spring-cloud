package com.example.order.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "business-service")
public interface BusinessClient {
    @GetMapping("/business/{id}")
    Object getBusinessById(@PathVariable("id") Long id);

    @GetMapping("/commodity/{id}")
    Object getCommodityById(@PathVariable("id") Long id);
} 