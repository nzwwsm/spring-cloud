package com.example.business.controller;

import com.example.business.service.CommodityService;
import com.example.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/commodity")
public class CommodityController {
    @Autowired
    private CommodityService commodityService;

    @GetMapping("/{id}")
    public Result getCommodityById(@PathVariable Long id) {
        return commodityService.getCommodityById(id);
    }

    // 新增：通过 businessId 获取该商家所有商品
    @GetMapping("/list/{businessId}")
    public Result getCommoditiesByBusinessId(@PathVariable Long businessId) {
        return commodityService.getCommoditiesByBusinessId(businessId);
    }
} 