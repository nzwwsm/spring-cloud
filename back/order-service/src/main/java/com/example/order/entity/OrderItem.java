package com.example.order.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "order_item")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer quanity;
    private Long commodityId;
    private Long orderTableId;

    // getter/setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getQuanity() { return quanity; }
    public void setQuanity(Integer quanity) { this.quanity = quanity; }
    public Long getCommodityId() { return commodityId; }
    public void setCommodityId(Long commodityId) { this.commodityId = commodityId; }
    public Long getOrderTableId() { return orderTableId; }
    public void setOrderTableId(Long orderTableId) { this.orderTableId = orderTableId; }
} 