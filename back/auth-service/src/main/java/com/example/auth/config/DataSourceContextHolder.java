package com.example.auth.config;

public class DataSourceContextHolder {
    private static final ThreadLocal<String> contextHolder = new ThreadLocal<>();
    public static void set(String key) { contextHolder.set(key); }
    public static String get() { return contextHolder.get(); }
    public static void clear() { contextHolder.remove(); }
} 