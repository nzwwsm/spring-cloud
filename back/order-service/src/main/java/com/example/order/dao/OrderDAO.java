package com.example.order.dao;

import com.example.order.entity.OrderTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderDAO extends JpaRepository<OrderTable, Long> {
    // 可添加自定义查询方法
    // 查询指定用户的已支付订单
    java.util.List<OrderTable> findByUserIdAndIsPay(Long userId, Boolean isPay);
} 