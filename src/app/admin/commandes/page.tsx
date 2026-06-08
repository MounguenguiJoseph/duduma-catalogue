'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface Order {
  id: string
  payment_reference: string | null
  transaction_id: string | null
  client_phone: string
  customer_name: string | null
  product_name: string | null
  product_code: string | null
  amount: number
  total_price: number | null
  created_at: string
  reserved_until: string
  customers?: { is_vip: boolean; completed_orders_count: number } | null
}

function CountdownTimer({ until }: { until: string }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(until).getTime() - Date.now()
      if (diff <= 0) { setRemaining('Expiré'); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${m}m ${s.toString().padStart(2, '0')}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [until])

  const diff = new Date(until).getTime() - Date.now()
  const urgent = diff < 15 * 60 * 1000

  return (
    <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${
      urgent ? 'bg-red-100 text-red-600' : 'bg-amber-50 text-amber-700'
    }`}>
      ⏱ {remaining}
    </span>
  )
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/orders')
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [load])

  async function confirm(id: string) {
    setConfirming(id)
    const res = await fetch(`/api/admin/orders/${id}/confirm`, { method: 'POST' })
    if (res.ok) {
      setOrders(o => o.filter(x => x.id !== id))
    } else {
      alert('Erreur lors de la confirmation')
    }
    setConfirming(null)
  }

  async function cancel(id: string) {
    if (!confirm('Annuler cette commande et remettre en stock ?')) return
    setCancelling(id)
    await fetch(`/api/admin/orders/${id}/cancel`, { method: 'POST' })
    setOrders(o => o.filter(x => x.id !== id))
    setCancelling(null)
  }

  function formatPhone(phone: string) {
    const d = phone.replace(/\D/g, '').slice(-9)
    return d.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Paiements en attente</h1>
          <p className="text-sm text-gray-500">
            {orders.length} commande{orders.length > 1 ? 's' : ''} en attente
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="border border-gray-200 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
          >
            ↻ Actualiser
          </button>
          <Link href="/admin/produits" className="border border-gray-200 px-3 py-2 rounded-xl text-sm text-gray-500">
            Produits
          </Link>
        </div>
      </div>

      {/* Instructions SMS */}
      <div className="mb-5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">📱 Comment valider un paiement</p>
        <p>Quand tu reçois un SMS Airtel/Moov confirmant un paiement, vérifie la référence (ex: <span className="font-mono font-semibold">DUD-0312</span>) et clique <strong>Paiement reçu ✓</strong>. Le client reçoit automatiquement la confirmation WhatsApp.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-500 text-sm">Aucune commande en attente de paiement.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const isVip = order.customers?.is_vip
            return (
              <div
                key={order.id}
                className={`border rounded-xl p-4 bg-white ${
                  isVip ? 'border-amber-200 shadow-sm' : 'border-gray-100'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-bold text-base">{order.payment_reference ?? order.transaction_id}</span>
                      {isVip && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          ⭐ VIP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      {order.customers?.completed_orders_count ?? 0} commande{(order.customers?.completed_orders_count ?? 0) > 1 ? 's' : ''} au total
                    </p>
                  </div>
                  <CountdownTimer until={order.reserved_until} />
                </div>

                {/* Infos */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Client</p>
                    <p className="font-medium">{order.customer_name ?? 'Client'}</p>
                    <p className="text-xs text-gray-500 font-mono">{formatPhone(order.client_phone)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Produit</p>
                    <p className="font-medium">{order.product_name ?? '—'}</p>
                    <p className="text-xs text-gray-500 font-mono">{order.product_code ?? ''}</p>
                  </div>
                </div>

                {/* Montant + instructions */}
                <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 text-sm">
                  <span className="text-gray-500">À recevoir : </span>
                  <span className="font-bold text-base">{order.total_price?.toLocaleString('fr-FR')} FCFA</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => confirm(order.id)}
                    disabled={confirming === order.id}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-green-700 transition-colors"
                  >
                    {confirming === order.id ? 'Confirmation...' : '✓ Paiement reçu'}
                  </button>
                  <button
                    onClick={() => cancel(order.id)}
                    disabled={cancelling === order.id}
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/admin/produits" className="text-sm text-gray-400 hover:underline">
          ← Retour aux produits
        </Link>
      </div>
    </div>
  )
}
