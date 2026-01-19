# Pricing & Affiliate Link Policy

> **Business Rules for Pricing and Links**

---

## 🎯 Engine Pricing

### Source: Harbor Freight (harborfreight.com)

**Rule:** All engine prices come from Harbor Freight's current website prices.

**Affiliate Links:** ❌ **NO** — Engines do NOT use affiliate links.

**Implementation:**
- `engines.price` — Set from Harbor Freight website
- `engines.affiliate_url` — Can be direct Harbor Freight product link (NOT affiliate)
- Prices should be updated periodically to match Harbor Freight

**Why:** Harbor Freight is the primary source for Predator engines. We show their prices for accuracy, but don't use affiliate links for engines.

---

## 🛒 Parts Pricing

### Source: Various retailers

**Rule:** Parts can use affiliate links from various retailers.

**Affiliate Links:** ✅ **YES** — Parts can have affiliate links.

**Implementation:**
- `parts.price` — Retail price
- `parts.affiliate_url` — Affiliate link to retailer

**Why:** Parts come from multiple sources (Amazon, eBay, specialty retailers). Affiliate links help monetize the platform.

---

## 📋 Update Process

### Engines

1. Check Harbor Freight website for current prices
2. Update `engines.price` in database
3. Optionally update `engines.affiliate_url` to direct Harbor Freight product page (non-affiliate)
4. Document price update date

### Parts

1. Check retailer websites for current prices
2. Update `parts.price` in database
3. Update `parts.affiliate_url` if affiliate link changes

---

## 🔍 Current Status

**Engines:** Prices not yet set (need to fetch from Harbor Freight)

**Parts:** Prices set during seed/creation

---

*Last Updated: 2026-01-16*  
*Owner: A0 (Orchestrator)*
