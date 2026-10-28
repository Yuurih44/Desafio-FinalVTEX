import React, { ReactElement } from 'react'
import { graphql } from 'react-apollo'
import productQuery from 'vtex.store-resources/QueryProduct'
import productsQuery from 'vtex.store-resources/QueryProducts'

interface Props {
  params: { slug: string; id?: string }
  children: ReactElement
  catalog?: {
    product?: object
    loading: boolean
    error?: Error
    refetch?: () => void
  }
  recent?: {
    products?: Array<{ productId: string; linkText: string }>
    loading: boolean
  }
}

function ProductPageContext({ params, children, catalog, recent }: Props) {
  const product =
    catalog?.product ??
    recent?.products?.find(item =>
      params.id
        ? item.productId === params.id
        : item.linkText.toLowerCase() === params.slug.toLowerCase(),
    )
  return React.cloneElement(children, {
    params,
    productQuery: {
      product,
      loading:
        !product && ((catalog?.loading ?? true) || Boolean(recent?.loading)),
      error: product ? undefined : catalog?.error,
      refetch: catalog?.refetch,
    },
  })
}

export default graphql(productQuery, {
  name: 'catalog',
  options: ({ params }: Props) => ({
    variables: {
      slug: params.slug,
      identifier: {
        field: params.id ? 'id' : 'slug',
        value: params.id ?? params.slug,
      },
    },
  }),
})(
  graphql(productsQuery, {
    name: 'recent',
    skip: ({ catalog }: Props) =>
      !catalog || catalog.loading || Boolean(catalog.product),
    options: {
      variables: {
        from: 0,
        to: 49,
        orderBy: 'OrderByReleaseDateDESC',
        hideUnavailableItems: false,
      },
    },
  })(ProductPageContext),
)
