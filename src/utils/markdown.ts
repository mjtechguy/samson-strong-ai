import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import DOMPurify from 'dompurify';

// Configure marked with extensions
marked.use(gfmHeadingId());

export const convertMarkdownToHTML = (markdown: string): string => {
  // Configure marked options
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert line breaks to <br>
    mangle: false, // Don't escape HTML
    sanitize: false // Let DOMPurify handle sanitization
  });

  // Convert markdown to HTML
  const rawHtml = marked(markdown);

  // Sanitize HTML to prevent XSS while allowing tables and other elements
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: [
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'ul', 'ol', 'li', 'strong', 'em',
      'blockquote', 'code', 'pre'
    ],
    ADD_ATTR: ['id', 'class', 'colspan', 'rowspan']
  });

  return cleanHtml;
};