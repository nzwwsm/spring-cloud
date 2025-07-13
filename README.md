# 项目说明

本项目为 Spring Cloud 微服务架构示例，包含如下服务：
- order-service
- user-service
- gateway-service
- auth-service
- business-service
- common（公共依赖）

## 启动方式

1. 使用 `docker-compose up -d` 启动依赖服务（MySQL、Redis、Nginx 等）。
2. 进入各微服务目录，使用 `mvn spring-boot:run` 启动服务，或运行 `start-all.bat` 一键启动。

## 目录结构

- order-service/ 订单服务
- user-service/ 用户服务
- gateway-service/ 网关服务
- auth-service/ 认证服务
- business-service/ 业务服务
- common/ 公共依赖 