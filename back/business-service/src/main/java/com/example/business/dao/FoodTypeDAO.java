package com.example.business.dao;

import com.example.business.entity.FoodType;
import com.example.business.dto.FoodTypeDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodTypeDAO extends JpaRepository<FoodType, Long> {
    @Query("select new com.example.business.dto.FoodTypeDTO(f.id, f.name, f.img) from FoodType f")
    List<FoodTypeDTO> findAllDTO();
} 