import { describe, it, expect } from 'vitest'
import * as commonApi from '../common'
import { 
  assertParamExists, 
  setApiKeyToObject, 
  setBasicAuthToObject,
  setBearerAuthToObject,
  setOAuthToObject,
  setSearchParams,
  serializeDataIfNeeded,
  toPathString
} from '../common'
import { Configuration } from '../configuration'

describe('common api', () => {
  it('common api 应该导出对象', () => {
    expect(commonApi).toBeDefined()
  })
})

describe('通用工具函数测试', () => {
  it('assertParamExists应该正确验证参数', () => {
    expect(() => assertParamExists('getCommodityList', 'id', undefined)).toThrow()
    expect(() => assertParamExists('getCommodityList', 'id', 1)).not.toThrow()
  })

  it('setSearchParams应该正确设置查询参数', () => {
    const url = new URL('http://example.com')
    const params = { name: 'test', age: 18 }
    setSearchParams(url, params)
    expect(url.search).toBe('?name=test&age=18')
  })

  it('setSearchParams应该正确处理多个参数对象', () => {
    const url = new URL('http://example.com')
    const params1 = { name: 'test' }
    const params2 = { age: 18 }
    setSearchParams(url, params1, params2)
    expect(url.search).toBe('?name=test&age=18')
  })

  it('setSearchParams应该正确处理嵌套对象', () => {
    const url = new URL('http://example.com')
    const params = { 
      user: { 
        name: 'test',
        address: { city: 'beijing' }
      }
    }
    setSearchParams(url, params)
    expect(url.search).toBe('?user.name=test&user.address.city=beijing')
  })

  it('serializeDataIfNeeded应该正确序列化数据', () => {
    const data = { name: 'test', age: 18 }
    const result = serializeDataIfNeeded(data, { headers: { 'Content-Type': 'application/json' } })
    expect(result).toBe(JSON.stringify(data))
  })

  it('toPathString应该正确返回URL路径', () => {
    const url = new URL('http://example.com/path?query=1#hash')
    const result = toPathString(url)
    expect(result).toBe('/path?query=1#hash')
  })

  it('setApiKeyToObject应该正确设置API密钥', async () => {
    const obj: Record<string, string> = {}
    const config = new Configuration({ apiKey: 'test-key' })
    await setApiKeyToObject(obj, 'apiKey', config)
    expect(obj['apiKey']).toBe('test-key')
  })

  it('setBasicAuthToObject应该正确设置基本认证', () => {
    const obj: Record<string, any> = {}
    const config = new Configuration({ username: 'test', password: 'test123' })
    setBasicAuthToObject(obj, config)
    expect(obj['auth']).toEqual({ username: 'test', password: 'test123' })
  })

  it('setBearerAuthToObject应该正确设置Bearer认证', async () => {
    const obj: Record<string, any> = {}
    const config = new Configuration({ accessToken: 'test-token' })
    await setBearerAuthToObject(obj, config)
    expect(obj['Authorization']).toBe('Bearer test-token')
  })

  it('setOAuthToObject应该正确设置OAuth认证', async () => {
    const obj: Record<string, any> = {}
    const config = new Configuration({ accessToken: 'test-token' })
    await setOAuthToObject(obj, 'test', ['read', 'write'], config)
    expect(obj['Authorization']).toBe('Bearer test-token')
  })
}) 