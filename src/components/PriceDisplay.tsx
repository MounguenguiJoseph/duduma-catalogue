import { formatPrice } from '@/lib/format'

interface PriceDisplayProps {
  price: number
  adjustment?: number
  className?: string
}

export default function PriceDisplay({ price, adjustment = 0, className = '' }: PriceDisplayProps) {
  const total = price + adjustment
  return (
    <span className={`font-bold ${className}`}>
      {formatPrice(total)}
    </span>
  )
}
