import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import sanitizeHtml from 'sanitize-html';
import { PDFElement, TextSegment } from './types';
import { logger } from '../../services/logging';

marked.use(gfmHeadingId());

export class MarkdownParser {
  private parseInlineFormatting(html: string): TextSegment[] {
    const segments: TextSegment[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    function processNode(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent?.trim()) {
          segments.push({
            text: node.textContent,
            style: {}
          });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const style: TextSegment['style'] = {};
        
        switch (element.tagName.toLowerCase()) {
          case 'strong':
          case 'b':
            style.isBold = true;
            break;
          case 'em':
          case 'i':
            style.isItalic = true;
            break;
          case 'code':
            style.isCode = true;
            break;
        }

        Array.from(element.childNodes).forEach(child => {
          if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            segments.push({
              text: child.textContent,
              style
            });
          } else {
            processNode(child);
          }
        });
      }
    }

    Array.from(doc.body.childNodes).forEach(processNode);
    return segments;
  }

  private parseTable(html: string): PDFElement['rows'] {
    const rows: PDFElement['rows'] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');

    if (!table) return rows;

    table.querySelectorAll('tr').forEach(tr => {
      const cells = Array.from(tr.querySelectorAll('th, td')).map(cell => ({
        content: cell.innerHTML,
        segments: this.parseInlineFormatting(cell.innerHTML)
      }));
      rows.push({ cells });
    });

    return rows;
  }

  private parseList(html: string, isOrdered: boolean): PDFElement['items'] {
    const items: PDFElement['items'] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    doc.querySelectorAll('li').forEach(li => {
      items.push({
        content: li.innerHTML,
        segments: this.parseInlineFormatting(li.innerHTML)
      });
    });
    
    return items;
  }

  public parse(markdown: string): PDFElement[] {
    try {
      const elements: PDFElement[] = [];
      const html = marked(markdown);
      
      const cleanHtml = sanitizeHtml(html, {
        allowedTags: [
          'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li',
          'table', 'tr', 'th', 'td', 'blockquote', 'code',
          'strong', 'b', 'em', 'i'
        ],
        allowedAttributes: {}
      });

      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanHtml, 'text/html');
      
      doc.body.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();
          const content = element.innerHTML;

          if (tagName.match(/h[1-4]/)) {
            elements.push({
              type: 'heading',
              content,
              segments: this.parseInlineFormatting(content),
              level: parseInt(tagName[1])
            });
          } else if (tagName === 'p') {
            elements.push({
              type: 'paragraph',
              content,
              segments: this.parseInlineFormatting(content)
            });
          } else if (tagName === 'ul' || tagName === 'ol') {
            elements.push({
              type: 'list',
              content,
              items: this.parseList(element.outerHTML, tagName === 'ol'),
              isOrdered: tagName === 'ol'
            });
          } else if (tagName === 'table') {
            elements.push({
              type: 'table',
              content,
              rows: this.parseTable(element.outerHTML)
            });
          } else if (tagName === 'blockquote') {
            elements.push({
              type: 'blockquote',
              content,
              segments: this.parseInlineFormatting(content)
            });
          } else if (tagName === 'code') {
            elements.push({
              type: 'code',
              content: element.textContent || ''
            });
          }
        }
      });

      return elements;
    } catch (error) {
      logger.error('Failed to parse markdown:', error);
      throw new Error('Failed to parse markdown');
    }
  }
}