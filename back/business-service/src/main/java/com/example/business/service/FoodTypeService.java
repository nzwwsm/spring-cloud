package com.example.business.service;

import com.example.business.dao.FoodTypeDAO;
import com.example.business.dto.FoodTypeDTO;
import com.example.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.core.io.ClassPathResource;
import java.io.InputStream;
import java.util.Base64;

@Service
public class FoodTypeService {
    @Autowired
    private FoodTypeDAO foodTypeDAO;

    public Result getFoodTypeList() {
        List<FoodTypeDTO> list = foodTypeDAO.findAllDTO();
        for (FoodTypeDTO dto : list) {
            String imgFileName = dto.getImg();
            String base64Img = ImageUtil.imageToBase64(imgFileName);
            dto.setImg(base64Img);
        }
        return Result.success(list);
    }
}

// 工具类
class ImageUtil {
    public static String imageToBase64(String imageFileName) {
        try (InputStream is = new ClassPathResource("image/" + imageFileName).getInputStream()) {
            byte[] bytes = is.readAllBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
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