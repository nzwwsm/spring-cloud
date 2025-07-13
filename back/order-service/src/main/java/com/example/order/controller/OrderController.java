package com.example.order.controller;

import com.example.order.dto.OrderCreateDTO;
import com.example.order.service.OrderService;
import com.example.common.Result;
import com.example.order.dao.OrderItemDAO;
import com.example.order.entity.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/order")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderItemDAO orderItemDAO;

    @PostMapping("/create")
    public Result createOrder(@RequestBody OrderCreateDTO orderCreateDTO, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return Result.error("未授权访问");
        }
        return orderService.createOrder(orderCreateDTO, jwt.getSubject());
    }

    @GetMapping("/list")
    public Result listOrders(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return Result.error("未授权访问");
        }
        return Result.success(orderService.getOrdersByUser(jwt.getSubject()));
    }

    @GetMapping("/payedorder")
    public Result getPayedOrderByUserId(@RequestParam Long userId) {
        return Result.success(orderService.getPayedOrderByUserId(userId));
    }

    @GetMapping("/unpayorder")
    public Result getUnpayOrderByUserId(@RequestParam Long userId) {
        return Result.success(orderService.getUnpayOrderByUserId(userId));
    }

    @GetMapping("/items")
    public List<Map<String, Object>> getOrderItemsByOrderId(@RequestParam("orderId") Long orderId) {
        List<OrderItem> items = orderItemDAO.findByOrderTableId(orderId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (OrderItem item : items) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId());
            map.put("quanity", item.getQuanity());
            map.put("commodityId", item.getCommodityId());
            result.add(map);
        }
        return result;
    }
} 