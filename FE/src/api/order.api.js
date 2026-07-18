import axiosClient from '../config/axios'

export const checkoutRequest = (payload) => axiosClient.post('/orders/checkout', payload)
export const guestCheckoutRequest = (payload) => axiosClient.post('/orders/guest-checkout', payload)
export const getMySaleOrdersRequest = (params) => axiosClient.get('/orders/my', { params })
export const getMySaleOrderByIdRequest = (id) => axiosClient.get(`/orders/my/${id}`)
export const cancelMySaleOrderRequest = (id, payload) => axiosClient.put(`/orders/my/${id}/cancel`, payload)

export const returnMySaleOrderRequest = (id, payload) => axiosClient.put(`/orders/my/${id}/return`, payload)
export const getGuestSaleOrderByIdRequest = (id, token) =>
  axiosClient.get(`/orders/guest/${id}`, {
    params: { token },
    headers: token ? { 'x-guest-token': token } : undefined,
    skipAuthRedirect: true,
  })

export const cancelGuestSaleOrderRequest = (id, { token, email, reason } = {}) =>
  axiosClient.put(
    `/orders/guest/${id}/cancel`,
    { token, email, reason },
    { headers: token ? { 'x-guest-token': token } : undefined }
  )

export const returnGuestSaleOrderRequest = (id, { token, email, reason } = {}) =>
  axiosClient.put(
    `/orders/guest/${id}/return`,
    { token, email, reason },
    { headers: token ? { 'x-guest-token': token } : undefined }
  )
export const createWalkInSaleOrderRequest = (payload) => axiosClient.post('/orders/walk-in', payload)
