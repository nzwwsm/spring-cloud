package com.example.user.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "business-service")
public interface BusinessFeignClient {
    @GetMapping("/business/{id}")
    Map<String, Object> getBusinessById(@PathVariable("id") Long id);

    @GetMapping("/commodity/{id}")
    Map<String, Object> getCommodityById(@PathVariable("id") Long id);
} 