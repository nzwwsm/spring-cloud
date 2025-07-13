package com.example.business.service;

import com.example.business.dao.CommodityDAO;
import com.example.business.entity.Commodity;
import com.example.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;

@Service
public class CommodityService {
    @Autowired
    private CommodityDAO commodityDAO;

    private String getImageBase64(String fileName) {
        try {
            byte[] bytes = Files.readAllBytes(Paths.get("src/main/resources/image/" + fileName));
            return Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            return null;
        }
    }

    public Result getCommodityById(Long id) {
        Commodity commodity = commodityDAO.findById(id).orElse(null);
        if (commodity != null && commodity.getImage() != null && !commodity.getImage().startsWith("data:image")) {
            String base64 = getImageBase64(commodity.getImage());
            if (base64 != null) {
                commodity.setImage("data:image/png;base64," + base64);
            }
        }
        return commodity != null ? Result.success(commodity) : Result.error("商品不存在");
    }

    // 新增：通过 businessId 查询商品列表
    public Result getCommoditiesByBusinessId(Long businessId) {
        List<Commodity> commodities = commodityDAO.findByBusinessId(businessId);
        // 保证所有商品图片字段格式一致
        for (Commodity commodity : commodities) {
            if (commodity.getImage() != null && !commodity.getImage().startsWith("data:image")) {
                String base64 = getImageBase64(commodity.getImage());
                if (base64 != null) {
                    commodity.setImage("data:image/png;base64," + base64);
                }
            }
        }
        return Result.success(commodities);
    }
} 