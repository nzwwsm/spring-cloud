import { describe, it, expect } from 'vitest'
import * as configurationApi from '../configuration'
import { Configuration } from '../configuration'

describe('configuration api', () => {
  it('configuration api 应该导出对象', () => {
    expect(typeof configurationApi).toBe('object')
  })
})

describe('配置测试', () => {
  it('应该正确设置基本配置', () => {
    const config = new Configuration({
      basePath: 'http://test-api.example.com',
      accessToken: 'test-token'
    })
    expect(config.basePath).toBe('http://test-api.example.com')
    expect(config.accessToken).toBe('test-token')
  })

  it('应该正确设置认证配置', () => {
    const config = new Configuration({
      username: 'test',
      password: 'test123'
    })
    expect(config.username).toBe('test')
    expect(config.password).toBe('test123')
  })

  it('应该正确设置API密钥配置', () => {
    const config = new Configuration({
      apiKey: 'test-api-key'
    })
    expect(config.apiKey).toBe('test-api-key')
  })

  it('应该使用默认配置', () => {
    const config = new Configuration()
    expect(config.basePath).toBeUndefined()
    expect(config.apiKey).toBeUndefined()
  })

  it('应该正确检查JSON MIME类型', () => {
    const config = new Configuration()
    expect(config.isJsonMime('application/json')).toBe(true)
    expect(config.isJsonMime('application/json; charset=UTF8')).toBe(true)
    expect(config.isJsonMime('text/plain')).toBe(false)
  })
}) 