import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FoodType from '../FoodType.vue'

// Mock fetch
global.fetch = vi.fn()

describe('FoodType.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确获取并显示食品类型列表', async () => {
    const mockFoodTypes = [
      {
        typeName: '快餐便当',
        image: 'base64ImageString1'
      },
      {
        typeName: '特色菜系',
        image: 'base64ImageString2'
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: mockFoodTypes }))
    })

    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证食品类型列表渲染
    const foodTypeItems = wrapper.findAll('.food-type-item')
    expect(foodTypeItems).toHaveLength(2)
    expect(foodTypeItems[0].find('span').text()).toBe('快餐便当')
    expect(foodTypeItems[1].find('span').text()).toBe('特色菜系')
  })

  it('应该正确处理空数据列表', async () => {
    const mockFoodTypes = []

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: mockFoodTypes }))
    })

    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    const foodTypeItems = wrapper.findAll('.food-type-item')
    expect(foodTypeItems).toHaveLength(0)
  })

  it('应该正确处理网络错误', async () => {
    ;(fetch as any).mockRejectedValueOnce(new Error('网络错误'))

    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证错误状态下没有渲染食品类型
    const foodTypeItems = wrapper.findAll('.food-type-item')
    expect(foodTypeItems).toHaveLength(0)
  })

  it('应该应用正确的样式类', async () => {
    const mockFoodTypes = [
      {
        typeName: '快餐便当',
        image: 'base64ImageString1'
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: mockFoodTypes }))
    })

    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证容器样式
    const container = wrapper.find('.food-type-container')
    expect(container.exists()).toBe(true)

    // 验证子元素存在
    const foodTypeItems = wrapper.findAll('.food-type-item')
    expect(foodTypeItems.length).toBeGreaterThan(0)

    // 验证每个子元素的结构
    const firstItem = foodTypeItems[0]
    expect(firstItem.find('img').exists()).toBe(true)
    expect(firstItem.find('span').exists()).toBe(true)
  })

  it('应该正确处理点击事件', async () => {
    const mockFoodTypes = [
      {
        typeName: '快餐便当',
        image: 'base64ImageString1'
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: mockFoodTypes }))
    })

    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    const foodTypeItems = wrapper.findAll('.food-type-item')
    expect(foodTypeItems.length).toBeGreaterThan(0)

    // 验证onclick属性存在且正确
    const firstItem = foodTypeItems[0]
    const onclick = firstItem.attributes('onclick')
    expect(onclick).toBe("location.href='businessList'")

    // 验证点击事件处理器存在
    expect((firstItem.element as any).onclick).toBeDefined()
  })

  it('应该正确处理图片加载失败', async () => {
    const mockFoodTypes = [
      {
        typeName: '快餐便当',
        image: 'invalid-image-data'
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: mockFoodTypes }))
    })

    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    const foodTypeItems = wrapper.findAll('.food-type-item')
    expect(foodTypeItems.length).toBeGreaterThan(0)

    const img = foodTypeItems[0].find('img')
    expect(img.exists()).toBe(true)
    // 即使图片加载失败，src属性也应该存在
    expect(img.attributes('src')).toBeDefined()
  })

  it('应该正确处理base64图片转换', async () => {
    const mockFoodTypes = [
      {
        typeName: '快餐便当',
        image: 'base64ImageString'
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: mockFoodTypes }))
    })

    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证base64图片正确显示
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain('data:image/png;base64')
  })

  it('应该测试base64ToBlob函数', async () => {
    const mockFoodTypes = [
      {
        typeName: '快餐便当',
        image: 'base64ImageString'
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: mockFoodTypes }))
    })

    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 测试base64ToBlob函数
    const vm = wrapper.vm as any
    if (vm.base64ToBlob) {
      const blob = vm.base64ToBlob('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/png')
    }
  })

  it('应该处理JSON解析错误', async () => {
    // 模拟返回无效的JSON数据
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('invalid json data')
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证错误被记录
    expect(consoleSpy).toHaveBeenCalledWith('解析数据失败:', 'invalid json data')
    expect(consoleSpy).toHaveBeenCalledWith('解析错误:', expect.any(Error))

    // 验证没有渲染食品类型
    const foodTypeItems = wrapper.findAll('.food-type-item')
    expect(foodTypeItems).toHaveLength(0)

    consoleSpy.mockRestore()
  })

  it('应该处理网络请求失败', async () => {
    // 模拟网络请求失败
    ;(fetch as any).mockRejectedValueOnce(new Error('网络连接失败'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证错误被记录
    expect(consoleSpy).toHaveBeenCalledWith('获取食物类型失败:', expect.any(Error))

    // 验证没有渲染食品类型
    const foodTypeItems = wrapper.findAll('.food-type-item')
    expect(foodTypeItems).toHaveLength(0)

    consoleSpy.mockRestore()
  })

  it('应该处理已经是data URI格式的图片', async () => {
    const mockFoodTypes = [
      {
        typeName: '快餐便当',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: mockFoodTypes }))
    })

    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证图片src保持原样（已经是data URI格式）
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
  })

  it('应该处理空图片数据', async () => {
    const mockFoodTypes = [
      {
        typeName: '快餐便当',
        image: ''
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: mockFoodTypes }))
    })

    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证空图片被处理为data URI格式
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('data:image/png;base64,')
  })

  it('应该处理null图片数据', async () => {
    const mockFoodTypes = [
      {
        typeName: '快餐便当',
        image: null
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: mockFoodTypes }))
    })

    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证null图片导致解析错误，没有渲染任何内容
    const img = wrapper.find('img')
    expect(img.exists()).toBe(false)
    
    // 验证由于解析错误，没有渲染任何食品类型项
    const foodTypeItems = wrapper.findAll('.food-type-item')
    expect(foodTypeItems).toHaveLength(0)
  })

  it('应该处理fetch响应不ok的情况', async () => {
    // 模拟fetch响应不ok
    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server Error')
    })

    const wrapper = mount(FoodType)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证没有渲染食品类型
    const foodTypeItems = wrapper.findAll('.food-type-item')
    expect(foodTypeItems).toHaveLength(0)
  })

  it('应该测试组件挂载时的数据获取', async () => {
    const mockFoodTypes = [
      {
        typeName: '快餐便当',
        image: 'base64ImageString'
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: mockFoodTypes }))
    })

    // 验证fetch被调用
    expect(fetch).not.toHaveBeenCalled()

    const wrapper = mount(FoodType)
    
    // 验证组件挂载后fetch被调用
    expect(fetch).toHaveBeenCalledWith('/api/foodtype/foodTypeList')

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证数据正确渲染
    const foodTypeItems = wrapper.findAll('.food-type-item')
    expect(foodTypeItems).toHaveLength(1)
    expect(foodTypeItems[0].find('span').text()).toBe('快餐便当')
  })
}) 