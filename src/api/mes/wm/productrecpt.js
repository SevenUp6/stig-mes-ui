import request from '@/utils/request'

// 查询产品入库录列表
export function listProductrecpt(query) {
  return request({
    url: '/mes/wm/productrecpt/list',
    method: 'get',
    params: query
  })
}

// 查询产品入库录详细
export function getProductrecpt(recptId) {
  return request({
    url: '/mes/wm/productrecpt/' + recptId,
    method: 'get'
  })
}

// 新增产品入库录
export function addProductrecpt(data) {
  return request({
    url: '/mes/wm/productrecpt',
    method: 'post',
    data: data
  })
}

// 修改产品入库录
export function updateProductrecpt(data) {
  return request({
    url: '/mes/wm/productrecpt',
    method: 'put',
    data: data
  })
}

// 删除产品入库录
export function delProductrecpt(recptId) {
  return request({
    url: '/mes/wm/productrecpt/' + recptId,
    method: 'delete'
  })
}

//执行入库
export function execute(recptId) {
  return request({
    url: '/mes/wm/productrecpt/' + recptId,
    method: 'put'
  })
}
