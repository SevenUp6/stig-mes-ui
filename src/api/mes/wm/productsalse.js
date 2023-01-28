import request from '@/utils/request'

// 查询销售出库单列表
export function listProductsalse(query) {
  return request({
    url: '/mes/wm/productsalse/list',
    method: 'get',
    params: query
  })
}

// 查询销售出库单详细
export function getProductsalse(salseId) {
  return request({
    url: '/mes/wm/productsalse/' + salseId,
    method: 'get'
  })
}

// 新增销售出库单
export function addProductsalse(data) {
  return request({
    url: '/mes/wm/productsalse',
    method: 'post',
    data: data
  })
}

// 修改销售出库单
export function updateProductsalse(data) {
  return request({
    url: '/mes/wm/productsalse',
    method: 'put',
    data: data
  })
}

// 删除销售出库单
export function delProductsalse(salseId) {
  return request({
    url: '/mes/wm/productsalse/' + salseId,
    method: 'delete'
  })
}

//执行出库
export function execute(salseId) {
  return request({
    url: '/mes/wm/productsalse/' + salseId,
    method: 'put'
  })
}
