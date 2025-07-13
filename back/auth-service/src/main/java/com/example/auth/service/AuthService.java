package com.example.auth.service;

import com.example.common.utils.RsaKeyTool;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;
import java.security.KeyPair;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.auth.service.UserClient;
import com.example.common.Result;

@Service
public class AuthService {
    private static final String RSA_KEY_FILE_NAME = "demo-app-rsa.key";
    private final KeyPair keyPair;

    @Autowired
    private UserClient userClient;

    public AuthService() throws Exception {
        this.keyPair = RsaKeyTool.getOrCreateKeyPair(RSA_KEY_FILE_NAME);
    }

    public RSAPublicKey getPublicKey() {
        return (RSAPublicKey) this.keyPair.getPublic();
    }

    public JWKSet jwkSet() {
        var rsaKey = new RSAKey.Builder(getPublicKey()).privateKey(this.keyPair.getPrivate()).build();
        return new JWKSet(rsaKey);
    }

    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableJWKSet<>(jwkSet()));
    }

    public String encodeJwt(JwtClaimsSet claims) {
        return this.jwtEncoder().encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public String login(String username, String password) {
        // 远程调用 user-service 校验用户名密码
        Result userResult = userClient.getUserByUsername(username);
        if (userResult == null || userResult.getData() == null) {
            return null; // 用户不存在
        }
        // 假设 userResult.getData() 是 Map，包含 password 字段
        Object data = userResult.getData();
        String realPassword = null;
        if (data instanceof java.util.Map) {
            realPassword = (String) ((java.util.Map) data).get("password");
        }
        if (realPassword == null || !realPassword.equals(password)) {
            return null; // 密码错误
        }
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("my-app")
                .subject(username)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();
        return encodeJwt(claims);
    }

    public KeyPair getKeyPair() {
        return this.keyPair;
    }
} 