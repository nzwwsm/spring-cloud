package com.example.common.entity;

import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public class LogicEntity extends BaseEntity {
    // 可扩展逻辑删除、通用字段等
} 