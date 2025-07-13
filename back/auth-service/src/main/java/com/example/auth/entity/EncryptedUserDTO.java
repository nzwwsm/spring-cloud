package com.example.auth.entity;

public class EncryptedUserDTO {
    private String username; // 加密后的Base64字符串
    private String password; // 加密后的Base64字符串
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
} 