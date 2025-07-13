package com.example.auth.service;

import com.example.common.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/user/getByUsername")
    Result getUserByUsername(@RequestParam("username") String username);

    @PostMapping("/user/register")
    Result registerUser(@RequestParam("username") String username, @RequestParam("password") String password);
} 