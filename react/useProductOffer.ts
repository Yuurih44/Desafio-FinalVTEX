import { useProduct } from 'vtex.product-context'

interface SellerOffer {
  sellerDefault: boolean
  commertialOffer: {
    AvailableQuantity: number
    Price: number
    ListPrice: number
  }
}

export default function useProductOffer() {
  const context = useProduct()
  const sellers: SellerOffer[] = context?.selectedItem?.sellers ?? []
  const seller =
    sellers.find(
      item => item.sellerDefault && item.commertialOffer.AvailableQuantity > 0,
    ) ?? sellers.find(item => item.commertialOffer.AvailableQuantity > 0)

  const selectedSeller =
    seller ?? sellers.find(item => item.sellerDefault) ?? sellers[0]

  return {
    product: context?.product,
    offer: seller?.commertialOffer,
    listPrice: selectedSeller?.commertialOffer.ListPrice,
    sellingPrice: selectedSeller?.commertialOffer.Price,
  }
}
