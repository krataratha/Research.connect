const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');
const logger = require('../../../common/utils/logger'); // check if logger exists, else use console

const log = logger || console;

class MetadataExtractionService {
  /**
   * Main entry point to extract metadata from file buffer
   */
  async extractMetadata(fileBuffer, originalName, mimeType) {
    const ext = originalName ? originalName.substring(originalName.lastIndexOf('.')).toLowerCase() : '';
    
    let text = '';
    let pdfMetadata = {};

    try {
      if (fileBuffer && (ext === '.pdf' || mimeType === 'application/pdf')) {
        const parsed = await this._parsePdf(fileBuffer);
        text = parsed.text || '';
        pdfMetadata = parsed.metadata || {};
      } else if (fileBuffer && (ext === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        const parsed = await this._parseDocx(fileBuffer);
        text = parsed || '';
      } else if (fileBuffer && (ext === '.txt' || mimeType === 'text/plain')) {
        text = fileBuffer.toString('utf8');
      }
    } catch (parseError) {
      log.error('[METADATA PARSE EXCEPTION]:', parseError);
    }

    try {
      // Safe OCR fallback check
      if (text.trim().length < 100 && fileBuffer) {
        log.warn('[METADATA EXTRACTION]: Scanned document or empty text. Attempting OCR fallback...');
        try {
          const ocrText = await Promise.race([
            this._runOcr(fileBuffer),
            new Promise((_, reject) => setTimeout(() => reject(new Error('OCR Timeout')), 8000))
          ]);
          if (ocrText && ocrText.trim().length > 50) {
            text = ocrText;
          }
        } catch (ocrErr) {
          log.warn('[OCR FALLBACK WARN]: OCR skipped or timed out.', ocrErr.message);
        }
      }
    } catch (ocrOuterError) {
      log.error('[OCR EXCEPTION]:', ocrOuterError);
    }

    // Heuristically extract fields with whatever text we have!
    return this._extractFields(text, pdfMetadata, originalName);
  }

  /**
   * PDF Parser
   */
  async _parsePdf(buffer) {
    try {
      const data = await pdfParse(buffer);
      return {
        text: data.text || '',
        metadata: data.info || {}
      };
    } catch (err) {
      log.error('pdf-parse failed:', err);
      return { text: '', metadata: {} };
    }
  }

  /**
   * DOCX Parser
   */
  async _parseDocx(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } catch (err) {
      log.error('mammoth docx extraction failed:', err);
      return '';
    }
  }

  /**
   * OCR Fallback for scanned documents using Tesseract.js
   */
  async _runOcr(buffer) {
    try {
      // Create web worker/recognizer instance
      const { data: { text } } = await Tesseract.recognize(
        buffer,
        'eng',
        { logger: m => log.info(m) }
      );
      return text;
    } catch (err) {
      log.error('Tesseract OCR failed:', err);
      return '';
    }
  }

  /**
   * Extraction algorithms using regex & heuristic logic
   */
  _extractFields(text, info = {}, originalName = '') {
    const cleanText = (text || '').replace(/\r\n/g, '\n');
    const firstLines = cleanText.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 15);
    
    // 1. DOI Extraction (Standard DOI regex)
    let doi = '';
    let doiConfidence = 0;
    const doiRegex = /\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+\b/i;
    const doiMatch = cleanText.match(doiRegex);
    if (doiMatch) {
      doi = doiMatch[0];
      doiConfidence = 100;
    }

    // 2. Title Extraction
    let title = '';
    let titleConfidence = 0;
    
    // Check PDF Info Metadata first
    if (info.Title && info.Title.trim() && !/untitled/i.test(info.Title) && !/pdf/i.test(info.Title) && info.Title.trim().length > 10) {
      title = info.Title.trim();
      titleConfidence = 95;
    } else {
      // Find the first line in the text that looks like a title
      // Skip top lines if they look like headers (e.g. journal name, page numbers, website)
      const potentialTitles = firstLines.filter(line => {
        if (line.length < 15 || line.length > 200) return false;
        if (/http/i.test(line) || /www/i.test(line)) return false;
        if (/volume|issue|pages|journal|proceedings|editor|conference/i.test(line)) return false;
        return true;
      });
      
      if (potentialTitles.length > 0) {
        title = potentialTitles[0];
        titleConfidence = 80;
      } else if (firstLines.length > 0) {
        title = firstLines[0];
        titleConfidence = 60;
      }
    }

