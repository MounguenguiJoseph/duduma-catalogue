import Link from 'next/link'
import Image from 'next/image'
import StockBadge from './StockBadge'
import PriceDisplay from './PriceDisplay'

interface ProductCardProps {
  code: string
  name: string
  description: string | null
  price: number
  stock: number
  image_url: string | null
}

export default function ProductCard({ code, name, description, price, stock, image_url }: ProductCardProps) {
  return (
    <Link href={`/produit/${code}`} className="block rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative aspect-square w-full bg-gray-50">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="font-semibold text-sm leading-tight line-clamp-1">{name}</p>
        {description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-snug">{description}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          <PriceDisplay price={price} className="text-sm" />
          <StockBadge stock={stock} />
        </div>
      </div>
    </Link>
  )
}
