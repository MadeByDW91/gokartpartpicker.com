import type { VendorOffer, Vendor } from '@prisma/client'

export interface VendorOfferWithVendor extends VendorOffer {
  vendor: Vendor
}

/**
 * Sort vendor offers with Amazon always first (if exists), then by totalPriceUsd ascending
 */
export function sortVendorOffers(offers: VendorOfferWithVendor[]): VendorOfferWithVendor[] {
  return [...offers].sort((a, b) => {
    // Amazon (priority 0) always first
    if (a.vendor.priority === 0 && b.vendor.priority !== 0) return -1
    if (a.vendor.priority !== 0 && b.vendor.priority === 0) return 1

    // If both are Amazon or both are not Amazon, sort by total price
    const totalA = a.priceUsd + a.shippingUsd
    const totalB = b.priceUsd + b.shippingUsd

    if (totalA !== totalB) {
      return totalA - totalB
    }

    // If prices are equal, sort by vendor priority (lower = higher priority)
    return a.vendor.priority - b.vendor.priority
  })
}

