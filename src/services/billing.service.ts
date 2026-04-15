const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

export class BillingService {
  /**
   * Cria uma sessão de Checkout do Stripe
   */
  static async createCheckoutSession(userId: string, priceId: string) {
    // Integração real com a biblioteca 'stripe'
    // 1. Buscar ou criar cliente no Stripe
    // 2. Gerar URL de checkout
    return { url: 'https://checkout.stripe.com/...' }
  }

  /**
   * Cria uma sessão do Portal do Cliente
   */
  static async createPortalSession(customerId: string) {
    // Permite que o usuário gerencie sua assinatura (cancelar, trocar cartão)
    return { url: 'https://billing.stripe.com/p/session/...' }
  }
}
