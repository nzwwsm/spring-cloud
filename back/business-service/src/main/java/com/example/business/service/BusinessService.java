package com.example.business.service;

import com.example.business.dao.BusinessDAO;
import com.example.business.entity.Business;
import com.example.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// 工具类
class ImageUtil {
    public static String imageToBase64(String imageFileName) {
        try (java.io.InputStream is = new org.springframework.core.io.ClassPathResource("image/" + imageFileName).getInputStream()) {
            byte[] bytes = is.readAllBytes();
            String base64 = java.util.Base64.getEncoder().encodeToString(bytes);
            String type = "png";
            if (imageFileName.endsWith(".jpg") || imageFileName.endsWith(".jpeg")) {
                type = "jpeg";
            }
            return "data:image/" + type + ";base64," + base64;
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
}

@Service
public class BusinessService {
    @Autowired
    private BusinessDAO businessDAO;

    public Result getBusinessById(Long id) {
        Business business = businessDAO.findById(id).orElse(null);
        return business != null ? Result.success(business) : Result.error("商家不存在");
    }

    public Result list() {
        return Result.success(businessDAO.findAll().stream().map(b -> {
            com.example.business.dto.BusinessDTO dto = new com.example.business.dto.BusinessDTO();
            dto.setId(b.getId());
            dto.setDescription(b.getBusinessDescription());
            dto.setName(b.getName());
            dto.setDeliveryFees(b.getDeliveryFees());
            // 图片转base64
            dto.setImage(ImageUtil.imageToBase64(b.getImage()));
            dto.setMiniDeliveryFee(b.getMiniDeliveryFee());
            dto.setMonthSold(b.getMonthSold());
            dto.setScore(b.getScore());
            return dto;
        }).toList());
    }
} 