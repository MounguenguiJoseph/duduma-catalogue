interface StockBadgeProps {
  stock: number
}

export default function StockBadge({ stock }: StockBadgeProps) {
  const available = stock > 0
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
      available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {available ? 'DISPO' : 'RUPTURE'}
    </span>
  )
}
