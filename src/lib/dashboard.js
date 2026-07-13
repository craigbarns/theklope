export const getPaidOrders = (orders = []) =>
  orders.filter((order) => order.paymentStatus === 'paid' && order.status !== 'cancelled')
