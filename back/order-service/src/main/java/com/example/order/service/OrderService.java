package com.example.order.service;

import com.example.order.dao.OrderDAO;
import com.example.order.dao.OrderItemDAO;
import com.example.order.entity.OrderTable;
import com.example.order.entity.OrderItem;
import com.example.order.dto.OrderCreateDTO;
import com.example.order.dto.OrderTableDTO;
import com.example.order.dto.OrderItemDTO;
import com.example.order.feign.BusinessClient;
import com.example.order.feign.UserFeignClient;
import com.example.common.Result;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Map;

@Service
public class OrderService {
    @Autowired
    private OrderDAO orderDAO;
    @Autowired
    private OrderItemDAO orderItemDAO;
    @Autowired
    private BusinessClient businessClient;
    @Autowired
    private UserFeignClient userFeignClient;

    @Transactional
    public Result createOrder(OrderCreateDTO orderCreateDTO, String username) {
        System.out.println("[OrderService] createOrder called, username: " + username);
        // 0. 远程获取用户信息
        Map userResult = userFeignClient.getByUsername(username);
        System.out.println("[OrderService] userResult: " + userResult);
        if (userResult == null || !Boolean.TRUE.equals(userResult.get("success")) || userResult.get("data") == null) {
            System.out.println("[OrderService] 用户信息获取失败");
            return Result.error("用户信息获取失败");
        }
        Map userData = (Map) userResult.get("data");
        System.out.println("[OrderService] userData: " + userData);
        if (userData == null || userData.get("id") == null) {
            System.out.println("[OrderService] 用户信息无效");
            return Result.error("用户信息无效");
        }
        Long userId = ((Number) userData.get("id")).longValue();
        // 1. 远程获取商家信息
        Object businessObj = businessClient.getBusinessById(orderCreateDTO.getBusinessId());
        System.out.println("[OrderService] businessObj: " + businessObj);
        String businessName = null;
        if (businessObj instanceof Map) {
            Map map = (Map) businessObj;
            Object data = map.get("data");
            if (data instanceof Map) {
                businessName = (String) ((Map) data).get("name");
            }
        }
        if (businessName == null) {
            System.out.println("[OrderService] 商家信息获取失败");
            return Result.error("商家信息获取失败");
        }
        // 2. 组装订单
        OrderTable order = new OrderTable();
        order.setBusinessId(orderCreateDTO.getBusinessId());
        // order.setBusinessName(businessName); // 实体类无此字段
        // order.setUsername(username); // 实体类无此字段
        // order.setCreateTime(new java.util.Date()); // 实体类无此字段
        order.setIsPay(false);
        double total = 0;
        HashSet<OrderItem> orderItems = new HashSet<>();
        for (OrderCreateDTO.OrderItemCreateDTO itemDTO : orderCreateDTO.getOrderItems()) {
            Object commodityObj = businessClient.getCommodityById(itemDTO.getCommodityId());
            System.out.println("[OrderService] commodityObj: " + commodityObj);
            // String name = null, img = null; // 实体类无此字段
            Double price = null;
            if (commodityObj instanceof Map) {
                Map map = (Map) commodityObj;
                Object data = map.get("data");
                if (data instanceof Map) {
                    Map<String, Object> dataMap = (Map<String, Object>) data;
                    // name = (String) dataMap.get("name");
                    // img = (String) dataMap.get("img");
                    Object priceObj = dataMap.get("price");
                    price = priceObj instanceof Number ? ((Number) priceObj).doubleValue() : null;
                }
            }
            if (price == null) {
                System.out.println("[OrderService] 商品信息获取失败, commodityId: " + itemDTO.getCommodityId());
                return Result.error("商品信息获取失败");
            }
            OrderItem orderItem = new OrderItem();
            orderItem.setCommodityId(itemDTO.getCommodityId());
            // orderItem.setName(name); // 实体类无此字段
            // orderItem.setImg(img); // 实体类无此字段
            // orderItem.setPrice(price); // 实体类无此字段
            orderItem.setQuanity(itemDTO.getQuanity());
            // orderItem.setOrderTable(order); // 实体类无此字段
            total += price * itemDTO.getQuanity();
            orderItems.add(orderItem);
        }
        // order.setOrderItems(orderItems); // 实体类无此字段
        order.setPayAmount(total);
        order.setUserId(userId); // 补全 userId
        System.out.println("[OrderService] order to save: " + order);
        orderDAO.save(order); // 保存主表
        // 保存明细表
        for (OrderItem item : orderItems) {
            item.setOrderTableId(order.getId());
        }
        System.out.println("[OrderService] orderItems to save: " + orderItems);
        orderItemDAO.saveAll(orderItems);
        System.out.println("[OrderService] createOrder success, orderId: " + order.getId());
        return Result.success(order.getId());
    }

