package com.example.order.dao;

import com.example.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemDAO extends JpaRepository<OrderItem, Long> {
    // 新增：通过 orderTableId 查询订单明细
    List<OrderItem> findByOrderTableId(Long orderTableId);
} 