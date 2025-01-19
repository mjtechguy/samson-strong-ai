import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import sanitizeHtml from 'sanitize-html';
import PDFDocument from 'pdfkit';
import { logger } from '../../services/logging';

marked.use(gfmHeadingId());

export class PDFGenerator {
  private styles = {
    header: {
      fontSize: 24,
      margin: 10
    },
    subheader: {
      fontSize: 18,
      margin: 8
    },
    body: {
      fontSize: 12,
      margin: 5
    },
    table: {
      fontSize: 12,
      margin: 5,
      padding: 5,
      headerColor: '#f3f4f6'
    }
  };

  private createDocument(): PDFDocument {
    return new PDFDocument({
      autoFirstPage: true,
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
  }

  private async renderMarkdown(doc: PDFDocument, markdown: string) {
    const html = marked(markdown);
    const cleanHtml = sanitizeHtml(html, {
      allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'strong', 'em', 'code', 'blockquote'
      ]
    });

    const parser = new DOMParser();
    const parsedDoc = parser.parseFromString(cleanHtml, 'text/html');

    for (const node of Array.from(parsedDoc.body.children)) {
      const tagName = node.tagName.toLowerCase();

      switch (tagName) {
        case 'h1':
          doc.fontSize(this.styles.header.fontSize)
             .font('Helvetica-Bold')
             .text(node.textContent || '', { paragraphGap: this.styles.header.margin });
          break;

        case 'h2':
        case 'h3':
          doc.fontSize(this.styles.subheader.fontSize)
             .font('Helvetica-Bold')
             .text(node.textContent || '', { paragraphGap: this.styles.subheader.margin });
          break;

        case 'p':
          doc.fontSize(this.styles.body.fontSize)
             .font('Helvetica')
             .text(node.textContent || '', { paragraphGap: this.styles.body.margin });
          break;

        case 'ul':
        case 'ol':
          const items = Array.from(node.getElementsByTagName('li'));
          items.forEach((item, index) => {
            const bullet = tagName === 'ol' ? `${index + 1}.` : '•';
            doc.fontSize(this.styles.body.fontSize)
               .font('Helvetica')
               .text(`${bullet} ${item.textContent}`, {
                 indent: 20,
                 paragraphGap: this.styles.body.margin
               });
          });
          break;

        case 'table':
          const table = node as HTMLTableElement;
          const rows = Array.from(table.rows);
          const columnCount = Math.max(...rows.map(row => row.cells.length));
          const columnWidth = (doc.page.width - 100) / columnCount;

          rows.forEach((row, rowIndex) => {
            const cells = Array.from(row.cells);
            const isHeader = rowIndex === 0;
            const y = doc.y;

            cells.forEach((cell, cellIndex) => {
              const x = 50 + (cellIndex * columnWidth);
              
              if (isHeader) {
                doc.rect(x, y, columnWidth, 30)
                   .fill(this.styles.table.headerColor);
              }

              doc.fontSize(this.styles.table.fontSize)
                 .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                 .text(cell.textContent || '', 
                      x + this.styles.table.padding,
                      y + this.styles.table.padding,
                      {
                        width: columnWidth - (2 * this.styles.table.padding),
                        height: 30 - (2 * this.styles.table.padding)
                      });
            });

            doc.moveDown();
          });
          break;

        case 'blockquote':
          doc.fontSize(this.styles.body.fontSize)
             .font('Helvetica-Oblique')
             .text(node.textContent || '', {
               paragraphGap: this.styles.body.margin,
               indent: 20,
               color: '#666666'
             });
          break;
      }
    }
  }

  public async generateFromMarkdown(
    markdown: string,
    title: string,
    author: string
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const doc = this.createDocument();
        const chunks: Buffer[] = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
          resolve(blob);
        });

        const headerMarkdown = `# ${title}\n\nCustomized for: ${author}\nGenerated on: ${new Date().toLocaleDateString()}\n\n---\n\n`;
        const fullMarkdown = headerMarkdown + markdown;

        this.renderMarkdown(doc, fullMarkdown);
        doc.end();
      } catch (error) {
        logger.error('Failed to generate PDF:', error);
        reject(new Error('Failed to generate PDF'));
      }
    });
  }
}