import React from 'react'
import useProductOffer from './useProductOffer'
import styles from './styles.css'

export default function PromotionBadge() {
  const { listPrice, sellingPrice } = useProductOffer()
  if (
    typeof listPrice !== 'number' ||
    typeof sellingPrice !== 'number' ||
    !Number.isFinite(listPrice) ||
    !Number.isFinite(sellingPrice) ||
    sellingPrice < 0 ||
    listPrice <= sellingPrice
  )
    return null
  return <span className={styles.promotionBadge}>PROMOÇÃO</span>
}
