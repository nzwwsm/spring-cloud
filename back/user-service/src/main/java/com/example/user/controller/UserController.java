package com.example.user.controller;

import com.example.user.service.UserService;
import com.example.user.dao.UserDAO;
import com.example.user.dto.UserDTO;
import com.example.user.entity.User;
import com.example.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public Result register(@RequestBody UserDTO userDTO) {
        return userService.register(userDTO);
    }

    @GetMapping("/{id}")
    public Result getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // TODO: 订单相关接口应通过远程调用 order-service 获取，不再直接操作本地订单表

    @GetMapping("/getByUsername")
    public Result getByUsername(@RequestParam String username) {
        return userService.getUserByUsername(username);
    }

    // 获取已支付订单
    @GetMapping("/payedorder")
    public ResponseEntity<Result> getPayedOrder(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).body(Result.error("未授权访问"));
        }
        // 通过用户名查 userId
        String username = jwt.getSubject();
        Long userId = userService.getUserIdByUsername(username);
        if (userId == null) {
            return ResponseEntity.status(404).body(Result.error("用户不存在"));
        }
        List<?> orders = userService.getPayedOrder(userId);
        return ResponseEntity.ok(Result.success(orders));
    }

    // 获取未支付订单
    @GetMapping("/unpayorder")
    public ResponseEntity<Result> getUnpayOrder(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).body(Result.error("未授权访问"));
        }
        String username = jwt.getSubject();
        Long userId = userService.getUserIdByUsername(username);
        if (userId == null) {
            return ResponseEntity.status(404).body(Result.error("用户不存在"));
        }
        List<?> orders = userService.getUnpayOrder(userId);
        return ResponseEntity.ok(Result.success(orders));
    }
} 