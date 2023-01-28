import request from '@/utils/request'

// 查询产品销售退货行列表
export function listRtsalseline(query) {
  return request({
    url: '/mes/wm/rtsalseline/list',
    method: 'get',
    params: query
  })
}

// 查询产品销售退货行详细
export function getRtsalseline(lineId) {
  return request({
    url: '/mes/wm/rtsalseline/' + lineId,
    method: 'get'
  })
}

// 新增产品销售退货行
export function addRtsalseline(data) {
  return request({
    url: '/mes/wm/rtsalseline',
    method: 'post',
    data: data
  })
}

// 修改产品销售退货行
export function updateRtsalseline(data) {
  return request({
    url: '/mes/wm/rtsalseline',
    method: 'put',
    data: data
  })
}

// 删除产品销售退货行
export function delRtsalseline(lineId) {
  return request({
    url: '/mes/wm/rtsalseline/' + lineId,
    method: 'delete'
  })
}
