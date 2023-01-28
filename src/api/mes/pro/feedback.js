import request from '@/utils/request'

// 查询生产报工记录列表
export function listFeedback(query) {
  return request({
    url: '/mes/pro/feedback/list',
    method: 'get',
    params: query
  })
}

// 查询生产报工记录详细
export function getFeedback(recordId) {
  return request({
    url: '/mes/pro/feedback/' + recordId,
    method: 'get'
  })
}

// 新增生产报工记录
export function addFeedback(data) {
  return request({
    url: '/mes/pro/feedback',
    method: 'post',
    data: data
  })
}

// 修改生产报工记录
export function updateFeedback(data) {
  return request({
    url: '/mes/pro/feedback',
    method: 'put',
    data: data
  })
}

// 删除生产报工记录
export function delFeedback(recordId) {
  return request({
    url: '/mes/pro/feedback/' + recordId,
    method: 'delete'
  })
}

export function execute(recordId){
  return request({
    url: '/mes/pro/feedback/'+recordId,
    method: 'put'
  })
}
