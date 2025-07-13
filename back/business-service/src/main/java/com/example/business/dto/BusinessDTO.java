package com.example.business.dto;

public class BusinessDTO {
    private Long id;
    private String description;
    private String name;
    private Double deliveryFees;
    private String image;
    private Double miniDeliveryFee;
    private Integer monthSold;
    private Double score;
    // getter/setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getDeliveryFees() { return deliveryFees; }
    public void setDeliveryFees(Double deliveryFees) { this.deliveryFees = deliveryFees; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public Double getMiniDeliveryFee() { return miniDeliveryFee; }
    public void setMiniDeliveryFee(Double miniDeliveryFee) { this.miniDeliveryFee = miniDeliveryFee; }
    public Integer getMonthSold() { return monthSold; }
    public void setMonthSold(Integer monthSold) { this.monthSold = monthSold; }
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
} 