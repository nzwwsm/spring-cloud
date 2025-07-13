package com.example.common.utils;

import java.lang.reflect.Field;

public class UpdateTool {
    public static void copyNullProperties(Object source, Object target) {
        if (source == null || target == null) return;
        Class<?> clazz = source.getClass();
        Field[] fields = clazz.getDeclaredFields();
        for (Field field : fields) {
            field.setAccessible(true);
            try {
                Object value = field.get(target);
                if (value == null) {
                    field.set(target, field.get(source));
                }
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }
        }
    }
} 