'use server';

/**
 * Fetch electric motor form data from a product URL (Amazon, etc.).
 * Populates name, brand, voltage, power, HP, torque, RPM, price, image, and affiliate link.
 */

import { requireAdmin } from '../admin';
import type { ActionResult } from '@/lib/api/types';
import { success, error } from '@/lib/api/types';
import { getAmazonProductByASIN } from './amazon-category-search';
import { slugify } from '@/lib/utils';

export interface FetchedMotorData {
  name: string;
  brand: string;
  voltage: number | null;
  power_kw: number | null;
  peak_power_kw: number | null;
  horsepower: number | null;
  torque_lbft: number | null;
  rpm_rated: number | null;
  rpm_max: number | null;
  price: number | null;
  image_url: string | null;
  affiliate_url: string;
}

const MOTOR_BRANDS = ['Amped Motors', 'MY1020', 'MY1016', 'QS Motor', 'Hub Motor', 'Chokayaky', 'Kunray', 'Other'];

function isAmazonUrl(url: string): boolean {
  return /amazon\.(com|ca|co\.uk|de|fr|it|es|jp|in|com\.au|com\.br)/i.test(url) || /amzn\.to/i.test(url);
}

/** Parse text for voltage: 72V, 72 Volts, 48V */
function parseVoltage(text: string): number | null {
  const m = text.match(/(\d{2,3})\s*[Vv](?:olt)?s?/);
  return m ? parseInt(m[1], 10) : null;
}

/** Parse power in W or kW: 5000W -> 5, 5kW -> 5 */
function parsePowerKw(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*[kK]?[Ww]/);
  if (!m) return null;
  const val = parseFloat(m[1]);
  return val > 100 ? val / 1000 : val; // 5000 -> 5
}

/** Parse horsepower: 6.7 HP, 6.7 Horsepower */
function parseHorsepower(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(?:HP|Horsepower|hp)/i);
  return m ? parseFloat(m[1]) : null;
}

/** Parse torque: 8.5 N.m -> convert to lb-ft (× 0.737562); or "X lb-ft" */
function parseTorqueLbft(text: string): number | null {
  const nm = text.match(/(\d+(?:\.\d+)?)\s*N\.?m/i);
  if (nm) {
    const n = parseFloat(nm[1]);
    return Math.round(n * 0.737562 * 10) / 10;
  }
  const lbft = text.match(/(\d+(?:\.\d+)?)\s*(?:lb-?ft|ft-?lb)/i);
  return lbft ? parseFloat(lbft[1]) : null;
}

/** Parse RPM: 6800 RPM, 6800rpm */
function parseRpm(text: string): number | null {
  const m = text.match(/(\d{3,5})\s*[Rr]?[Pp][Mm]/);
  return m ? parseInt(m[1], 10) : null;
}

/** Search combined text (title + features + specs values) for motor specs */
function parseSpecsFromText(title: string, features: string[], specifications: Record<string, string>): Partial<FetchedMotorData> {
  const combined = [title, ...features, ...Object.values(specifications)].join(' ');
  const voltage = parseVoltage(combined) ?? parseVoltage(title);
  const power_kw = parsePowerKw(combined) ?? parsePowerKw(title);
  const peakMatch = combined.match(/(\d+)\s*[kK]?[Ww]\s*peak|peak\s*(\d+)\s*[kK]?[Ww]/i);
  const peak_power_kw = peakMatch ? (parseFloat(peakMatch[1] || peakMatch[2]) > 100 ? parseFloat(peakMatch[1] || peakMatch[2]) / 1000 : parseFloat(peakMatch[1] || peakMatch[2])) : null;
  const horsepower = parseHorsepower(combined) ?? parseHorsepower(title);
  const torque_lbft = parseTorqueLbft(combined) ?? parseTorqueLbft(title);
  const rpm_rated = parseRpm(combined) ?? parseRpm(title);
  const rpm_max = combined.match(/(\d{3,5})\s*(?:no-?load|max)\s*[Rr]?[Pp][Mm]|(?:no-?load|max)\s*(\d{3,5})\s*[Rr]?[Pp][Mm]/i)
    ? parseRpm(combined.replace(/rated|peak/i, '')) : null;
  return {
    voltage: voltage ?? null,
    power_kw: power_kw ?? null,
    peak_power_kw: peak_power_kw ?? null,
    horsepower: horsepower ?? null,
    torque_lbft: torque_lbft ?? null,
    rpm_rated: rpm_rated ?? null,
    rpm_max: rpm_max ?? null,
  };
}

/** Shorten Amazon title for motor name */
function shortName(title: string): string {
  return title
    .replace(/\s*[-–—|]\s*Amazon\.com.*$/i, '')
    .replace(/\s*[-–—|]\s*Sports\s*&\s*Outdoors.*$/i, '')
    .replace(/\s*Electric Motor for Go Kart.*$/i, '')
    .trim()
    .slice(0, 120) || title.slice(0, 80);
}

/**
 * Fetch motor form data from a product URL.
 * Supports Amazon (PA-API or fallback); parses title/features/specs for voltage, power, HP, torque, RPM.
 */
export async function fetchMotorFromLink(productUrl: string): Promise<ActionResult<FetchedMotorData>> {
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
        return error(result.error || 'Could not fetch Amazon product. Check the URL or try again.');
      }
      const p = result.data;
      if (!p) {
        return error('Could not fetch Amazon product. Check the URL or try again.');
      }
      const title = p.title || '';
      const features = Array.isArray(p.features) ? p.features : [];
      const specs = p.specifications && typeof p.specifications === 'object' ? p.specifications : {};
      const parsed = parseSpecsFromText(title, features, specs as Record<string, string>);

      const affiliateLink = p.affiliateLink ?? `https://www.amazon.com/dp/${p.asin}`;
      const brand = (p.brand && MOTOR_BRANDS.some((b) => b.toLowerCase() === (p.brand || '').toLowerCase()))
        ? (p.brand as string)
        : (p.brand || (title.match(/Chokayaky|Kunray|QS Motor|Amped/i)?.[0] ?? 'Other'));

      return success({
        name: shortName(title) || title.slice(0, 80),
        brand,
        voltage: parsed.voltage ?? null,
        power_kw: parsed.power_kw ?? null,
        peak_power_kw: parsed.peak_power_kw ?? null,
        horsepower: parsed.horsepower ?? null,
        torque_lbft: parsed.torque_lbft ?? null,
        rpm_rated: parsed.rpm_rated ?? null,
        rpm_max: parsed.rpm_max ?? null,
        price: p.price ?? null,
        image_url: p.imageUrl || null,
        affiliate_url: affiliateLink,
      });
    }

    return error('Unsupported link. Use an Amazon product page URL for electric motors.');
  } catch (err) {
    console.error('[fetchMotorFromLink]', err);
    return error(err instanceof Error ? err.message : 'Failed to fetch product data');
  }
}
