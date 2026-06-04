const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '24107990169'

export function buildOrderMessage(code: string, sku?: string): string {
  const identifier = sku ?? code
  const text = encodeURIComponent(`Je veux commander ${identifier}`)
  return `https://wa.me/${WA_NUMBER}?text=${text}`
}

export function buildWelcomeLink(): string {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'Duduma'
  const text = encodeURIComponent(`Bonjour ${storeName} !`)
  return `https://wa.me/${WA_NUMBER}?text=${text}`
}
