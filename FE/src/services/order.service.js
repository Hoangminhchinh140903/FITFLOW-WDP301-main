import {
  cancelMySaleOrderRequest,
  checkoutRequest,
  createWalkInSaleOrderRequest,
  getGuestSaleOrderByIdRequest,
  getMySaleOrderByIdRequest,
  getMySaleOrdersRequest,
  guestCheckoutRequest,
  returnMySaleOrderRequest,
  cancelGuestSaleOrderRequest,
  returnGuestSaleOrderRequest,
} from '../api/order.api'

export const checkoutApi = async (payload) => {
  const response = await checkoutRequest(payload)
  return response.data
}

export const guestCheckoutApi = async (payload) => {
  const response = await guestCheckoutRequest(payload)
  return response.data
}

export const getMySaleOrdersApi = async (params = {}) => {
  const response = await getMySaleOrdersRequest(params)
  return response.data
}

export const getMySaleOrderByIdApi = async (id) => {
  const response = await getMySaleOrderByIdRequest(id)
  return response.data
}

export const cancelMySaleOrderApi = async (id, payload) => {
  const response = await cancelMySaleOrderRequest(id, payload)
  return response.data
}

export const returnMySaleOrderApi = async (id, payload) => {
  const response = await returnMySaleOrderRequest(id, payload)
  return response.data
}

export const getGuestSaleOrderByIdApi = async (id, token) => {
  const response = await getGuestSaleOrderByIdRequest(id, token)
  return response.data
}

export const cancelGuestSaleOrderApi = async (id, payload) => {
  const response = await cancelGuestSaleOrderRequest(id, payload)
  return response.data
}

export const returnGuestSaleOrderApi = async (id, payload) => {
  const response = await returnGuestSaleOrderRequest(id, payload)
  return response.data
}

export const createWalkInSaleOrderApi = async (payload) => {
  const response = await createWalkInSaleOrderRequest(payload)
  return response.data
}
