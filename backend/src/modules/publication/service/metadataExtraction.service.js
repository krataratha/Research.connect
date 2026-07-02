const PDFParser = require('pdf2json');
const { PdfReader } = require('pdfreader');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');
const natural = require('natural');
const nlp = require('compromise');
const stopword = require('stopword');
const logger = require('../../../common/logger/winston');

const log = logger || console;

const TAXONOMY = {
  'Artificial Intelligence': ['artificial intelligence', 'ai', 'intelligent agent', 'heuristics', 'cognitive science', 'reasoning'],
  'Machine Learning': ['machine learning', 'supervised', 'unsupervised', 'reinforcement learning', 'classification', 'regression', 'clustering', 'random forest', 'svm', 'decision tree'],
  'Deep Learning': ['deep learning', 'neural network', 'cnn', 'rnn', 'lstm', 'transformer', 'backpropagation', 'gan', 'autoencoder', 'resnet', 'bert', 'gpt', 'llm'],
  'Natural Language Processing': ['nlp', 'natural language', 'text mining', 'sentiment analysis', 'tokenization', 'pos tagging', 'named entity recognition', 'ner', 'translation', 'word2vec'],
  'Computer Vision': ['computer vision', 'image processing', 'object detection', 'segmentation', 'ocr', 'facial recognition', 'opencv', 'image classification'],
  'Cyber Security': ['cyber security', 'cryptography', 'encryption', 'firewall', 'malware', 'phishing', 'vulnerability', 'penetration testing', 'intrusion detection', 'ransomware'],
  'Robotics': ['robotics', 'robot', 'automation', 'kinematics', 'actuator', 'sensor fusion', 'ros', 'path planning', 'manipulator'],
  'Blockchain': ['blockchain', 'smart contract', 'cryptocurrency', 'bitcoin', 'ethereum', 'distributed ledger', 'consensus algorithm', 'solidity'],
  'Cloud Computing': ['cloud computing', 'aws', 'azure', 'serverless', 'virtualization', 'saas', 'paas', 'iaas', 'kubernetes', 'docker', 'cloud native'],
  'Healthcare': ['healthcare', 'medical', 'clinical', 'patient', 'electronic health record', 'ehr', 'diagnostics', 'telemedicine', 'therapeutics'],
  'IoT': ['iot', 'internet of things', 'smart home', 'sensor network', 'embedded system', 'rfid', 'edge computing', 'actuators'],
  'Bioinformatics': ['bioinformatics', 'genomics', 'sequencing', 'protein folding', 'dna', 'rna', 'alignment', 'phylogenetic', 'proteomics'],
  'Algorithms': ['algorithm', 'sorting', 'complexity', 'graph theory', 'data structure', 'optimization', 'dynamic programming', 'computability']
};

