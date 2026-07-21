import {
  listReturnPoliciesRequest,
  getReturnPolicyRequest,
  createReturnPolicyRequest,
  updateReturnPolicyRequest,
  deleteReturnPolicyRequest,
} from '../api/return-policy.api'

export const listReturnPoliciesApi = async (params = {}) => {
  const response = await listReturnPoliciesRequest(params)
  return response.data
}

export const getReturnPolicyApi = async (id) => {
  const response = await getReturnPolicyRequest(id)
  return response.data
}

export const createReturnPolicyApi = async (payload) => {
  const response = await createReturnPolicyRequest(payload)
  return response.data
}

export const updateReturnPolicyApi = async (id, payload) => {
  const response = await updateReturnPolicyRequest(id, payload)
  return response.data
}

export const deleteReturnPolicyApi = async (id) => {
  const response = await deleteReturnPolicyRequest(id)
  return response.data
}
