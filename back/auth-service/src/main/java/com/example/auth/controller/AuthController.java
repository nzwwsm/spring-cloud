package com.example.auth.controller;

import com.example.auth.entity.EncryptedUserDTO;
import com.example.auth.service.AuthService;
import com.example.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Cipher;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @PostMapping("/login")
    public Result login(@RequestBody EncryptedUserDTO encryptedUserDTO) {
        try {
            // 1. 获取私钥
            KeyPair keyPair = authService.getKeyPair();
            PrivateKey privateKey = keyPair.getPrivate();
            // 2. 解密用户名和密码
            String decryptedUsername = rsaDecrypt(encryptedUserDTO.getUsername(), privateKey);
            String decryptedPassword = rsaDecrypt(encryptedUserDTO.getPassword(), privateKey);
            // 3. 校验用户名密码并生成token
            String token = authService.login(decryptedUsername, decryptedPassword);
            if (token == null) {
                return Result.error("用户名或密码错误");
            }
            return Result.success(token);
        } catch (Exception e) {
            return Result.error("登录失败: " + e.getMessage());
        }
    }

    // 工具方法：用私钥解密
    private String rsaDecrypt(String base64Encrypted, PrivateKey privateKey) throws Exception {
        byte[] encryptedBytes = Base64.getDecoder().decode(base64Encrypted);
        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
        return new String(decryptedBytes, java.nio.charset.StandardCharsets.UTF_8);
    }

    @GetMapping("/rsa-public-key")
    public Result getRsaPublicKey() {
        try {
            RSAPublicKey publicKey = authService.getPublicKey();
            String publicKeyBase64 = Base64.getEncoder().encodeToString(publicKey.getEncoded());
            Map<String, Object> result = new HashMap<>();
            result.put("publicKey", publicKeyBase64);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("获取RSA公钥失败: " + e.getMessage());
        }
    }

    @GetMapping("/jwk")
    public Map<String, Object> getJwk() throws Exception {
        return authService.jwkSet().toJSONObject();
    }

    /**
     * Redis 测试接口：设置并获取一个 key
     */
    @GetMapping("/redis-test")
    public Result redisTest(@RequestParam String key, @RequestParam String value) {
        stringRedisTemplate.opsForValue().set(key, value);
        String getValue = stringRedisTemplate.opsForValue().get(key);
        return Result.success("Redis写入值：" + getValue);
    }
} 