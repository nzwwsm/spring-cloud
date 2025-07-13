@echo off
REM 启动所有微服务
start cmd /k "cd /d %~dp0order-service && mvnw spring-boot:run"
start cmd /k "cd /d %~dp0user-service && mvnw spring-boot:run"
start cmd /k "cd /d %~dp0gateway-service && mvnw spring-boot:run"
start cmd /k "cd /d %~dp0auth-service && mvnw spring-boot:run"
start cmd /k "cd /d %~dp0business-service && mvnw spring-boot:run" 