    // Fall back to filename if still empty
    if (!title && originalName) {
      title = originalName.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, ' ').trim();
      titleConfidence = 35;
    }
    if (!title) {
      title = 'Untitled Research Paper';
      titleConfidence = 10;
    }

    // 3. Abstract Extraction
    let abstract = '';
    let abstractConfidence = 0;
    const abstractIndex = cleanText.search(/\b(abstract|summary)\b/i);
    if (abstractIndex !== -1) {
      // Extract following text block up to Introduction
      const searchBlock = cleanText.substring(abstractIndex + 8).trim();
      const introIndex = searchBlock.search(/\b(introduction|1\.\s+introduction|keywords|key\s+words)\b/i);
      
      if (introIndex !== -1) {
        abstract = searchBlock.substring(0, introIndex).trim();
        abstractConfidence = 90;
      } else {
        // Just extract the next 200 words
        const words = searchBlock.split(/\s+/).slice(0, 200).join(' ');
        abstract = words;
        abstractConfidence = 70;
      }
      
      // Clean leading characters like colons, spaces
      abstract = abstract.replace(/^[:\s\-]+/, '');
    }

    // Fall back to first 300 characters of page content if abstract keyword is missing
    if (!abstract && cleanText.trim().length > 30) {
      const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
      // Skip the title/author header block (lines 0 to 4)
      const textBlock = lines.slice(4, 15).join(' ');
      if (textBlock.trim().length > 50) {
        abstract = textBlock.substring(0, 350).trim() + '...';
        abstractConfidence = 45;
      } else if (cleanText.length > 30) {
        abstract = cleanText.substring(0, 350).trim() + '...';
        abstractConfidence = 30;
      }
    }

    // 4. Keywords Extraction
    let keywords = [];
    let keywordsConfidence = 0;
    const keywordsRegex = /\b(?:keywords|key\s+words)[:\s\-]+([^\n.]+)/i;
    const keywordsMatch = cleanText.match(keywordsRegex);
    if (keywordsMatch) {
      keywords = keywordsMatch[1].split(/[,;]/).map(kw => kw.trim()).filter(Boolean);
      keywordsConfidence = 95;
    }

    // 5. Year Extraction
    let year = new Date().getFullYear();
    let yearConfidence = 10;
    
    // Check PDF Info Metadata
    if (info.CreationDate && info.CreationDate.length >= 4) {
      const yearStr = info.CreationDate.match(/\d{4}/);
      if (yearStr) {
        year = parseInt(yearStr[0]);
        yearConfidence = 90;
      }
    }
    
    if (yearConfidence < 90) {
      // Look for 4-digit numbers in the first 15 lines
      const yearRegex = /\b(19\d{2}|20\d{2})\b/;
      for (const line of firstLines) {
        const match = line.match(yearRegex);
        if (match) {
          year = parseInt(match[1]);
          yearConfidence = 75;
          break;
        }
      }
    }

    // 6. Authors Extraction
    let authors = [];
    let authorsConfidence = 0;
    
    if (info.Author && info.Author.trim() && !/pdf/i.test(info.Author) && info.Author.trim().length > 3) {
      authors = info.Author.split(/[,;&]|\band\b/).map(name => name.trim()).filter(Boolean);
      authorsConfidence = 90;
    } else {
      // Find author lines near the title (usually immediately following the title)
      const titleIdx = firstLines.findIndex(l => l.includes(title) || title.includes(l));
      let authorLine = '';
      if (titleIdx !== -1 && firstLines[titleIdx + 1]) {
        authorLine = firstLines[titleIdx + 1];
      } else if (firstLines.length > 1) {
        authorLine = firstLines[1];
      }

      if (authorLine && authorLine.length > 5 && !/abstract/i.test(authorLine)) {
        authors = authorLine.split(/[,;&]|\band\b/).map(name => name.trim()).filter(Boolean);
        authorsConfidence = 70;
      }
    }

    // 7. ISBN / ISSN
    let isbn = '';
    let isbnConfidence = 0;
    const isbnRegex = /\b(?:ISBN(?:-10|-13)?\s*)?(?:[0-9Xx]-?){10,13}\b/i;
    const isbnMatch = cleanText.match(isbnRegex);
    if (isbnMatch) {
      isbn = isbnMatch[0];
      isbnConfidence = 100;
    }

    let issn = '';
    let issnConfidence = 0;
    const issnRegex = /\b\d{4}-\d{3}[\dXx]\b/i;
    const issnMatch = cleanText.match(issnRegex);
    if (issnMatch) {
      issn = issnMatch[0];
      issnConfidence = 100;
    }

    // 8. Journal/Publisher heuristic
    let journal = '';
    let journalConfidence = 0;
    const journalRegex = /\b(journal|proceedings|transactions|letters|reviews|annals)\s+of\s+([a-z\s]+)\b/i;
    const journalMatch = cleanText.match(journalRegex);
    if (journalMatch) {
      journal = journalMatch[0];
      journalConfidence = 80;
    } else {
      // Check first line
      if (firstLines.length > 0 && /journal|ieee|acm|nature|science|springer|elsevier/i.test(firstLines[0])) {
        journal = firstLines[0];
        journalConfidence = 60;
      }
    }

    return {
      title: { value: title, confidence: titleConfidence },
      authorsList: { value: authors, confidence: authorsConfidence },
      abstract: { value: abstract, confidence: abstractConfidence },
      keywords: { value: keywords, confidence: keywordsConfidence },
      doi: { value: doi, confidence: doiConfidence },
      isbn: { value: isbn, confidence: isbnConfidence },
      issn: { value: issn, confidence: issnConfidence },
      year: { value: year, confidence: yearConfidence },
      journal: { value: journal, confidence: journalConfidence },
      publisher: { value: journalConfidence > 60 ? 'Publisher Detected' : '', confidence: Math.max(0, journalConfidence - 20) },
      language: { value: 'English', confidence: 95 }
    };
  }
}

module.exports = new MetadataExtractionService();
