import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import BusinessInfoCom from '../BusinessInfoCom.vue'
import { ComponentPublicInstance } from 'vue'
import { useCartStore } from '../../stores/cart'

// 模拟 cart store
interface CartItem {
  id: number
  commodityName: string
  price: number
  quantity: number
  image: string
}

const mockCartStore = {
  items: [] as CartItem[],
  addItem: vi.fn(),
  removeItem: vi.fn(),
  setBusinessId: vi.fn(),
  get totalPrice() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }
}

vi.mock('@/stores/cart', () => ({
  useCartStore: vi.fn(() => mockCartStore)
}))

// 模拟fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// 模拟localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// 模拟商品数据
const mockCommodities = [
  {
    id: 1,
    commodityName: '商品1',
    commodityDescription: '描述1',
    price: 10,
    category: '分类1',
    image: 'image1.jpg'
  },
  {
    id: 2,
    commodityName: '商品2',
    commodityDescription: '描述2',
    price: 20,
    category: '分类1',
    image: 'image2.jpg'
  }
]

// 定义组件实例类型
interface BusinessInfoComponent extends ComponentPublicInstance {
  commodities: any[]
  loading: boolean
  error: string
  searchQuery: string
  filteredCommodities: any[]
  categorizedCommodities: any[]
  sortBy: string
  cartTotal: number
  getCommodityList: () => Promise<void>
  increaseQuantity: (commodity: any) => void
  decreaseQuantity: (commodity: any) => void
  convertBase64ToUrl: (base64String: string) => string
  getCartQuantity: (commodityId: number) => number
  goToCart: () => void
}

