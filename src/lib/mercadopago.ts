import { MercadoPagoConfig, Order, Payment, PaymentRefund } from 'mercadopago';

/**
 * Retorna uma instância configurada do cliente SDK do Mercado Pago
 */
export function getMercadoPagoClient() {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado nas variáveis de ambiente.');
  }

  return new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 15000
    }
  });
}

/**
 * Serviço de Ordens do Mercado Pago (Orders API /v1/orders)
 */
export function getOrderService() {
  return new Order(getMercadoPagoClient());
}

/**
 * Serviço de Pagamentos do Mercado Pago (Payments API /v1/payments)
 */
export function getPaymentService() {
  return new Payment(getMercadoPagoClient());
}

/**
 * Serviço de Reembolso do Mercado Pago (Refunds)
 */
export function getRefundService() {
  return new PaymentRefund(getMercadoPagoClient());
}

