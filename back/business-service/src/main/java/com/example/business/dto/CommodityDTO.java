package com.example.business.dto;

public class CommodityDTO {
    private Long id;
    private String name;
    private String description;
    private String img;
    private Double price;
    private Long businessId;
    private Long foodTypeId;
    // getter/setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Long getBusinessId() { return businessId; }
    public void setBusinessId(Long businessId) { this.businessId = businessId; }
    public Long getFoodTypeId() { return foodTypeId; }
    public void setFoodTypeId(Long foodTypeId) { this.foodTypeId = foodTypeId; }
} 