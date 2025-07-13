import { describe, it, expect } from 'vitest'
import { BaseAPI, RequiredError } from '../base'
import { Configuration } from '../configuration'

describe('基础API测试', () => {
  it('BaseAPI应该正确初始化', () => {
    const config = new Configuration({
      basePath: 'http://test-api.example.com'
    })
    const api = new BaseAPI(config)
    expect(api.basePath).toBe('/api')
  })

  it('RequiredError应该包含正确的错误信息', () => {
    const error = new RequiredError('param', '参数是必需的')
    expect(error.name).toBe('RequiredError')
    expect(error.message).toBe('参数是必需的')
  })

  it('BaseAPI应该使用默认配置', () => {
    const api = new BaseAPI()
    expect(api.basePath).toBe('/api')
  })

  it('BaseAPI应该正确处理自定义配置', () => {
    const config = new Configuration({
      basePath: 'http://test-api.example.com',
      accessToken: 'test-token',
      username: 'test',
      password: 'test123'
    })
    const api = new BaseAPI(config)
    expect(api.basePath).toBe('/api')
  })
}) 