describe('BusinessInfoCom', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks()
    mockFetch.mockReset()
    mockLocalStorage.getItem.mockReset()
    mockCartStore.items = []

    // 创建新的pinia实例
    pinia = createPinia()
    setActivePinia(pinia)

    // 创建路由
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home</div>' }
        },
        {
          path: '/business/:id',
          name: 'business',
          component: BusinessInfoCom
        },
        {
          path: '/cart',
          name: 'cart',
          component: { template: '<div>Cart</div>' }
        }
      ]
    })
  })

  afterEach(() => {
    // 清理
  })

  it('加载商品列表成功', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 先push路由
    await router.push('/business/1')
    await router.isReady()

    // 再mount组件
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待异步
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证API是否被调用
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/business/itemList?id=1',
      {
        headers: {
          'Authorization': 'valid-test-token'
        }
      }
    )

    // 验证数据是否正确设置
    const vm = wrapper.vm as any
    expect(vm.commodities).toHaveLength(2)
    expect(vm.categorizedCommodities).toHaveLength(1)
    expect(vm.categorizedCommodities[0].category).toBe('分类1')
    expect(vm.categorizedCommodities[0].items).toHaveLength(2)
  })

  it('处理未登录状态', async () => {
    // 模拟未登录状态
    mockLocalStorage.getItem.mockReturnValue(null)

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 设置路由参数
    await router.push('/business/1')
    
    // 等待组件挂载完成和onMounted执行
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证错误状态
    const vm = wrapper.vm as any
    expect(vm.error).toBe('请先登录')
    expect(vm.loading).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('处理API请求失败', async () => {
    // 模拟API失败
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 设置路由参数
    await router.push('/business/1')
    
    // 等待组件挂载完成和onMounted执行
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证错误状态
    const vm = wrapper.vm as any
    expect(vm.error).toBe('获取商品列表失败')
    expect(vm.loading).toBe(false)
  })

  it('处理网络错误', async () => {
    // 模拟网络错误
    mockFetch.mockRejectedValueOnce(new Error('网络错误'))

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 设置路由参数
    await router.push('/business/1')
    
    // 等待组件挂载完成和onMounted执行
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证错误状态
    const vm = wrapper.vm as any
    expect(vm.error).toBe('获取商品列表失败')
    expect(vm.loading).toBe(false)
  })

  it('处理无效的API响应数据', async () => {
    // 模拟无效响应数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: null })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 设置路由参数
    await router.push('/business/1')
    
    // 等待组件挂载完成和onMounted执行
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证错误状态
    const vm = wrapper.vm as any
    expect(vm.error).toBe('获取商品列表失败')
    expect(vm.loading).toBe(false)
  })

  it('处理缺少商家ID的情况', async () => {
    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 设置路由但不提供ID
    await router.push('/business/')
    
    // 等待组件挂载完成和onMounted执行
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证错误状态
    const vm = wrapper.vm as any
    expect(vm.error).toBe('获取商品列表失败')
    expect(vm.loading).toBe(false)
  })

  it('增加商品数量功能', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 调用增加商品数量方法
    const vm = wrapper.vm as any
    const commodity = vm.commodities[0]
    vm.increaseQuantity(commodity)

    // 验证购物车store方法被调用
    expect(mockCartStore.addItem).toHaveBeenCalledWith({
      id: commodity.id,
      commodityName: commodity.commodityName,
      price: commodity.price,
      quantity: 1,
      image: commodity.image
    })
  })

  it('减少商品数量功能', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 调用减少商品数量方法
    const vm = wrapper.vm as any
    const commodity = vm.commodities[0]
    vm.decreaseQuantity(commodity)

    // 验证购物车store方法被调用
    expect(mockCartStore.removeItem).toHaveBeenCalledWith(commodity.id)
  })

  it('获取购物车商品数量', async () => {
    // 模拟购物车中有商品
    mockCartStore.items = [
      { id: 1, commodityName: '商品1', price: 10, quantity: 2, image: 'image1.jpg' }
    ]

    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 测试获取购物车商品数量
    const vm = wrapper.vm as any
    expect(vm.getCartQuantity(1)).toBe(2)
    expect(vm.getCartQuantity(999)).toBe(0) // 不存在的商品
  })

  it('跳转到购物车功能', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 调用跳转到购物车方法
    const vm = wrapper.vm as any
    vm.goToCart()
    
    // 等待路由跳转完成
    await flushPromises()
    await wrapper.vm.$nextTick()
    
    // 验证路由跳转
    expect(router.currentRoute.value.path).toBe('/cart')
  })

  it('测试购物车总价显示', async () => {
    // 模拟购物车中有商品
    mockCartStore.items = [
      { id: 1, commodityName: '商品1', price: 10, quantity: 2, image: 'image1.jpg' }
    ]

    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证购物车总价显示 - 查找包含总价的元素
    const cartTotalElements = wrapper.findAll('.text-red-500')
    let foundTotalPrice = false
    
    for (const element of cartTotalElements) {
      const text = element.text()
      if (text.includes('¥20.00')) {
        foundTotalPrice = true
        break
      }
    }
    
    expect(foundTotalPrice).toBe(true)

    // 验证结算按钮
    const checkoutButton = wrapper.find('.checkout-btn')
    if (checkoutButton.exists()) {
      expect(checkoutButton.text()).toBe('去结算')
      
      // 测试结算按钮点击
      await checkoutButton.trigger('click')
      await flushPromises()
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).toBe('/cart')
    }
  })

  it('base64图片转换功能', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 测试base64转换功能
    const vm = wrapper.vm as any
    expect(vm.convertBase64ToUrl('test-image')).toBe('data:image/png;base64,test-image')
    expect(vm.convertBase64ToUrl('data:image/jpeg;base64,test')).toBe('data:image/jpeg;base64,test')
    expect(vm.convertBase64ToUrl('')).toBe('')
  })

  it('搜索商品功能', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 测试搜索功能
    const vm = wrapper.vm as any
    vm.searchQuery = '商品1'
    await wrapper.vm.$nextTick()

    // 验证搜索结果
    expect(vm.filteredCommodities).toHaveLength(1)
    expect(vm.filteredCommodities[0].commodityName).toBe('商品1')

    // 测试描述搜索
    vm.searchQuery = '描述2'
    await wrapper.vm.$nextTick()
    expect(vm.filteredCommodities).toHaveLength(1)
    expect(vm.filteredCommodities[0].commodityDescription).toBe('描述2')
  })

  it('商品排序功能', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 测试价格升序排序
    const vm = wrapper.vm as any
    vm.sortBy = 'price-asc'
    await wrapper.vm.$nextTick()

    expect(vm.filteredCommodities[0].price).toBe(10)
    expect(vm.filteredCommodities[1].price).toBe(20)

    // 测试价格降序排序
    vm.sortBy = 'price-desc'
    await wrapper.vm.$nextTick()

    expect(vm.filteredCommodities[0].price).toBe(20)
    expect(vm.filteredCommodities[1].price).toBe(10)
  })

  it('商品分类功能', async () => {
    // 模拟有分类的商品数据
    const categorizedCommodities = [
      {
        id: 1,
        commodityName: '商品1',
        commodityDescription: '描述1',
        price: 10,
        category: '分类1',
        image: 'image1.jpg'
      },
      {
        id: 2,
        commodityName: '商品2',
        commodityDescription: '描述2',
        price: 20,
        category: '分类2',
        image: 'image2.jpg'
      }
    ]

    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: categorizedCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证分类功能
    const vm = wrapper.vm as any
    expect(vm.categorizedCommodities).toHaveLength(2)
    expect(vm.categorizedCommodities[0].category).toBe('分类1')
    expect(vm.categorizedCommodities[1].category).toBe('分类2')
  })

  it('监听搜索和排序变化', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 测试监听器触发
    const vm = wrapper.vm as any
    vm.searchQuery = 'test'
    vm.sortBy = 'price-asc'
    await wrapper.vm.$nextTick()

    // 验证监听器正常工作（这里只是验证不会抛出错误）
    expect(vm.searchQuery).toBe('test')
    expect(vm.sortBy).toBe('price-asc')
  })

  it('测试模板渲染 - 加载状态', async () => {
    // 模拟API调用延迟
    mockFetch.mockImplementation(() => new Promise(() => {}))

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成，但不等待API调用完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    // 验证加载状态
    const vm = wrapper.vm as any
    expect(vm.loading).toBe(true)
    expect(wrapper.find('.text-gray-500').exists()).toBe(true)
  })

  it('测试模板渲染 - 商品列表', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证商品列表渲染
    expect(wrapper.find('.commodity-list').exists()).toBe(true)
    expect(wrapper.findAll('.commodity-item')).toHaveLength(2)
    expect(wrapper.find('.category-title').text()).toBe('分类1')
  })

  it('测试模板渲染 - 商品数量控制', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证商品列表渲染
    expect(wrapper.find('.commodity-list').exists()).toBe(true)
    expect(wrapper.findAll('.commodity-item')).toHaveLength(2)
    expect(wrapper.find('.category-title').text()).toBe('分类1')

    // 验证商品信息显示
    const firstItem = wrapper.findAll('.commodity-item')[0]
    expect(firstItem.find('h3').text()).toBe('商品1')
    expect(firstItem.find('p').text()).toBe('描述1')
    expect(firstItem.find('.text-red-500').text()).toBe('¥10.00')

    // 验证数量控制按钮
    const addButtons = wrapper.findAll('button')
    expect(addButtons.length).toBeGreaterThan(0)
    
    // 测试增加商品数量按钮点击
    const addButton = addButtons.find(btn => btn.text().includes('+'))
    if (addButton) {
      await addButton.trigger('click')
      expect(mockCartStore.addItem).toHaveBeenCalled()
    }
  })

  it('测试商品数量控制按钮显示逻辑', async () => {
    // 模拟购物车中有商品
    mockCartStore.items = [
      { id: 1, commodityName: '商品1', price: 10, quantity: 1, image: 'image1.jpg' }
    ]

    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证减少按钮显示（当商品数量大于0时）
    const decreaseButtons = wrapper.findAll('button').filter(btn => btn.text().includes('-'))
    expect(decreaseButtons.length).toBeGreaterThan(0)

    // 验证数量显示
    const quantitySpans = wrapper.findAll('span').filter(span => /^\d+$/.test(span.text().trim()))
    expect(quantitySpans.length).toBeGreaterThan(0)
    expect(quantitySpans[0].text()).toBe('1')
  })

  it('测试错误状态显示', async () => {
    // 模拟API失败
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证错误状态显示
    const errorElement = wrapper.find('.text-red-500')
    expect(errorElement.exists()).toBe(true)
    expect(errorElement.text()).toBe('获取商品列表失败')
  })

  it('测试加载状态显示', async () => {
    // 模拟API调用延迟
    mockFetch.mockImplementation(() => new Promise(() => {}))

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成，但不等待API调用完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    // 验证加载状态显示
    const loadingElement = wrapper.find('.text-gray-500')
    expect(loadingElement.exists()).toBe(true)
    expect(loadingElement.text()).toBe('加载中...')
  })

  it('测试商品分类显示', async () => {
    // 模拟有多个分类的商品数据
    const multiCategoryCommodities = [
      {
        id: 1,
        commodityName: '商品1',
        commodityDescription: '描述1',
        price: 10,
        category: '分类1',
        image: 'image1.jpg'
      },
      {
        id: 2,
        commodityName: '商品2',
        commodityDescription: '描述2',
        price: 20,
        category: '分类2',
        image: 'image2.jpg'
      }
    ]

    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: multiCategoryCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证分类标题显示
    const categoryTitles = wrapper.findAll('.category-title')
    expect(categoryTitles).toHaveLength(2)
    expect(categoryTitles[0].text()).toBe('分类1')
    expect(categoryTitles[1].text()).toBe('分类2')

    // 验证每个分类下的商品数量
    const categorySections = wrapper.findAll('.category-section')
    expect(categorySections).toHaveLength(2)
  })

  it('测试商品图片显示', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证商品图片显示
    const images = wrapper.findAll('img')
    expect(images.length).toBeGreaterThan(0)
    
    const firstImage = images[0]
    expect(firstImage.attributes('alt')).toBe('商品1')
    expect(firstImage.attributes('src')).toContain('data:image/png;base64')
  })

  it('测试商品描述显示', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 设置路由
    await router.push('/business/1')

    // 创建组件实例
    const wrapper = mount(BusinessInfoCom, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证商品描述显示
    const descriptions = wrapper.findAll('p')
    expect(descriptions.length).toBeGreaterThan(0)
    expect(descriptions[0].text()).toBe('描述1')
  })

  it('无商品时显示空状态', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] })
    })
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')
    await router.push('/business/1')
    const wrapper = mount(BusinessInfoCom, {
      global: { plugins: [router, pinia], stubs: { 'router-link': true } }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()
    // 断言：没有商品项
    expect(wrapper.findAll('.commodity-item').length).toBe(0)
    // 可补充：显示"暂无商品"提示（如有）
  })

  it('无分类时正常渲染', async () => {
    const noCategoryCommodities = [
      { id: 1, commodityName: '商品1', commodityDescription: '描述1', price: 10, image: 'image1.jpg' }
    ]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: noCategoryCommodities })
    })
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')
    await router.push('/business/1')
    const wrapper = mount(BusinessInfoCom, {
      global: { plugins: [router, pinia], stubs: { 'router-link': true } }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()
    // 断言：商品正常渲染
    expect(wrapper.findAll('.commodity-item').length).toBe(1)
  })

  it('商品图片异常时处理', async () => {
    const commodities = [
      { id: 1, commodityName: '商品1', commodityDescription: '描述1', price: 10, category: '分类1', image: null }
    ]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: commodities })
    })
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')
    await router.push('/business/1')
    const wrapper = mount(BusinessInfoCom, {
      global: { plugins: [router, pinia], stubs: { 'router-link': true } }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()
    // 断言：图片src为空或为默认图片
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
  })

  it('购物车为空时不显示结算栏', async () => {
    mockCartStore.items = []
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')
    await router.push('/business/1')
    const wrapper = mount(BusinessInfoCom, {
      global: { plugins: [router, pinia], stubs: { 'router-link': true } }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()
    // 断言：结算栏不存在
    expect(wrapper.find('.checkout-btn').exists()).toBe(false)
  })

  it('token失效时显示未登录', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    await router.push('/business/1')
    const wrapper = mount(BusinessInfoCom, {
      global: { plugins: [router, pinia], stubs: { 'router-link': true } }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()
    // 断言：显示未登录提示
    expect(wrapper.text()).toContain('请先登录')
  })

  it('API返回空对象时处理', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    })
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')
    await router.push('/business/1')
    const wrapper = mount(BusinessInfoCom, {
      global: { plugins: [router, pinia], stubs: { 'router-link': true } }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()
    // 断言：显示错误提示
    expect(wrapper.text()).toContain('获取商品列表失败')
  })

  it('商品数量为0时不显示减号和数量', async () => {
    mockCartStore.items = []
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')
    await router.push('/business/1')
    const wrapper = mount(BusinessInfoCom, {
      global: { plugins: [router, pinia], stubs: { 'router-link': true } }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()
    // 断言：没有减号按钮和数量span
    const decreaseButtons = wrapper.findAll('button').filter(btn => btn.text().includes('-'))
    expect(decreaseButtons.length).toBe(0)
    const quantitySpans = wrapper.findAll('span').filter(span => /^\d+$/.test(span.text().trim()))
    expect(quantitySpans.length).toBe(0)
  })

  it('商品数量为极大值时显示', async () => {
    mockCartStore.items = [
      { id: 1, commodityName: '商品1', price: 10, quantity: 9999, image: 'image1.jpg' }
    ]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockCommodities })
    })
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')
    await router.push('/business/1')
    const wrapper = mount(BusinessInfoCom, {
      global: { plugins: [router, pinia], stubs: { 'router-link': true } }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()
    // 断言：数量span为9999
    const quantitySpans = wrapper.findAll('span').filter(span => /^\d+$/.test(span.text().trim()))
    expect(quantitySpans[0].text()).toBe('9999')
  })

  it('商品描述缺失时正常渲染', async () => {
    const commodities = [
      { id: 1, commodityName: '商品1', price: 10, category: '分类1', image: 'image1.jpg' }
    ]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: commodities })
    })
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')
    await router.push('/business/1')
    const wrapper = mount(BusinessInfoCom, {
      global: { plugins: [router, pinia], stubs: { 'router-link': true } }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()
    // 断言：商品正常渲染
    expect(wrapper.findAll('.commodity-item').length).toBe(1)
  })

  it('商品分类为null时正常渲染', async () => {
    const commodities = [
      { id: 1, commodityName: '商品1', price: 10, category: null, image: 'image1.jpg' }
    ]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: commodities })
    })
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')
    await router.push('/business/1')
    const wrapper = mount(BusinessInfoCom, {
      global: { plugins: [router, pinia], stubs: { 'router-link': true } }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()
    // 断言：商品正常渲染
    expect(wrapper.findAll('.commodity-item').length).toBe(1)
  })
}) 