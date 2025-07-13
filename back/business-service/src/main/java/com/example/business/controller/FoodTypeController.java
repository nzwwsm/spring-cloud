package com.example.business.controller;

import com.example.business.service.FoodTypeService;
import com.example.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/foodtype")
public class FoodTypeController {
    @Autowired
    private FoodTypeService foodTypeService;

    @GetMapping("/foodTypeList")
    public Result getFoodTypeList() {
        return foodTypeService.getFoodTypeList();
    }
} 