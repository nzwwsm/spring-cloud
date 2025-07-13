package com.example.common;

import com.example.common.exception.BusinessException;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.Serializable;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class LogicController<S, D, T, ID extends Serializable> {
    protected S service;
    protected S getService() {
        return service;
    }
    public LogicController(S ls) {
        this.service = ls;
    }
    // 省略具体实现，业务模块可继承并实现
} 