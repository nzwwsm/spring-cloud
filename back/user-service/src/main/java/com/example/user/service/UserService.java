package com.example.user.service;

import com.example.user.dao.UserDAO;
import com.example.user.dto.UserDTO;
import com.example.user.entity.User;
import com.example.common.Result;
import com.example.user.feign.OrderFeignClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.example.user.feign.BusinessFeignClient;

@Service
public class UserService {
    @Autowired
    private UserDAO userDAO;

    @Autowired
    private OrderFeignClient orderFeignClient;

    @Autowired
    private BusinessFeignClient businessFeignClient;

    @Transactional
    public Result register(UserDTO userDTO) {
        if (userDTO.getUsername() == null || userDTO.getUsername().trim().isEmpty()) {
            return Result.error("用户名不能为空");
        }
        if (!userDTO.getUsername().matches("^[a-zA-Z0-9_]+$")) {
            return Result.error("用户名只能包含数字、字母和下划线");
        }
        if (userDTO.getPassword() == null || userDTO.getPassword().trim().isEmpty()) {
            return Result.error("密码不能为空");
        }
        if (!userDTO.getPassword().matches("^[a-zA-Z0-9_]+$")) {
            return Result.error("密码只能包含数字、字母和下划线");
        }
        if (userDAO.findByUsername(userDTO.getUsername()) != null) {
            return Result.error("用户名已存在");
        }
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword());
        user.setAddress(userDTO.getAddress());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        user.setToken(userDTO.getToken());
        userDAO.save(user);
        return Result.success("注册成功");
    }

    public Result getUserById(Long id) {
        User user = userDAO.findById(id).orElse(null);
        return user != null ? Result.success(user) : Result.error("用户不存在");
    }

    public Result getUserByUsername(String username) {
        User user = userDAO.findByUsername(username);
        return user != null ? Result.success(user) : Result.error("用户不存在");
    }

    public Long getUserIdByUsername(String username) {
        User user = userDAO.findByUsername(username);
        return user != null ? user.getId() : null;
    }

    // 删除 getOrdersByUserId 方法，避免调用不存在的 FeignClient 方法

    // 新增：获取已支付订单并补全详细信息
    public List<Map<String, Object>> getPayedOrder(Long userId) {
        Result result = orderFeignClient.getPayedOrderByUserId(userId);
        List<Map<String, Object>> orders = null;
        if (result != null && result.getData() instanceof List) {
            orders = (List<Map<String, Object>>) result.getData();
        } else {
            orders = new ArrayList<>();
        }
        for (Map<String, Object> order : orders) {
            // 补全商家名称
            Object businessIdObj = order.get("businessId");
            if (businessIdObj instanceof Number) {
                Long businessId = ((Number) businessIdObj).longValue();
                Map<String, Object> businessResp = businessFeignClient.getBusinessById(businessId);
                System.out.println("businessResp: " + businessResp);
                if (businessResp != null && businessResp.get("data") instanceof Map) {
                    Map data = (Map) businessResp.get("data");
                    System.out.println("data: " + data);
                    order.put("businessName", data.get("name"));
                    order.put("businessDeliveryFees", data.get("deliveryFees"));
                }
            }
            // 无论原orderItemDTOs是否为空，都主动查明细
            Long orderId = order.get("orderId") instanceof Number ? ((Number)order.get("orderId")).longValue() : null;
            List<Map<String, Object>> items = new ArrayList<>();
            if (orderId != null) {
                items = orderFeignClient.getOrderItemsByOrderId(orderId);
            }
            for (Map<String, Object> item : items) {
                Object commodityIdObj = item.get("commodityId");
                if (commodityIdObj instanceof Number) {
                    Long commodityId = ((Number) commodityIdObj).longValue();
                    Map<String, Object> commodityResp = businessFeignClient.getCommodityById(commodityId);
                    if (commodityResp != null && commodityResp.get("data") instanceof Map) {
                        Map data = (Map) commodityResp.get("data");
                        item.put("productName", data.get("commodityName"));
                        item.put("commodityPrice", data.get("price"));
                        item.put("image", data.get("image"));
                    }
                }
            }
            order.put("orderItemDTOs", items);
        }
        return orders;
    }

    // 新增：获取未支付订单并补全详细信息
    public List<Map<String, Object>> getUnpayOrder(Long userId) {
        Result result = orderFeignClient.getUnpayOrderByUserId(userId);
        List<Map<String, Object>> orders = null;
        if (result != null && result.getData() instanceof List) {
            orders = (List<Map<String, Object>>) result.getData();
        } else {
            orders = new ArrayList<>();
        }
        for (Map<String, Object> order : orders) {
            // 补全商家名称
            Object businessIdObj = order.get("businessId");
            if (businessIdObj instanceof Number) {
                Long businessId = ((Number) businessIdObj).longValue();
                Map<String, Object> businessResp = businessFeignClient.getBusinessById(businessId);
                System.out.println("businessResp: " + businessResp);
                if (businessResp != null && businessResp.get("data") instanceof Map) {
                    Map data = (Map) businessResp.get("data");
                    System.out.println("data: " + data);
                    order.put("businessName", data.get("name"));
                    order.put("businessDeliveryFees", data.get("deliveryFees"));
                }
            }
            // 无论原orderItemDTOs是否为空，都主动查明细
            Long orderId = order.get("orderId") instanceof Number ? ((Number)order.get("orderId")).longValue() : null;
            List<Map<String, Object>> items = new ArrayList<>();
            if (orderId != null) {
                items = orderFeignClient.getOrderItemsByOrderId(orderId);
            }
            for (Map<String, Object> item : items) {
                Object commodityIdObj = item.get("commodityId");
                if (commodityIdObj instanceof Number) {
                    Long commodityId = ((Number) commodityIdObj).longValue();
                    Map<String, Object> commodityResp = businessFeignClient.getCommodityById(commodityId);
                    if (commodityResp != null && commodityResp.get("data") instanceof Map) {
                        Map data = (Map) commodityResp.get("data");
                        item.put("productName", data.get("commodityName"));
                        item.put("commodityPrice", data.get("price"));
                        item.put("image", data.get("image"));
                    }
                }
            }
            order.put("orderItemDTOs", items);
        }
        return orders;
    }
} 