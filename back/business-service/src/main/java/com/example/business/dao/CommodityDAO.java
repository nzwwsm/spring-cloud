package com.example.business.dao;

import com.example.business.entity.Commodity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommodityDAO extends JpaRepository<Commodity, Long> {
    // 新增：根据 businessId 查询商品列表
    List<Commodity> findByBusinessId(Long businessId);
} 