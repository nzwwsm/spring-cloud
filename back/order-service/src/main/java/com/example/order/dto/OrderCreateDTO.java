package com.example.order.dto;

import java.util.List;

public class OrderCreateDTO {
    private Long businessId;
    private List<OrderItemCreateDTO> orderItems;

    public static class OrderItemCreateDTO {
        private Long commodityId;
        private Integer quanity;
        // getter/setter
        public Long getCommodityId() { return commodityId; }
        public void setCommodityId(Long commodityId) { this.commodityId = commodityId; }
        public Integer getQuanity() { return quanity; }
        public void setQuanity(Integer quanity) { this.quanity = quanity; }
    }
    // getter/setter
    public Long getBusinessId() { return businessId; }
    public void setBusinessId(Long businessId) { this.businessId = businessId; }
    public List<OrderItemCreateDTO> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItemCreateDTO> orderItems) { this.orderItems = orderItems; }
} 