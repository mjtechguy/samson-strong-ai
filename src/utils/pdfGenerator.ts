import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { logger } from '../services/logging';
import { loadImage } from './image/loader';
import { getImageDimensions } from './image/dimensions';

export class PDFDocument {
  private doc: jsPDF;
  private title: string;
  private userName: string;
  private currentY: number;
  private margin: number;
  private pageWidth: number;
  private pageHeight: number;
  private defaultFont: string = 'helvetica';
  private logoUrl: string;

  constructor(title: string, userName: string) {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    this.title = title;
    this.userName = userName;
    this.currentY = 20;
    this.margin = 20;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.logoUrl = import.meta.env.VITE_APP_LOGO_URL || '';

    // Set default line height
    this.doc.setLineHeightFactor(1.5);
  }

  private async addLogo() {
    if (!this.logoUrl) {
      this.addTextTitle();
      return;
    }

    try {
      const img = await loadImage(this.logoUrl);
      const { width, height } = getImageDimensions(img.width, img.height, 40);
      const x = (this.pageWidth - width) / 2;
      
      this.doc.addImage(img.src, 'PNG', x, this.currentY, width, height);
      this.currentY += height + 10;
    } catch (error) {
      logger.warn('Failed to add logo, using text title instead:', error);
      this.addTextTitle();
    }
  }

  private addTextTitle() {
    this.doc.setFontSize(24);
    this.doc.setFont(this.defaultFont, 'bold');
    const titleWidth = this.doc.getTextWidth(this.title);
    const x = (this.pageWidth - titleWidth) / 2;
    this.doc.text(this.title, x, this.currentY);
    this.currentY += 10;
  }

  private async addProgramImage(imageUrl: string) {
    if (!imageUrl) {
      logger.debug('No program image URL provided, skipping');
      return;
    }

    try {
      const img = await loadImage(imageUrl);
      const maxWidth = this.pageWidth - (2 * this.margin);
      const { width, height } = getImageDimensions(img.width, img.height, maxWidth, 16/9);
      const x = this.margin;
      
      if (this.checkNewPage(height + 10)) {
        this.currentY = this.margin;
      }

      this.doc.addImage(img.src, 'PNG', x, this.currentY, width, height);
      this.currentY += height + 10;

      logger.debug('Program image added successfully', {
        width,
        height,
        x,
        y: this.currentY - height - 10
      });
    } catch (error) {
      logger.warn('Failed to add program image:', error);
      // Continue without the image
    }
  }

  private async addHeader(programImageUrl?: string) {
    try {
      // Add program image first if available
      if (programImageUrl) {
        await this.addProgramImage(programImageUrl);
      }

      // Then add app logo or text title
      await this.addLogo();

      // Add user info and date
      this.doc.setFontSize(12);
      this.doc.setFont(this.defaultFont, 'normal');
      
      // Add user name
      this.doc.text(`Customized for: ${this.userName}`, this.margin, this.currentY);
      this.currentY += 8;

      // Add date
      const date = new Date().toLocaleDateString();
      this.doc.text(`Generated on: ${date}`, this.margin, this.currentY);
      this.currentY += 8;

      // Add separator line
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
      this.currentY += 10;

      logger.debug('Header added successfully', {
        title: this.title,
        userName: this.userName,
        currentY: this.currentY
      });
    } catch (error) {
      logger.error('Failed to add header:', error);
      // Reset position and continue without header
      this.currentY = 20;
    }
  }

  private checkNewPage(height: number) {
    const bottomMargin = this.margin + 10; // Add extra space at bottom
    if (this.currentY + height > this.pageHeight - bottomMargin) {
      this.doc.addPage();
      this.currentY = this.margin;
      return true;
    }
    return false;
  }

  public async addContent(markdown: string, programImageUrl?: string) {
    try {
      await this.addHeader(programImageUrl);

      const html = marked(markdown, {
        gfm: true,
        breaks: true,
        headerIds: false // Disable header IDs
      });

      const cleanHtml = sanitizeHtml(html, {
        allowedTags: [
          'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li',
          'strong', 'em', 'code', 'blockquote'
        ]
      });

      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanHtml, 'text/html');

      for (const node of Array.from(doc.body.children)) {
        const tagName = node.tagName.toLowerCase();
        const text = node.textContent || '';

        // Skip empty nodes
        if (!text.trim()) continue;

        switch (tagName) {
          case 'h1':
            if (this.checkNewPage(14)) continue;
            this.doc.setFontSize(20);
            this.doc.setFont(this.defaultFont, 'bold');
            this.doc.text(text, this.margin, this.currentY);
            this.currentY += 14;
            break;

          case 'h2':
            if (this.checkNewPage(12)) continue;
            this.doc.setFontSize(16);
            this.doc.setFont(this.defaultFont, 'bold');
            this.doc.text(text, this.margin, this.currentY);
            this.currentY += 12;
            break;

          case 'p':
            this.doc.setFontSize(12);
            this.doc.setFont(this.defaultFont, 'normal');
            const lines = this.doc.splitTextToSize(text, this.pageWidth - (2 * this.margin));
            
            for (const line of lines) {
              if (this.checkNewPage(8)) continue;
              this.doc.text(line, this.margin, this.currentY);
              this.currentY += 8;
            }
            this.currentY += 4;
            break;

          case 'ul':
          case 'ol':
            const items = Array.from(node.getElementsByTagName('li'));
            items.forEach((item, index) => {
              if (this.checkNewPage(8)) return;
              this.doc.setFontSize(12);
              this.doc.setFont(this.defaultFont, 'normal');
              
              // Only add numbers for ordered lists
              const bullet = tagName === 'ol' ? `${index + 1}.` : '•';
              const itemText = item.textContent || '';
              
              // Calculate indent based on bullet width
              const bulletWidth = this.doc.getTextWidth(bullet + ' ');
              const textWidth = this.pageWidth - (2 * this.margin) - bulletWidth;
              
              // Split text to fit width with indent
              const lines = this.doc.splitTextToSize(itemText, textWidth);
              
              // Add bullet/number for first line
              this.doc.text(bullet, this.margin, this.currentY);
              this.doc.text(lines[0], this.margin + bulletWidth, this.currentY);
              this.currentY += 8;
              
              // Add remaining lines with indent
              for (let i = 1; i < lines.length; i++) {
                if (this.checkNewPage(8)) continue;
                this.doc.text(lines[i], this.margin + bulletWidth, this.currentY);
                this.currentY += 8;
              }
            });
            this.currentY += 4;
            break;
        }
      }

      logger.debug('Content added successfully');
    } catch (error) {
      logger.error('Failed to add content to PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  public async generate(): Promise<Blob> {
    try {
      const options = { 
        compress: true,
        precision: 2
      };
      
      const blob = this.doc.output('blob', options);
      
      logger.debug('Generated PDF blob', {
        size: blob.size,
        sizeInMB: Math.round(blob.size / (1024 * 1024)),
        type: blob.type
      });

      return blob;
    } catch (error) {
      logger.error('Failed to generate PDF blob:', error);
      throw new Error('Failed to generate PDF');
    }
  }
}