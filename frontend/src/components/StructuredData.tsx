/**
 * Structured Data (JSON-LD) component
 * Provides schema.org markup for better SEO
 */

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Product structured data for engines and parts
 */
export function ProductStructuredData({
  name,
  description,
  brand,
  price,
  image,
  category,
  url,
}: {
  name: string;
  description: string;
  brand: string;
  price?: number | null;
  image?: string | null;
  category: string;
  url: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    category,
    ...(image && {
      image: image,
    }),
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    }),
    url,
  };

  return <StructuredData data={data} />;
}

/**
 * Breadcrumb structured data
 */
export function BreadcrumbStructuredData({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <StructuredData data={data} />;
}

/**
 * Organization structured data for the site
 */
export function OrganizationStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GoKartPartPicker',
    url: 'https://gokartpartpicker.com',
    logo: 'https://gokartpartpicker.com/logo.png',
    description:
      'Build your ultimate go-kart with our compatibility checker. Find engines, parts, and accessories that work together.',
    sameAs: [
      // Add social media links when available
    ],
  };

  return <StructuredData data={data} />;
}

/**
 * Website structured data
 */
export function WebsiteStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GoKartPartPicker',
    url: 'https://gokartpartpicker.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://gokartpartpicker.com/parts?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <StructuredData data={data} />;
}

/**
 * Article structured data for guides/blog posts
 */
export function ArticleStructuredData({
  title,
  description,
  author,
  publishedDate,
  modifiedDate,
  image,
  url,
}: {
  title: string;
  description: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  image?: string | null;
  url: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    ...(author && {
      author: {
        '@type': 'Person',
        name: author,
      },
    }),
    ...(publishedDate && {
      datePublished: publishedDate,
    }),
    ...(modifiedDate && {
      dateModified: modifiedDate,
    }),
    ...(image && {
      image: image,
    }),
    url,
    publisher: {
      '@type': 'Organization',
      name: 'GoKartPartPicker',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gokartpartpicker.com/logo.png',
      },
    },
  };

  return <StructuredData data={data} />;
}
