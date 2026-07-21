import axiosClient from '../config/axios'

export const listReturnPoliciesRequest = (params) => {
  return axiosClient.get('/return-policies', { params })
}

export const getReturnPolicyRequest = (id) => {
  return axiosClient.get(`/return-policies/${id}`)
}

export const createReturnPolicyRequest = (payload) => {
  return axiosClient.post('/return-policies', payload)
}

export const updateReturnPolicyRequest = (id, payload) => {
  return axiosClient.put(`/return-policies/${id}`, payload)
}

export const deleteReturnPolicyRequest = (id) => {
  return axiosClient.delete(`/return-policies/${id}`)
}
