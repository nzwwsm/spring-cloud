package com.example.order.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "order_table")
public class OrderTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Boolean isPay;
    private Double payAmount;
    private Long businessId;
    private Long userId;

    // getter/setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Boolean getIsPay() { return isPay; }
    public void setIsPay(Boolean isPay) { this.isPay = isPay; }
    public Double getPayAmount() { return payAmount; }
    public void setPayAmount(Double payAmount) { this.payAmount = payAmount; }
    public Long getBusinessId() { return businessId; }
    public void setBusinessId(Long businessId) { this.businessId = businessId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
} 