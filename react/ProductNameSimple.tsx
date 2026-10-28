import React from 'react'
import useProductOffer from './useProductOffer'
import styles from './styles.css'

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export default function ProductNameSimple() {
  const { product, offer } = useProductOffer()
  if (!product) return null
  const validPrice = offer && Number.isFinite(offer.Price) && offer.Price >= 0

  return (
    <div className={styles.priceBarSpace}>
      <aside className={styles.priceBar} aria-label="Resumo do produto">
        <strong className={styles.productName}>{product.productName}</strong>
        <div className={styles.prices}>
          {validPrice && offer ? (
            <>
              {offer.ListPrice > offer.Price && (
                <span className={styles.listPrice}>
                  De <del>{money.format(offer.ListPrice)}</del>
                </span>
              )}
              <strong>Por {money.format(offer.Price)}</strong>
            </>
          ) : (
            <span>Produto indisponível</span>
          )}
        </div>
      </aside>
    </div>
  )
}
