package com.example.order.dto;

import java.util.List;

public class OrderTableDTO {
    private Long orderId;
    private Double payAmount;
    private String businessName;
    private Double businessDeliveryFees;
    private List<OrderItemDTO> orderItemDTOs;
    // getter/setter
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Double getPayAmount() { return payAmount; }
    public void setPayAmount(Double payAmount) { this.payAmount = payAmount; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public Double getBusinessDeliveryFees() { return businessDeliveryFees; }
    public void setBusinessDeliveryFees(Double businessDeliveryFees) { this.businessDeliveryFees = businessDeliveryFees; }
    public List<OrderItemDTO> getOrderItemDTOs() { return orderItemDTOs; }
    public void setOrderItemDTOs(List<OrderItemDTO> orderItemDTOs) { this.orderItemDTOs = orderItemDTOs; }
} 