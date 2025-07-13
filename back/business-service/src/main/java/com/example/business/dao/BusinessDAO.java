package com.example.business.dao;

import com.example.business.entity.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessDAO extends JpaRepository<Business, Long> {
} 