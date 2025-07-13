package com.example.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.http.HttpMethod;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeExchange(exchange -> exchange
                
                // 其它全部放行
                .pathMatchers(
                    "/auth/**",
                    "/user/**",
                    "/business/**",
                    "/commodity/**",
                    "/foodtype/**",
                    "/order/**",
                    "/actuator/**"
                ).permitAll()
                .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyExchange().permitAll()
            );
        return http.build();
    }
} 