package com.example.common;

import java.io.Serializable;
import java.util.List;

public class LogicService<D, T, ID extends Serializable> {
    protected D dao;
    public LogicService(D lr) {
        this.dao = lr;
    }
    protected D getDAO() {
        return dao;
    }
    // 省略具体实现，业务模块可继承并实现
} 