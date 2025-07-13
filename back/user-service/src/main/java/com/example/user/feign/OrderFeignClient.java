package com.example.user.feign;

import com.example.common.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;
import java.util.Map;

@FeignClient(name = "order-service")
public interface OrderFeignClient {
    @GetMapping("/order/payedorder")
    Result getPayedOrderByUserId(@RequestParam("userId") Long userId);

    @GetMapping("/order/unpayorder")
    Result getUnpayOrderByUserId(@RequestParam("userId") Long userId);

    @GetMapping("/order/items")
    List<Map<String, Object>> getOrderItemsByOrderId(@RequestParam("orderId") Long orderId);
} 