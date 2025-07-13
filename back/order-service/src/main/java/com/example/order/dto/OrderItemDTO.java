package com.example.order.dto;

public class OrderItemDTO {
    private Long id;
    private Integer quanity;
    private Double commodityPrice;
    private String productName;
    private String image;
    private Long commodityId;
    // getter/setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getQuanity() { return quanity; }
    public void setQuanity(Integer quanity) { this.quanity = quanity; }
    public Double getCommodityPrice() { return commodityPrice; }
    public void setCommodityPrice(Double commodityPrice) { this.commodityPrice = commodityPrice; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public Long getCommodityId() { return commodityId; }
    public void setCommodityId(Long commodityId) { this.commodityId = commodityId; }
} 