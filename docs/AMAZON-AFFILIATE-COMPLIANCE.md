# Amazon Associates Program Compliance Guide

This document outlines the compliance requirements and implementation for the Amazon Associates Program on GoKartPartPicker.com.

## Overview

GoKartPartPicker.com participates in the Amazon Associates Program. This guide ensures full compliance with Amazon's Operating Agreement and FTC disclosure requirements.

## Key Requirements

### 1. Clear and Conspicuous Disclosure

**Requirement:** Every page with affiliate links must include a clear disclosure.

**Implementation:**
- `AffiliateDisclosure` component added to pages with affiliate links
- Footer includes disclosure on all pages
- Inline disclosures near affiliate link buttons

**Text Used:**
> "As an Amazon Associate, we earn from qualifying purchases."

### 2. Affiliate Link Marking

**Requirement:** Affiliate links must be properly marked.

**Implementation:**
- All affiliate links include `rel="sponsored"` attribute
- Links include `aria-label` with "(affiliate link)" text
- Tooltips indicate affiliate nature

**Example:**
```html
<a 
  href="{affiliate_url}" 
  target="_blank" 
  rel="noopener noreferrer sponsored"
  aria-label="Buy Now (affiliate link)"
>
  Buy Now
</a>
```

### 3. Privacy Policy

**Requirement:** Privacy policy must mention affiliate relationships.

**Location:** `/privacy`

**Key Sections:**
- Affiliate Relationships section
- Amazon Associates Program disclosure
- Cookie and tracking information
- Data collection related to affiliate links

### 4. Terms of Service

**Requirement:** Terms must include affiliate program information.

**Location:** `/terms`

**Key Sections:**
- Affiliate Relationships section
- Product information disclaimers
- Third-party link disclaimers
- Price and availability disclaimers

### 5. Footer Disclosure

**Requirement:** Site-wide disclosure in footer.

**Implementation:**
- Footer includes comprehensive disclosure
- Links to Privacy Policy and Terms
- Visible on all pages

## Pages with Affiliate Links

The following pages include affiliate links and disclosures:

1. **Part Detail Pages** (`/parts/[slug]`)
   - Disclosure: Inline disclosure below "Buy Now" button
   - Links: Part affiliate links

2. **Shopping Lists** (`/builds/[id]/shopping-list`)
   - Disclosure: Banner disclosure at bottom
   - Links: All affiliate links in shopping list

3. **Part Cards** (throughout site)
   - Links: Marked with `rel="sponsored"`
   - Tooltips: Indicate affiliate nature

4. **Engine Pages** (`/engines/[slug]`)
   - Links: Harbor Freight links (non-affiliate, but marked for consistency)
   - Note: Engines use direct Harbor Freight links, not Amazon affiliate links

## Compliance Checklist

- [x] Affiliate disclosure component created
- [x] Privacy Policy created with affiliate section
- [x] Terms of Service created with affiliate section
- [x] Footer disclosure updated
- [x] All affiliate links marked with `rel="sponsored"`
- [x] Disclosures added to pages with affiliate links
- [x] Links include proper aria-labels
- [x] Privacy policy accessible from footer
- [x] Terms of service accessible from footer

## Amazon Associates Program Rules

### Prohibited Activities

1. **No False Claims**
   - ✅ We only recommend products we believe are valuable
   - ✅ No misleading product descriptions
   - ✅ Accurate pricing information

2. **No Incentivized Reviews**
   - ✅ No paid reviews or fake testimonials
   - ✅ All reviews are genuine user feedback

3. **No Price Manipulation**
   - ✅ We don't modify prices
   - ✅ Prices shown are from retailers
   - ✅ Clear "estimated" labels where applicable

4. **Proper Link Usage**
   - ✅ Links open in new tabs
   - ✅ Links properly marked as affiliate
   - ✅ No cloaking or redirecting

### Required Disclosures

1. **FTC Compliance**
   - Clear disclosure that we earn commissions
   - Disclosure visible before clicking affiliate links
   - No hidden or buried disclosures

2. **Amazon Requirements**
   - Disclosure on every page with Amazon links
   - Clear statement of affiliate relationship
   - No false or misleading claims

## Implementation Details

### Components

**AffiliateDisclosure Component**
- Location: `frontend/src/components/affiliate/AffiliateDisclosure.tsx`
- Variants: `banner`, `inline`, `compact`
- Usage: Import and use on pages with affiliate links

**Example:**
```tsx
import { AffiliateDisclosure } from '@/components/affiliate/AffiliateDisclosure';

// In component
{part.affiliate_url && (
  <AffiliateDisclosure variant="inline" />
)}
```

### Link Marking

All affiliate links must include:
- `rel="sponsored"` - Indicates sponsored/affiliate link
- `aria-label` with "(affiliate link)" - Screen reader accessibility
- `target="_blank"` - Opens in new tab
- `rel="noopener noreferrer"` - Security best practice

### Pages

**Privacy Policy:** `/privacy`
- Comprehensive privacy information
- Affiliate relationship disclosure
- Cookie and tracking information

**Terms of Service:** `/terms`
- Usage terms and conditions
- Affiliate program information
- Disclaimers and limitations

## Monitoring and Updates

### Regular Reviews

- Review affiliate links quarterly
- Update disclosures if Amazon requirements change
- Monitor for compliance violations
- Keep privacy policy and terms current

### Amazon Associates Dashboard

- Monitor link performance
- Track compliance status
- Review Amazon communications
- Update site ID if needed

## Contact

For questions about affiliate compliance:
- Email: legal@gokartpartpicker.com
- Review: Amazon Associates Operating Agreement
- Reference: FTC Endorsement Guides

## Last Updated

2026-01-16

---

**Note:** This compliance guide should be reviewed and updated as Amazon Associates Program requirements change. Always refer to the latest Amazon Associates Operating Agreement for current requirements.
