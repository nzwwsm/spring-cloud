package com.example.business.controller;

import com.example.business.service.BusinessService;
import com.example.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/business")
public class BusinessController {
    @Autowired
    private BusinessService businessService;

    @GetMapping("/{id}")
    public Result getBusinessById(@PathVariable Long id) {
        return businessService.getBusinessById(id);
    }

    @GetMapping("/list")
    public Result getBusinessList() {
        return businessService.list();
    }
} 