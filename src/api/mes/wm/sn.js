import request from '@/utils/request'

// 查询SN码列表
export function list(query) {
  return request({
    url: '/mes/wm/sn/list',
    method: 'get',
    params: query
  })
}

export function listSn(query) {
  return request({
    url: '/mes/wm/sn/listSn',
    method: 'get',
    params: query
  })
}

// 查询SN码详细
export function getSn(snId) {
  return request({
    url: '/mes/wm/sn/' + snId,
    method: 'get'
  })
}

// 新增SN码
export function addSn(data) {
  return request({
    url: '/mes/wm/sn',
    method: 'post',
    data: data
  })
}

// 修改SN码
export function updateSn(data) {
  return request({
    url: '/mes/wm/sn',
    method: 'put',
    data: data
  })
}

// 删除SN码
export function delSn(snId) {
  return request({
    url: '/mes/wm/sn/' + snId,
    method: 'delete'
  })
}