class MetadataExtractionService {
  /**
   * Main entry point to extract metadata from file buffer
   */
  async extractMetadata(fileBuffer, originalName, mimeType) {
    const ext = originalName ? originalName.substring(originalName.lastIndexOf('.')).toLowerCase() : '';
    let text = '';
    let pdfMetadata = {};
    let methodUsed = 'none';

    try {
      if (fileBuffer && (ext === '.pdf' || mimeType === 'application/pdf')) {
        // Priority 1: pdf-parse
        try {
          const parsed = await this._parsePdf(fileBuffer);
          text = parsed.text || '';
          pdfMetadata = parsed.metadata || {};
          methodUsed = 'pdf-parse';
        } catch (e) {
          log.warn('[METADATA EXTRACTION]: pdf-parse failed, trying pdf2json...');
        }

        // Priority 2: pdf2json
        if (text.trim().length < 150) {
          try {
            const parsed = await this._parsePdf2Json(fileBuffer);
            text = parsed.text || '';
            pdfMetadata = { ...pdfMetadata, ...parsed.metadata };
            methodUsed = 'pdf2json';
          } catch (e) {
            log.warn('[METADATA EXTRACTION]: pdf2json failed, trying pdfreader...');
          }
        }

        // Priority 3: pdfreader
        if (text.trim().length < 150) {
          try {
            const parsed = await this._parsePdfReader(fileBuffer);
            text = parsed.text || '';
            methodUsed = 'pdfreader';
          } catch (e) {
            log.warn('[METADATA EXTRACTION]: pdfreader failed.');
          }
        }
      } else if (fileBuffer && (ext === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        text = await this._parseDocx(fileBuffer);
        methodUsed = 'mammoth';
      } else if (fileBuffer && (ext === '.txt' || mimeType === 'text/plain')) {
        text = fileBuffer.toString('utf8');
        methodUsed = 'text';
      }
    } catch (parseError) {
      log.error('[METADATA PARSE EXCEPTION]:', parseError);
    }

    // Safe OCR fallback check (for scanned PDFs)
    if (text.trim().length < 150 && fileBuffer && (ext === '.pdf' || mimeType === 'application/pdf')) {
      log.warn('[METADATA EXTRACTION]: Scanned PDF detected (text length < 150). Extracting images and running OCR...');
      try {
        const ocrText = await this._runOcrOnPdf(fileBuffer);
        if (ocrText && ocrText.trim().length > 50) {
          text = ocrText;
          methodUsed = 'tesseract-ocr';
        }
      } catch (ocrOuterError) {
        log.error('[OCR EXCEPTION]:', ocrOuterError);
      }
    }

    // 1. Clean the parsed text
    const cleanedText = this._cleanText(text);

    // 2. Extract fields
    const extracted = this._extractFields(cleanedText, pdfMetadata, originalName);

    // 3. Extract keywords
    const keywordsInfo = this._extractKeywords(cleanedText);
    extracted.keywords = { value: keywordsInfo.keywords, confidence: keywordsInfo.confidence };

    // 4. Match Research Areas
    const areasInfo = this._matchResearchAreas(keywordsInfo.keywords, cleanedText);
    extracted.researchAreas = { value: areasInfo.areas, confidence: areasInfo.confidence };

    // Add extra details
    extracted.methodUsed = methodUsed;

    return extracted;
  }

  /**
   * PDF Parser (pdf-parse)
   */
  async _parsePdf(buffer) {
    const { PDFParse } = require('pdf-parse');
    const pdf = new PDFParse(buffer);
    const textData = await pdf.getText();
    let info = {};
    try {
      const infoData = await pdf.getInfo();
      info = infoData.info || {};
    } catch (e) {
      log.warn('[METADATA EXTRACTION]: failed to get info from pdf-parse: ' + e.message);
    }
    return {
      text: textData.text || '',
      metadata: info
    };
  }

  /**
   * PDF Parser (pdf2json)
   */
  _parsePdf2Json(buffer) {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", pdfData => {
        let text = '';
        pdfData.Pages.forEach(page => {
          page.Texts.forEach(t => {
            let decoded = '';
            try {
              decoded = decodeURIComponent(t.R[0].T);
            } catch (e) {
              try {
                decoded = unescape(t.R[0].T);
              } catch (err) {
                decoded = t.R[0].T;
              }
            }
            text += decoded + ' ';
          });
        });
        resolve({ text, metadata: pdfData.Meta || {} });
      });
      pdfParser.parseBuffer(buffer);
    });
  }

  /**
   * PDF Parser (pdfreader)
   */
  _parsePdfReader(buffer) {
    return new Promise((resolve, reject) => {
      let text = '';
      new PdfReader().parseBuffer(buffer, (err, item) => {
        if (err) {
          reject(err);
        } else if (!item) {
          resolve({ text });
        } else if (item.text) {
          text += item.text + ' ';
        }
      });
    });
  }

  /**
   * DOCX Parser
   */
  async _parseDocx(buffer) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  /**
   * Extract DCTDecode (JPEG) images directly from PDF stream and run OCR
   */
  async _runOcrOnPdf(buffer) {
    const images = [];
    let pos = 0;

    // Scan for DCTDecode (standard JPEG compression in PDFs)
    while (images.length < 3) {
      const idx = buffer.indexOf('DCTDecode', pos);
      if (idx === -1) break;
      
      const streamStart = buffer.indexOf('stream', idx);
      if (streamStart === -1) break;
      
      let start = streamStart + 6;
      if (buffer[start] === 13) start++; // carriage return
      if (buffer[start] === 10) start++; // line feed
      
      const streamEnd = buffer.indexOf('endstream', start);
      if (streamEnd === -1) break;
      
      const imgBuffer = buffer.subarray(start, streamEnd);
      if (imgBuffer.length > 10000) { // Keep only larger images (likely pages, not tiny icons)
        images.push(imgBuffer);
      }
      pos = streamEnd;
    }

    if (images.length === 0) {
      log.warn('[OCR]: No raw DCTDecode JPEG images found in scanned PDF.');
      return '';
    }

    // Run Tesseract OCR on the first page image
    log.info(`[OCR]: Running Tesseract on first extracted image (${images[0].length} bytes)...`);
    
    // Set a maximum timeout so OCR won't block the API indefinitely
    const ocrPromise = (async () => {
      const { data: { text } } = await Tesseract.recognize(
        images[0],
        'eng',
        { 
          logger: m => {} 
        }
      );
      return text;
    })();

    return await Promise.race([
      ocrPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('OCR Timeout')), 9000))
    ]);
  }

  /**
   * Clean text using specific rules
   */
  _cleanText(text) {
    if (!text) return '';
    let cleaned = text.replace(/\r\n/g, '\n');

    // Remove page headers/footers/page numbers patterns (e.g. Page 1 of 10, Journal name headers, etc.)
    cleaned = cleaned.replace(/^\s*(page|pg\.?)\s*\d+\s*(of\s*\d+)?\s*$/gim, '');
    cleaned = cleaned.replace(/^\s*\d+\s*$/gm, ''); // alone page numbers

    // Normalize unicode and remove duplicate spaces
    cleaned = cleaned.replace(/[^\x00-\x7F]/g, " "); // Replace non-ascii with spaces
    cleaned = cleaned.replace(/[ \t]+/g, ' '); // Combine spaces/tabs
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive linebreaks
    cleaned = cleaned.replace(/-\n/g, ''); // Join hyphenated linebreaks

    return cleaned.trim();
  }

  /**
   * Extract fields using robust regex and heuristics
   */
  _extractFields(text, info = {}, originalName = '') {
    const firstLines = text.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 20);
    
    // 1. DOI Extraction
    let doi = '';
    let doiConfidence = 0;
    const doiRegex = /\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+\b/i;
    const doiMatch = text.match(doiRegex);
    if (doiMatch) {
      doi = doiMatch[0];
      doiConfidence = 100;
    }

    // 2. Title Extraction
    let title = '';
    let titleConfidence = 0;
    if (info.Title && info.Title.trim() && !/untitled/i.test(info.Title) && !/pdf/i.test(info.Title) && info.Title.trim().length > 10) {
      title = info.Title.trim();
      titleConfidence = 95;
    } else {
      const potentialTitles = firstLines.filter(line => {
        if (line.length < 15 || line.length > 200) return false;
        if (/http|www|email|@/i.test(line)) return false;
        if (/volume|issue|pages|journal|proceedings|editor|conference|issn|isbn/i.test(line)) return false;
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
    const abstractIndex = text.search(/\b(abstract|summary)\b/i);
    if (abstractIndex !== -1) {
      const searchBlock = text.substring(abstractIndex + 8).trim();
      const introIndex = searchBlock.search(/\b(introduction|1\.\s+introduction|keywords|key\s+words|1\.0\s+introduction)\b/i);
      
      if (introIndex !== -1) {
        abstract = searchBlock.substring(0, introIndex).trim();
        abstractConfidence = 90;
      } else {
        const words = searchBlock.split(/\s+/).slice(0, 200).join(' ');
        abstract = words;
        abstractConfidence = 70;
      }
      abstract = abstract.replace(/^[:\s\-]+/, '');
    }

    if (!abstract && text.trim().length > 30) {
      const textBlock = firstLines.slice(4, 15).join(' ');
      if (textBlock.trim().length > 50) {
        abstract = textBlock.substring(0, 350).trim() + '...';
        abstractConfidence = 45;
      } else {
        abstract = text.substring(0, 350).trim() + '...';
        abstractConfidence = 30;
      }
    }

    // 4. Emails & ORCID Extraction
    const emails = [];
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
    let match;
    while ((match = emailRegex.exec(text)) !== null) {
      if (!emails.includes(match[0].toLowerCase())) {
        emails.push(match[0].toLowerCase());
      }
    }

    const orcids = [];
    const orcidRegex = /\b\d{4}-\d{4}-\d{4}-\d{3}[0-9Xx]\b/g;
    while ((match = orcidRegex.exec(text)) !== null) {
      if (!orcids.includes(match[0])) {
        orcids.push(match[0]);
      }
    }

    // 5. Authors & Affiliations
    let authors = [];
    let authorsConfidence = 0;
    if (info.Author && info.Author.trim() && !/pdf/i.test(info.Author) && info.Author.trim().length > 3) {
      authors = info.Author.split(/[,;&]|\band\b/).map(name => name.trim()).filter(Boolean);
      authorsConfidence = 90;
    } else {
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

    // 6. ISBN & ISSN
    let isbn = '';
    const isbnRegex = /\b(?:ISBN(?:-10|-13)?\s*)?(?:[0-9Xx]-?){10,13}\b/i;
    const isbnMatch = text.match(isbnRegex);
    if (isbnMatch) isbn = isbnMatch[0];

    let issn = '';
    const issnRegex = /\b\d{4}-\d{3}[\dXx]\b/i;
    const issnMatch = text.match(issnRegex);
    if (issnMatch) issn = issnMatch[0];

    // 7. Publication Year
    let year = new Date().getFullYear();
    let yearConfidence = 15;
    if (info.CreationDate && info.CreationDate.length >= 4) {
      const yearStr = info.CreationDate.match(/\d{4}/);
      if (yearStr) {
        year = parseInt(yearStr[0]);
        yearConfidence = 90;
      }
    }
    if (yearConfidence < 90) {
      const yearRegex = /\b(19\d{2}|20\d{2})\b/;
      for (const line of firstLines) {
        const m = line.match(yearRegex);
        if (m) {
          year = parseInt(m[1]);
          yearConfidence = 75;
          break;
        }
      }
    }

    // 8. Journal/Conference/Publisher Heuristics
    let journal = '';
    let journalConfidence = 0;
    let publisher = '';

    const journalRegex = /\b(journal|proceedings|transactions|letters|reviews|annals)\s+of\s+([a-z\s]+)\b/i;
    const journalMatch = text.match(journalRegex);
    if (journalMatch) {
      journal = journalMatch[0];
      journalConfidence = 85;
    }

    const publisherRegex = /\b(springer|ieee|acm|elsevier|nature|science|mdpi|wiley|taylor\s*&\s*francis)\b/i;
    const publisherMatch = text.match(publisherRegex);
    if (publisherMatch) {
      publisher = publisherMatch[0].toUpperCase();
    } else {
      publisher = journalConfidence > 60 ? 'Publisher Detected' : '';
    }

    // 9. Volume, Issue, Pages
    let volume = '';
    let issue = '';
    let pages = '';

    const volMatch = text.match(/\bvol\.?\s*(\d+)\b/i);
    if (volMatch) volume = volMatch[1];

    const issueMatch = text.match(/\b(?:issue|no\.?)\s*(\d+)\b/i);
    if (issueMatch) issue = issueMatch[1];

    const pagesMatch = text.match(/\bpp\.?\s*(\d+)\s*[-–]\s*(\d+)\b/i);
    if (pagesMatch) pages = `${pagesMatch[1]}-${pagesMatch[2]}`;

    // 10. Funding & References Count
    let funding = '';
    const grantMatch = text.match(/\b(?:grant|funding|funded\s+by|supported\s+by|grant\s+number)\s+([a-z0-9\-\s]{5,100})/i);
    if (grantMatch) funding = grantMatch[0];

    let citationCount = 0;
    const citeMatch = text.match(/\bcited\s+by\s+(\d+)\b/i);
    if (citeMatch) citationCount = parseInt(citeMatch[1]);

    const refIndex = text.toLowerCase().lastIndexOf('references');
    let references = [];
    if (refIndex !== -1) {
      const refBlock = text.substring(refIndex + 10);
      references = refBlock.split('\n').map(l => l.trim()).filter(l => l.length > 15).slice(0, 15);
    }

    return {
      title: { value: title, confidence: titleConfidence },
      authorsList: { value: authors, confidence: authorsConfidence },
      abstract: { value: abstract, confidence: abstractConfidence },
      doi: { value: doi, confidence: doiConfidence },
      isbn: { value: isbn, confidence: isbn ? 100 : 0 },
      issn: { value: issn, confidence: issn ? 100 : 0 },
      year: { value: year, confidence: yearConfidence },
      journal: { value: journal, confidence: journalConfidence },
      publisher: { value: publisher, confidence: publisher ? 80 : 0 },
      volume: { value: volume, confidence: volume ? 80 : 0 },
      issue: { value: issue, confidence: issue ? 80 : 0 },
      pages: { value: pages, confidence: pages ? 80 : 0 },
      language: { value: 'English', confidence: 95 },
      emails: { value: emails, confidence: emails.length > 0 ? 100 : 0 },
      orcids: { value: orcids, confidence: orcids.length > 0 ? 100 : 0 },
      funding: { value: funding, confidence: funding ? 70 : 0 },
      references: { value: references, confidence: references.length > 0 ? 80 : 0 },
      citationCount: { value: citationCount, confidence: citationCount ? 70 : 0 }
    };
  }

  /**
   * Keyword Extraction using TF-IDF / Stopword frequency
   */
  _extractKeywords(text) {
    if (!text) return { keywords: [], confidence: 0 };

    // Clean text and tokenize
    const words = text.toLowerCase().match(/\b[a-z]{4,20}\b/g) || [];
    
    // Remove stop words
    const filtered = stopword.removeStopwords(words);

    if (filtered.length === 0) return { keywords: [], confidence: 0 };

    // Term Frequency counting
    const freqMap = {};
    filtered.forEach(word => {
      freqMap[word] = (freqMap[word] || 0) + 1;
    });

    // Sort by frequency
    const sorted = Object.keys(freqMap).sort((a, b) => freqMap[b] - freqMap[a]);
    const topKeywords = sorted.slice(0, 8);

    return {
      keywords: topKeywords,
      confidence: Math.min(100, 50 + topKeywords.length * 6)
    };
  }

  /**
   * Research Area matching based on Taxonomy
   */
  _matchResearchAreas(keywords, text) {
    const scores = {};
    const textLower = text.toLowerCase();

    Object.keys(TAXONOMY).forEach(area => {
      let score = 0;
      const terms = TAXONOMY[area];

      // Match against extracted keywords
      keywords.forEach(kw => {
        if (terms.includes(kw)) score += 3;
      });

      // Match against full text frequency
      terms.forEach(term => {
        const regex = new RegExp('\\b' + term + '\\b', 'g');
        const count = (textLower.match(regex) || []).length;
        score += count * 0.5;
      });

      if (score > 0) {
        scores[area] = score;
      }
    });

    // Sort areas by score
    const matched = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    const topAreas = matched.slice(0, 3);

    return {
      areas: topAreas,
      confidence: topAreas.length > 0 ? Math.min(100, Math.round(scores[topAreas[0]] * 5)) : 0
    };
  }
}

module.exports = new MetadataExtractionService();
