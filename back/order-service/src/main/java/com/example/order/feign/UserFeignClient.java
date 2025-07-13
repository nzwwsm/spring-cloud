package com.example.order.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.Map;

@FeignClient(name = "user-service")
public interface UserFeignClient {
    @GetMapping("/user/getByUsername")
    Map getByUsername(@RequestParam("username") String username);
} 