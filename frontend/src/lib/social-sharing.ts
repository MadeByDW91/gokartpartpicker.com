/**
 * Social sharing utilities
 */

export interface ShareOptions {
  title: string;
  text: string;
  url: string;
  hashtags?: string[];
}

/**
 * Share to native share API or fallback
 */
export async function shareContent(options: ShareOptions): Promise<boolean> {
  const shareData: ShareData = {
    title: options.title,
    text: options.text,
    url: options.url,
  };

  // Check if Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
      return false;
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(`${options.title}\n${options.text}\n${options.url}`);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Share to Twitter/X
 */
export function shareToTwitter(options: ShareOptions): void {
  const hashtags = options.hashtags?.join(',') || 'GoKartPartPicker';
  const text = encodeURIComponent(options.text);
  const url = encodeURIComponent(options.url);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`;
  window.open(twitterUrl, '_blank', 'width=550,height=420');
}

/**
 * Share to Facebook
 */
export function shareToFacebook(options: ShareOptions): void {
  const url = encodeURIComponent(options.url);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  window.open(facebookUrl, '_blank', 'width=550,height=420');
}

/**
 * Share to Reddit
 */
export function shareToReddit(options: ShareOptions): void {
  const title = encodeURIComponent(options.title);
  const url = encodeURIComponent(options.url);
  const redditUrl = `https://reddit.com/submit?title=${title}&url=${url}`;
  window.open(redditUrl, '_blank', 'width=550,height=420');
}

/**
 * Share via email
 */
export function shareViaEmail(options: ShareOptions): void {
  const subject = encodeURIComponent(options.title);
  const body = encodeURIComponent(`${options.text}\n\n${options.url}`);
  const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
  window.location.href = mailtoUrl;
}

/**
 * Generate Open Graph meta tags for sharing
 */
export function generateOGMeta(options: {
  title: string;
  description: string;
  image?: string;
  url: string;
}): Record<string, string> {
  return {
    'og:title': options.title,
    'og:description': options.description,
    'og:url': options.url,
    'og:type': 'website',
    'og:image': options.image || '/og/og-default-v1-1200x630.png',
    'twitter:card': 'summary_large_image',
    'twitter:title': options.title,
    'twitter:description': options.description,
    'twitter:image': options.image || '/og/og-default-v1-1200x630.png',
  };
}

/**
 * Share build
 */
export function shareBuild(buildId: string, buildName: string): ShareOptions {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return {
    title: `Check out my go-kart build: ${buildName}`,
    text: `I built this go-kart using GoKartPartPicker! View the full build configuration:`,
    url: `${baseUrl}/builder?build=${buildId}`,
    hashtags: ['GoKart', 'GoKartBuild', 'GoKartPartPicker'],
  };
}

/**
 * Share template
 */
export function shareTemplate(templateId: string, templateName: string): ShareOptions {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return {
    title: `Check out this go-kart template: ${templateName}`,
    text: `Start your build with this template on GoKartPartPicker:`,
    url: `${baseUrl}/builder?template=${templateId}`,
    hashtags: ['GoKart', 'GoKartTemplate', 'GoKartPartPicker'],
  };
}