    public List<OrderTableDTO> getOrdersByUser(String username) {
        List<OrderTable> orders = orderDAO.findAll(); // 实际应按用户名过滤
        List<OrderTableDTO> dtos = new ArrayList<>();
        for (OrderTable order : orders) {
            // if (!username.equals(order.getUsername())) continue; // 实体类无此字段
            OrderTableDTO dto = new OrderTableDTO();
            BeanUtils.copyProperties(order, dto);
            // List<OrderItemDTO> itemDTOs = new ArrayList<>();
            // if (order.getOrderItems() != null) {
            //     for (OrderItem item : order.getOrderItems()) {
            //         OrderItemDTO itemDTO = new OrderItemDTO();
            //         BeanUtils.copyProperties(item, itemDTO);
            //         itemDTOs.add(itemDTO);
            //     }
            // }
            // dto.setOrderItems(itemDTOs);
            dtos.add(dto);
        }
        return dtos;
    }

    public List<OrderTableDTO> getPayedOrderByUserId(Long userId) {
        List<OrderTable> orders = orderDAO.findAll(); // 实际应按 userId 和 isPay=true 过滤
        List<OrderTableDTO> dtos = new ArrayList<>();
        for (OrderTable order : orders) {
            if (!userId.equals(order.getUserId())) continue;
            if (!Boolean.TRUE.equals(order.getIsPay())) continue;
            System.out.println("orderId=" + order.getId() + ", businessId=" + order.getBusinessId());
            OrderTableDTO dto = new OrderTableDTO();
            dto.setOrderId(order.getId());
            dto.setPayAmount(order.getPayAmount());
            // 获取商家信息
            Object businessObj = businessClient.getBusinessById(order.getBusinessId());
            if (businessObj instanceof Map) {
                Map map = (Map) businessObj;
                Object data = map.get("data");
                if (data instanceof Map) {
                    dto.setBusinessName((String) ((Map) data).get("name"));
                    Object deliveryFees = ((Map) data).get("deliveryFees");
                    if (deliveryFees instanceof Number) {
                        dto.setBusinessDeliveryFees(((Number) deliveryFees).doubleValue());
                    }
                }
            }
            // 获取订单明细
            List<OrderItem> items = orderItemDAO.findByOrderTableId(order.getId());
            System.out.println("orderId=" + order.getId() + ", orderItems count=" + items.size());
            List<OrderItemDTO> itemDTOs = new ArrayList<>();
            for (OrderItem item : items) {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setQuanity(item.getQuanity());
                itemDTO.setCommodityId(item.getCommodityId());
                // 远程查商品信息
                Object commodityObj = businessClient.getCommodityById(item.getCommodityId());
                if (commodityObj instanceof Map) {
                    Map map = (Map) commodityObj;
                    Object data = map.get("data");
                    if (data instanceof Map) {
                        itemDTO.setProductName((String) ((Map) data).get("commodityName"));
                        Object price = ((Map) data).get("price");
                        if (price instanceof Number) {
                            itemDTO.setCommodityPrice(((Number) price).doubleValue());
                        }
                        itemDTO.setImage((String) ((Map) data).get("image"));
                    }
                }
                itemDTOs.add(itemDTO);
            }
            dto.setOrderItemDTOs(itemDTOs);
            dtos.add(dto);
        }
        return dtos;
    }

    public List<OrderTableDTO> getUnpayOrderByUserId(Long userId) {
        List<OrderTable> orders = orderDAO.findAll(); // 实际应按 userId 和 isPay=false 过滤
        List<OrderTableDTO> dtos = new ArrayList<>();
        for (OrderTable order : orders) {
            if (!userId.equals(order.getUserId())) continue;
            if (!Boolean.FALSE.equals(order.getIsPay())) continue;
            OrderTableDTO dto = new OrderTableDTO();
            dto.setOrderId(order.getId());
            dto.setPayAmount(order.getPayAmount());
            // 获取商家信息
            Object businessObj = businessClient.getBusinessById(order.getBusinessId());
            if (businessObj instanceof Map) {
                Map map = (Map) businessObj;
                Object data = map.get("data");
                if (data instanceof Map) {
                    dto.setBusinessName((String) ((Map) data).get("name"));
                    Object deliveryFees = ((Map) data).get("deliveryFees");
                    if (deliveryFees instanceof Number) {
                        dto.setBusinessDeliveryFees(((Number) deliveryFees).doubleValue());
                    }
                }
            }
            // 获取订单明细
            List<OrderItem> items = orderItemDAO.findByOrderTableId(order.getId());
            List<OrderItemDTO> itemDTOs = new ArrayList<>();
            for (OrderItem item : items) {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setQuanity(item.getQuanity());
                itemDTO.setCommodityId(item.getCommodityId());
                // 远程查商品信息
                Object commodityObj = businessClient.getCommodityById(item.getCommodityId());
                if (commodityObj instanceof Map) {
                    Map map = (Map) commodityObj;
                    Object data = map.get("data");
                    if (data instanceof Map) {
                        itemDTO.setProductName((String) ((Map) data).get("commodityName"));
                        Object price = ((Map) data).get("price");
                        if (price instanceof Number) {
                            itemDTO.setCommodityPrice(((Number) price).doubleValue());
                        }
                        itemDTO.setImage((String) ((Map) data).get("image"));
                    }
                }
                itemDTOs.add(itemDTO);
            }
            dto.setOrderItemDTOs(itemDTOs);
            dtos.add(dto);
        }
        return dtos;
    }
} 