import request from '@/utils/request'

// 查询生产领料单头列表
export function listIssueheader(query) {
  return request({
    url: '/mes/wm/issueheader/list',
    method: 'get',
    params: query
  })
}

// 查询生产领料单头详细
export function getIssueheader(issueId) {
  return request({
    url: '/mes/wm/issueheader/' + issueId,
    method: 'get'
  })
}

// 新增生产领料单头
export function addIssueheader(data) {
  return request({
    url: '/mes/wm/issueheader',
    method: 'post',
    data: data
  })
}

// 修改生产领料单头
export function updateIssueheader(data) {
  return request({
    url: '/mes/wm/issueheader',
    method: 'put',
    data: data
  })
}

// 删除生产领料单头
export function delIssueheader(issueId) {
  return request({
    url: '/mes/wm/issueheader/' + issueId,
    method: 'delete'
  })
}

//执行出库
export function execute(issueId) {
  return request({
    url: '/mes/wm/issueheader/' + issueId,
    method: 'put'
  })
}