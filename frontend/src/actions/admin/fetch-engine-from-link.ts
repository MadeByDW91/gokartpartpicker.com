'use server';

/**
 * Fetch engine form data from a product URL (Amazon, Harbor Freight).
 * Populates name, brand, image, price, and supplier link so "Add engine" is faster.
 */

import { requireAdmin } from '../admin';
import type { ActionResult } from '@/lib/api/types';
import { success, error } from '@/lib/api/types';
import { getAmazonProductByASIN } from './amazon-category-search';
import { slugify } from '@/lib/utils';

export interface FetchedEngineData {
  name: string;
  brand: string;
  model: string | null;
  displacement_cc: number | null;
  image_url: string | null;
  price: number | null;
  supplier_name: string;
  supplier_url: string;
}

const ENGINE_BRANDS = ['Predator', 'Honda', 'Briggs & Stratton', 'Tillotson', 'Clone', 'Ducar', 'Lifan', 'Other'];

function isAmazonUrl(url: string): boolean {
  return /amazon\.(com|ca|co\.uk|de|fr|it|es|jp|in|com\.au|com\.br)/i.test(url) || /amzn\.to/i.test(url);
}

function isHarborFreightUrl(url: string): boolean {
  return /harborfreight\.com/i.test(url);
}

/** Parse displacement (cc) from title like "Predator 212cc" or "212 cc" */
function parseDisplacementFromTitle(title: string): number | null {
  const match = title.match(/(\d{2,4})\s*cc/i) || title.match(/(\d{2,4})cc/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

/** Guess brand from title (first word if it matches known brands) */
function guessBrandFromTitle(title: string): string {
  const first = title.trim().split(/\s+/)[0] || '';
  if (ENGINE_BRANDS.some((b) => b.toLowerCase() === first.toLowerCase())) return first;
  if (/predator/i.test(title)) return 'Predator';
  if (/honda/i.test(title)) return 'Honda';
  if (/briggs|stratton/i.test(title)) return 'Briggs & Stratton';
  if (/tillotson/i.test(title)) return 'Tillotson';
  if (/ducar/i.test(title)) return 'Ducar';
  if (/lifan/i.test(title)) return 'Lifan';
  if (/clone/i.test(title)) return 'Clone';
  return 'Other';
}

/** Clean product title for engine name (remove " - Harbor Freight", item numbers, etc.) */
function cleanTitleForName(title: string, source: string): string {
  let name = title
    .replace(/\s*[-–—|]\s*Harbor Freight.*$/i, '')
    .replace(/\s*[-–—|]\s*Amazon\.com.*$/i, '')
    .replace(/\s*[-–—|]\s*eBay.*$/i, '')
    .replace(/\s*Item\s*#?\s*\d+.*$/i, '')
    .trim();
  if (source === 'harborfreight' && name) {
    // "Predator 212cc Gas Engine" -> keep as is or "Predator 212"
    const cc = parseDisplacementFromTitle(name);
    if (cc) name = name.replace(/\s*\d+\s*cc\s*/i, ` ${cc} `).replace(/\s+/g, ' ').trim();
  }
  return name || title;
}

/**
 * Fetch product data from Harbor Freight product page (og:title, og:image, price from JSON-LD or meta).
 */
async function fetchHarborFreightProduct(url: string): Promise<FetchedEngineData | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GoKartPartPicker/1.0; +https://gokartpartpicker.com)',
        Accept: 'text/html',
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const html = await res.text();

    let title = '';
    let imageUrl: string | null = null;
    let price: number | null = null;

    // og:title
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (ogTitleMatch) title = ogTitleMatch[1].trim();

    // og:image
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (ogImageMatch) imageUrl = ogImageMatch[1].trim();

    // Price: try JSON-LD Product offers
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const json = JSON.parse(jsonLdMatch[1]);
        const objs = Array.isArray(json) ? json : [json];
        for (const obj of objs) {
          const offers = obj.offers ?? obj['@graph']?.find((g: { offers?: unknown }) => g.offers)?.offers;
          const offer = Array.isArray(offers) ? offers[0] : offers;
          if (offer?.price !== undefined) {
            const p = Number(offer.price);
            if (!Number.isNaN(p)) {
              price = p;
              break;
            }
          }
        }
      } catch {
        // ignore JSON parse errors
      }
    }
    if (price === null) {
      const priceMeta = html.match(/data-sale-price="([^"]+)"|"price":\s*"?(\d+\.?\d*)"?/i);
      if (priceMeta) {
        const p = Number(priceMeta[1] || priceMeta[2]);
        if (!Number.isNaN(p)) price = p;
      }
    }

    const name = cleanTitleForName(title, 'harborfreight');
    const brand = guessBrandFromTitle(name);
    const displacement_cc = parseDisplacementFromTitle(name) || parseDisplacementFromTitle(title);
    const model = displacement_cc ? String(displacement_cc) : null;

    return {
      name: name || 'Engine',
      brand,
      model,
      displacement_cc,
      image_url: imageUrl,
      price,
      supplier_name: 'Harbor Freight',
      supplier_url: url,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch engine form data from a product URL.
 * Supports Amazon (PA-API or fallback) and Harbor Freight (page fetch).
 */
export async function fetchEngineFromLink(productUrl: string): Promise<ActionResult<FetchedEngineData>> {
  const authResult = await requireAdmin();
  if ('success' in authResult && !authResult.success) {
    return authResult;
  }

  const trimmed = (productUrl || '').trim();
  if (!trimmed) {
    return error('Please enter a product URL');
  }

  try {
    if (isAmazonUrl(trimmed)) {
      const result = await getAmazonProductByASIN(trimmed);
      if (!result.success) {
        return error(result.error || 'Could not fetch Amazon product');
      }
      const p = result.data;
      if (!p) {
        return error('Could not fetch Amazon product');
      }
      const title = p.title || '';
      const name = cleanTitleForName(title, 'amazon');
      const brand = p.brand && ENGINE_BRANDS.some((b) => b.toLowerCase() === (p.brand || '').toLowerCase())
        ? (p.brand as string)
        : guessBrandFromTitle(title);
      const displacement_cc = parseDisplacementFromTitle(title);
      const affiliateLink = p.affiliateLink ?? `https://www.amazon.com/dp/${p.asin}`;

      return success({
        name: name || title || 'Engine',
        brand,
        model: displacement_cc ? String(displacement_cc) : null,
        displacement_cc,
        image_url: p.imageUrl || null,
        price: p.price ?? null,
        supplier_name: 'Amazon',
        supplier_url: affiliateLink,
      });
    }

    if (isHarborFreightUrl(trimmed)) {
      const data = await fetchHarborFreightProduct(trimmed);
      if (!data) {
        return error('Could not fetch Harbor Freight product. Check the URL and try again.');
      }
      return success(data);
    }

    return error('Unsupported link. Use an Amazon or Harbor Freight product page URL.');
  } catch (err) {
    console.error('[fetchEngineFromLink]', err);
    return error(err instanceof Error ? err.message : 'Failed to fetch product data');
  }
}
