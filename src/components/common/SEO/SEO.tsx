import React, { useEffect } from 'react';
import { BUSINESS_CONFIG } from '../../../config/business';
import { buildCanonicalUrl, formatImageUrl } from '../../../utils/seo';

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  ogImage,
  noindex = false,
  jsonLd
}) => {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${BUSINESS_CONFIG.name}`
      : `${BUSINESS_CONFIG.name} - ${BUSINESS_CONFIG.slogan} | Bakı`;
    const fullDescription = description || BUSINESS_CONFIG.description;
    const currentUrl = buildCanonicalUrl(canonicalPath);
    const imageUrl = formatImageUrl(ogImage);
    const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';

    // 1. Update Title
    document.title = fullTitle;

    // 2. Helper to set/create Meta Tag
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Helper to set/create Link Tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Set Standard & Robots Meta
    setMetaTag('meta[name="description"]', 'name', 'description', fullDescription);
    setMetaTag('meta[name="robots"]', 'name', 'robots', robotsContent);

    // Set Open Graph Meta
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', fullDescription);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', imageUrl);

    // Set Twitter Card Meta
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', fullDescription);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);

    // Set Canonical Link
    setLinkTag('canonical', currentUrl);

    // Inject JSON-LD Schema (Remove old route scripts first)
    const existingScripts = document.head.querySelectorAll('script[data-seo-jsonld="true"]');
    existingScripts.forEach(script => script.remove());

    if (jsonLd) {
      const jsonLdArray = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      jsonLdArray.forEach((schema, index) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', 'true');
        script.setAttribute('data-seo-index', index.toString());
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    return () => {
      // Cleanup custom JSON-LD on unmount
      const scripts = document.head.querySelectorAll('script[data-seo-jsonld="true"]');
      scripts.forEach(s => s.remove());
    };
  }, [title, description, canonicalPath, ogType, ogImage, noindex, jsonLd]);

  return null;
};
