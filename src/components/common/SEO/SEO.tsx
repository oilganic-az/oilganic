import React, { useEffect } from 'react';
import { BUSINESS_CONFIG } from '../../../config/business';

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  jsonLd
}) => {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${BUSINESS_CONFIG.name}`
      : `${BUSINESS_CONFIG.name} - ${BUSINESS_CONFIG.slogan} | Bakı`;
    const fullDescription = description || BUSINESS_CONFIG.description;
    const currentUrl = `https://oilganic.az${canonicalPath}`;

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

    // Set Standard & Social Meta
    setMetaTag('meta[name="description"]', 'name', 'description', fullDescription);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', fullDescription);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', fullDescription);

    setLinkTag('canonical', currentUrl);

    // 4. Inject JSON-LD Schema (Remove old route scripts first)
    const existingScripts = document.head.querySelectorAll('script[data-seo-jsonld="true"]');
    existingScripts.forEach(script => script.remove());

    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup custom JSON-LD on unmount
      const scripts = document.head.querySelectorAll('script[data-seo-jsonld="true"]');
      scripts.forEach(s => s.remove());
    };
  }, [title, description, canonicalPath, ogType, jsonLd]);

  return null;
};
