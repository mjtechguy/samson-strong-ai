import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { logger } from '../../../services/logging';

export interface ContentOptions {
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
}

const DEFAULT_CONTENT_OPTIONS: ContentOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'strong', 'em', 'code', 'blockquote'
  ]
};

export function parseMarkdownContent(
  markdown: string,
  options: ContentOptions = {}
): string {
  try {
    const mergedOptions = { ...DEFAULT_CONTENT_OPTIONS, ...options };
    
    // Convert markdown to HTML
    const html = marked(markdown);
    
    // Sanitize HTML
    return sanitizeHtml(html, {
      allowedTags: mergedOptions.allowedTags,
      allowedAttributes: mergedOptions.allowedAttributes
    });
  } catch (error) {
    logger.error('Failed to parse markdown content:', error);
    throw new Error('Failed to parse content');
  }
}