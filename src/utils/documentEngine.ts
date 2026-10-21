import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import {
  MergeFileItem,
  MergeSettings,
  RotationAngle,
} from '../types/merger';
import {
  calculateImageFitRect,
  calculatePageDimensions,
  classifyFileKind,
  formatFileSize,
  getMarginPoints,
  parsePageRange,
} from './mergeLogic';

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function renderStyledDocumentThumbnail(opts: {
  title: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  lines: string[];
  pageCount?: number;
}): string {
  const canvas = document.createElement('canvas');
  canvas.width = 420;
  canvas.height = 560;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle top bar
  ctx.fillStyle = opts.accentColor;
  ctx.fillRect(0, 0, canvas.width, 10);

  // Header block
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(28, 32, canvas.width - 56, 76);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 32, canvas.width - 56, 76);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(opts.title.slice(0, 32), 44, 64);

  ctx.fillStyle = '#64748B';
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillText(`${opts.badge} · ${opts.subtitle}`, 44, 88);

  // Content lines
  let y = 142;
  for (let i = 0; i < opts.lines.length; i++) {
    const line = opts.lines[i];
    if (line.startsWith('#')) {
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(line.replace(/^#+\s*/, '').slice(0, 42), 32, y);
      y += 26;
    } else if (line === '---') {
      ctx.strokeStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.moveTo(32, y - 6);
      ctx.lineTo(canvas.width - 32, y - 6);
      ctx.stroke();
      y += 16;
    } else {
      ctx.fillStyle = '#334155';
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(line.slice(0, 48), 32, y);
      y += 22;
    }
    if (y > canvas.height - 50) break;
  }

  // Footer
  ctx.fillStyle = '#94A3B8';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText(
    opts.pageCount && opts.pageCount > 1 ? `1 / ${opts.pageCount} PAGES` : '1 PAGE',
    32,
    canvas.height - 22
  );

  return canvas.toDataURL('image/png');
}

async function generateSamplePdfBytes(): Promise<{ bytes: Uint8Array; thumb: string }> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Page 1
  const page1 = pdfDoc.addPage([595.28, 841.89]);
  page1.drawRectangle({
    x: 0,
    y: 828,
    width: 595.28,
    height: 14,
    color: rgb(0.06, 0.09, 0.16),
  });
  page1.drawText('MASTER SERVICE LEVEL AGREEMENT (SLA-2026)', {
    x: 48,
    y: 775,
    size: 18,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  });
  page1.drawText('Document Ref: OMNI-SLA-094 · Effective Date: October 2026', {
    x: 48,
    y: 752,
    size: 10,
    font: fontRegular,
    color: rgb(0.39, 0.45, 0.55),
  });

  const sections = [
    ['1. Scope of Infrastructure Operations', 'Provider guarantees 99.95% uptime across primary regional clusters with automated failover.'],
    ['2. Incident Response Benchmarks', 'Priority-1 alerts receive engineering triage within 15 minutes of telemetry detection.'],
    ['3. Data Integrity & Verification', 'Snapshots are cryptographically verified every 6 hours and retained for 90 calendar days.'],
    ['4. Quarterly Audit Deliverables', 'Consolidated PDF compliance packets are issued at the close of each fiscal quarter.'],
  ];

  let y = 700;
  for (const [heading, body] of sections) {
    page1.drawText(heading, {
      x: 48,
      y,
      size: 12,
      font: fontBold,
      color: rgb(0.06, 0.09, 0.16),
    });
    y -= 20;
    page1.drawText(body, {
      x: 48,
      y,
      size: 10.5,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.33),
    });
    y -= 38;
  }

  // Page 2
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  page2.drawText('APPENDIX A · SIGNATORY & APPROVAL SCHEDULE', {
    x: 48,
    y: 775,
    size: 16,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  });
  page2.drawText('Authorized Signatories:', {
    x: 48,
    y: 730,
    size: 12,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  });
  page2.drawText('Elena Rostova — VP of Infrastructure Engineering', {
    x: 48,
    y: 705,
    size: 11,
    font: fontRegular,
    color: rgb(0.2, 0.25, 0.33),
  });
  page2.drawText('Marcus Vance — Chief Compliance Officer', {
    x: 48,
    y: 685,
    size: 11,
    font: fontRegular,
    color: rgb(0.2, 0.25, 0.33),
  });

  const bytes = await pdfDoc.save();
  const thumb = renderStyledDocumentThumbnail({
    title: 'Q4_Service_Agreement.pdf',
    subtitle: '595 × 842 pt',
    badge: 'PDF',
    accentColor: '#0F172A',
    lines: [
      '# MASTER SERVICE LEVEL AGREEMENT',
      'Ref: OMNI-SLA-094 · Effective Oct 2026',
      '---',
      '1. Scope of Infrastructure Operations',
      '99.95% uptime across regional clusters.',
      '---',
      '2. Incident Response Benchmarks',
      'Priority-1 alerts triaged within 15m.',
      '---',
      '3. Data Integrity & Verification',
      'Cryptographic snapshots every 6 hours.',
    ],
    pageCount: 2,
  });

  return { bytes, thumb };
}

function generateSampleFloorplanJpeg(): {
  bytes: Uint8Array;
  dataUrl: string;
  width: number;
  height: number;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 680;
  const ctx = canvas.getContext('2d')!;

  // Blueprint slate-ivory background
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle architectural grid
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Outer structural frame
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  // Rooms / Zones
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(80, 80, 380, 260);
  ctx.strokeRect(80, 80, 380, 260);

  ctx.fillRect(480, 80, 400, 260);
  ctx.strokeRect(480, 80, 400, 260);

  ctx.fillRect(80, 360, 800, 180);
  ctx.strokeRect(80, 360, 800, 180);

  // Labels
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SECTOR A · TURBINE ASSEMBLY BAY', 106, 130);
  ctx.fillText('SECTOR B · METROLOGY CLEANROOM', 506, 130);
  ctx.fillText('SECTOR C · LOGISTICS & STAGING CORRIDOR', 106, 410);

  ctx.fillStyle = '#475569';
  ctx.font = '15px "JetBrains Mono", monospace';
  ctx.fillText('14.2m × 9.8m · Clear Height 6.5m · Load 25 kN/m²', 106, 162);
  ctx.fillText('ISO Class 6 · Temp 20.0°C ± 0.2°C · RH 45%', 506, 162);
  ctx.fillText('Automated AGV Track · Dual Loading Bays · Scale 1:100', 106, 442);

  // Title block at bottom right
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(540, 555, 340, 60);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillText('DWG NO: FAC-2026-REVB · SHEET 01', 560, 582);
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillText('APPROVED FOR SITE PACKAGING', 560, 602);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  return {
    bytes: dataUrlToUint8Array(dataUrl),
    dataUrl,
    width: canvas.width,
    height: canvas.height,
  };
}

function generateSampleInvoicePng(): {
  bytes: Uint8Array;
  dataUrl: string;
  width: number;
  height: number;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 920;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border frame
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

  // Header
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('COMMERCIAL INVOICE', 60, 92);

  ctx.fillStyle = '#475569';
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillText('INVOICE #INV-2026-1048 · DATE: 2026-10-21', 60, 122);
  ctx.fillText('VENDOR: NORDIC OPTICS GMBH · MUNICH', 60, 144);

  // Divider
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, 172);
  ctx.lineTo(canvas.width - 60, 172);
  ctx.stroke();

  // Table Header
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(60, 196, canvas.width - 120, 40);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText('ITEM DESCRIPTION', 76, 221);
  ctx.fillText('QTY', 430, 221);
  ctx.fillText('AMOUNT (USD)', 520, 221);

  const rows = [
    ['High-Precision Optical Sensor Array', '04', '$12,400.00'],
    ['Anodized Mounting Rail Bracket Kit', '12', '$1,860.00'],
    ['Factory Calibration & ISO Certificate', '01', '$950.00'],
    ['Insured Air Freight & Customs Handling', '01', '$420.00'],
  ];

  let y = 272;
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  for (const [desc, qty, amt] of rows) {
    ctx.fillStyle = '#1E293B';
    ctx.fillText(desc, 76, y);
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillText(qty, 434, y);
    ctx.fillText(amt, 520, y);
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    y += 46;
  }

  ctx.strokeStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.moveTo(60, y + 10);
  ctx.lineTo(canvas.width - 60, y + 10);
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillText('TOTAL DUE: $15,630.00', 385, y + 54);

  ctx.fillStyle = '#16A34A';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillText('STATUS: PAID IN FULL · WIRE REF #883920', 60, y + 54);

  const dataUrl = canvas.toDataURL('image/png');
  return {
    bytes: dataUrlToUint8Array(dataUrl),
    dataUrl,
    width: canvas.width,
    height: canvas.height,
  };
}

export async function createSampleBundle(): Promise<MergeFileItem[]> {
  const now = Date.now();
  const pdfSample = await generateSamplePdfBytes();
  const floorplan = generateSampleFloorplanJpeg();
  const invoice = generateSampleInvoicePng();

  const markdownNotes = [
    '# Executive Release & Handover Summary',
    'Prepared by: Systems Architecture Group',
    'Package ID: PKG-2026-Q4',
    '',
    '## 1. Included Package Contents',
    '- Q4 Service Level Agreement (2-page signed PDF)',
    '- Sector A/B/C Facility Floorplan Revision B (High-res JPEG)',
    '- Nordic Optics Commercial Invoice #1048 (Verified PNG)',
    '',
    '## 2. Verification Notes',
    'All structural dimensions and optical sensor serial numbers have been',
    'inspected against procurement order PO-99210. Ready for unified',
    'archival export.',
  ].join('\n');

  const mdBytes = new TextEncoder().encode(markdownNotes);
  const mdThumb = renderStyledDocumentThumbnail({
    title: 'Handover_Summary_Notes.md',
    subtitle: '13 lines · UTF-8',
    badge: 'MD',
    accentColor: '#334155',
    lines: markdownNotes.split('\n').filter(Boolean),
    pageCount: 1,
  });

  return [
    {
      id: 'sample-pdf-1',
      name: 'Q4_Service_Agreement.pdf',
      sizeBytes: pdfSample.bytes.byteLength,
      mimeType: 'application/pdf',
      category: 'pdf',
      extension: 'PDF',
      pageCount: 2,
      pageRange: 'all',
      rotation: 0,
      fitMode: 'contain',
      addedAt: now - 3000,
      thumbnailDataUrl: pdfSample.thumb,
      rawBytes: pdfSample.bytes,
      width: 595,
      height: 842,
      notes: 'Primary legal contract (2 pages)',
    },
    {
      id: 'sample-jpg-2',
      name: 'Facility_Floorplan_RevB.jpg',
      sizeBytes: floorplan.bytes.byteLength,
      mimeType: 'image/jpeg',
      category: 'image',
      extension: 'JPG',
      pageCount: 1,
      pageRange: 'all',
      rotation: 0,
      fitMode: 'contain',
      addedAt: now - 2000,
      thumbnailDataUrl: floorplan.dataUrl,
      rawBytes: floorplan.bytes,
      width: floorplan.width,
      height: floorplan.height,
      notes: 'Architectural blueprint scan',
    },
    {
      id: 'sample-png-3',
      name: 'Equipment_Invoice_1048.png',
      sizeBytes: invoice.bytes.byteLength,
      mimeType: 'image/png',
      category: 'image',
      extension: 'PNG',
      pageCount: 1,
      pageRange: 'all',
      rotation: 0,
      fitMode: 'contain',
      addedAt: now - 1000,
      thumbnailDataUrl: invoice.dataUrl,
      rawBytes: invoice.bytes,
      width: invoice.width,
      height: invoice.height,
      notes: 'Paid vendor invoice receipt',
    },
    {
      id: 'sample-md-4',
      name: 'Handover_Summary_Notes.md',
      sizeBytes: mdBytes.byteLength,
      mimeType: 'text/markdown',
      category: 'text',
      extension: 'MD',
      pageCount: 1,
      pageRange: 'all',
      rotation: 0,
      fitMode: 'contain',
      addedAt: now,
      thumbnailDataUrl: mdThumb,
      rawBytes: mdBytes,
      textContent: markdownNotes,
      width: 595,
      height: 842,
      notes: 'Cover release notes',
    },
  ];
}

async function generateMultiPagePdfDocument(
  title: string,
  docCode: string,
  numPages: number
): Promise<{ bytes: Uint8Array; thumb: string }> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let p = 1; p <= numPages; p++) {
    const page = pdfDoc.addPage([595.28, 841.89]);
    page.drawRectangle({
      x: 0,
      y: 828,
      width: 595.28,
      height: 14,
      color: rgb(0.09, 0.09, 0.11),
    });
    page.drawText(`${title.toUpperCase()} — SECTION ${p} OF ${numPages}`, {
      x: 48,
      y: 775,
      size: 15,
      font: fontBold,
      color: rgb(0.09, 0.09, 0.11),
    });
    page.drawText(`Document ID: ${docCode} · Sheet ${p}/${numPages} · Unlimited Multi-Page Stream`, {
      x: 48,
      y: 752,
      size: 10,
      font: fontRegular,
      color: rgb(0.39, 0.45, 0.55),
    });

    let y = 705;
    for (let row = 1; row <= 6; row++) {
      page.drawText(`${p}.${row} Verification Clause & Technical Specification Block`, {
        x: 48,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.09, 0.09, 0.11),
      });
      y -= 18;
      page.drawText(
        `Verified telemetry and structural tolerances for subsystem module #${p}0${row} pass all ISO benchmarks.`,
        {
          x: 48,
          y,
          size: 10,
          font: fontRegular,
          color: rgb(0.25, 0.28, 0.35),
        }
      );
      y -= 34;
    }
  }

  const bytes = await pdfDoc.save();
  const thumb = renderStyledDocumentThumbnail({
    title,
    subtitle: `${numPages} pages · 595 × 842 pt`,
    badge: 'PDF',
    accentColor: '#18181B',
    lines: [
      `# ${title}`,
      `Doc Ref: ${docCode} · ${numPages} Full Pages`,
      '---',
      '1. Complete Multi-Page Vector Stream',
      'All pages preserved with zero page cap.',
      '---',
      '2. Lossless Page Extraction & Slicing',
      'Supports custom ranges or full document.',
    ],
    pageCount: numPages,
  });

  return { bytes, thumb };
}

/**
 * Generates a 12-file multi-format batch (with multi-page PDFs up to 6 pages each)
 * so users can test merging >10 files (up to 20 max) with unlimited pages per file.
 */
export async function createExtendedSampleBatch(): Promise<MergeFileItem[]> {
  const baseFour = await createSampleBundle();
  const now = Date.now();

  const specPdf = await generateMultiPagePdfDocument(
    '05_System_Architecture_Spec.pdf',
    'SPEC-2026-V5',
    5
  );
  const auditPdf = await generateMultiPagePdfDocument(
    '06_Quarterly_Security_Audit.pdf',
    'AUD-2026-Q4',
    4
  );
  const compliancePdf = await generateMultiPagePdfDocument(
    '07_ISO_Compliance_Certificates.pdf',
    'ISO-9001-CERT',
    6
  );
  const addendumPdf = await generateMultiPagePdfDocument(
    '08_Vendor_Procurement_Addendum.pdf',
    'PROC-ADD-08',
    3
  );

  const floorplan = generateSampleFloorplanJpeg();
  const invoice = generateSampleInvoicePng();

  const extraItems: MergeFileItem[] = [
    {
      id: `batch-pdf-5-${now}`,
      name: '05_System_Architecture_Spec.pdf',
      sizeBytes: specPdf.bytes.byteLength,
      mimeType: 'application/pdf',
      category: 'pdf',
      extension: 'PDF',
      pageCount: 5,
      pageRange: 'all',
      rotation: 0,
      fitMode: 'contain',
      addedAt: now + 10,
      thumbnailDataUrl: specPdf.thumb,
      rawBytes: specPdf.bytes,
      width: 595,
      height: 842,
    },
    {
      id: `batch-pdf-6-${now}`,
      name: '06_Quarterly_Security_Audit.pdf',
      sizeBytes: auditPdf.bytes.byteLength,
      mimeType: 'application/pdf',
      category: 'pdf',
      extension: 'PDF',
      pageCount: 4,
      pageRange: 'all',
      rotation: 0,
      fitMode: 'contain',
      addedAt: now + 20,
      thumbnailDataUrl: auditPdf.thumb,
      rawBytes: auditPdf.bytes,
      width: 595,
      height: 842,
    },
    {
      id: `batch-pdf-7-${now}`,
      name: '07_ISO_Compliance_Certificates.pdf',
      sizeBytes: compliancePdf.bytes.byteLength,
      mimeType: 'application/pdf',
      category: 'pdf',
      extension: 'PDF',
      pageCount: 6,
      pageRange: 'all',
      rotation: 0,
      fitMode: 'contain',
      addedAt: now + 30,
      thumbnailDataUrl: compliancePdf.thumb,
      rawBytes: compliancePdf.bytes,
      width: 595,
      height: 842,
    },
    {
      id: `batch-jpg-8-${now}`,
      name: '08_Sector_B_Cleanroom_Layout.jpg',
      sizeBytes: floorplan.bytes.byteLength,
      mimeType: 'image/jpeg',
      category: 'image',
      extension: 'JPG',
      pageCount: 1,
      pageRange: 'all',
      rotation: 0,
      fitMode: 'contain',
      addedAt: now + 40,
      thumbnailDataUrl: floorplan.dataUrl,
      rawBytes: floorplan.bytes,
      width: floorplan.width,
      height: floorplan.height,
    },
    {
      id: `batch-png-9-${now}`,
      name: '09_Customs_Clearance_Voucher.png',
      sizeBytes: invoice.bytes.byteLength,
      mimeType: 'image/png',
      category: 'image',
      extension: 'PNG',
      pageCount: 1,
      pageRange: 'all',
      rotation: 0,
      fitMode: 'contain',
      addedAt: now + 50,
      thumbnailDataUrl: invoice.dataUrl,
      rawBytes: invoice.bytes,
      width: invoice.width,
      height: invoice.height,
    },
    {
      id: `batch-pdf-10-${now}`,
      name: '10_Vendor_Procurement_Addendum.pdf',
      sizeBytes: addendumPdf.bytes.byteLength,
      mimeType: 'application/pdf',
      category: 'pdf',
      extension: 'PDF',
      pageCount: 3,
      pageRange: 'all',
      rotation: 0,
      fitMode: 'contain',
      addedAt: now + 60,
      thumbnailDataUrl: addendumPdf.thumb,
      rawBytes: addendumPdf.bytes,
      width: 595,
      height: 842,
    },
    createCustomTextDocumentItem(
      '11_Deployment_Signoff_Checklist.md',
      '# Deployment Sign-Off Checklist\nAll 12 project files verified for unified compilation.\n\n## Verification Matrix\n- Hardware telemetry: Nominal\n- Optical calibration: Verified\n- Customs & freight: Cleared'
    ),
    createCustomTextDocumentItem(
      '12_Final_Release_Manifest.md',
      '# Final Release Manifest\nThis package combines 12 distinct multi-format files (PDFs, JPEGs, PNGs, and Markdown notes) with unlimited pages per file into a single unified deliverable.'
    ),
  ];

  return [...baseFour, ...extraItems];
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export async function parseUploadedFile(file: File): Promise<MergeFileItem> {
  const buffer = await file.arrayBuffer();
  const rawBytes = new Uint8Array(buffer);
  const { category, extension } = classifyFileKind(file.name, file.type);
  const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  if (category === 'pdf') {
    let pageCount = 1;
    let width = 595;
    let height = 842;
    try {
      const pdfDoc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
      pageCount = Math.max(1, pdfDoc.getPageCount());
      const firstPage = pdfDoc.getPage(0);
      const size = firstPage.getSize();
      width = Math.round(size.width);
      height = Math.round(size.height);
    } catch {
      pageCount = 1;
    }

    const thumb = renderStyledDocumentThumbnail({
      title: file.name,
      subtitle: `${width} × ${height} pt · ${formatFileSize(file.size)}`,
      badge: 'PDF',
      accentColor: '#0F172A',
      lines: [
        `# ${file.name}`,
        `Source format: Portable Document Format`,
        '---',
        `Detected pages: ${pageCount} (No page limit)`,
        `Page dimensions: ${width} × ${height} pt`,
        `File size: ${formatFileSize(file.size)}`,
        '---',
        'All vector pages copied losslessly',
        'into the unified output package.',
      ],
      pageCount,
    });

    return {
      id,
      name: file.name,
      sizeBytes: file.size,
      mimeType: file.type || 'application/pdf',
      category: 'pdf',
      extension: 'PDF',
      pageCount,
      pageRange: 'all',
      rotation: 0,
      fitMode: 'contain',
      addedAt: Date.now(),
      thumbnailDataUrl: thumb,
      rawBytes,
      width,
      height,
    };
  }

  if (category === 'image') {
    const blob = new Blob([rawBytes], { type: file.type || 'image/png' });
    const objectUrl = URL.createObjectURL(blob);
    try {
      const img = await loadImageElement(objectUrl);
      const canvas = document.createElement('canvas');
      const maxDim = 900;
      const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
      canvas.width = Math.max(1, Math.round((img.width || 600) * scale));
      canvas.height = Math.max(1, Math.round((img.height || 400) * scale));
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');

      return {
        id,
        name: file.name,
        sizeBytes: file.size,
        mimeType: file.type || 'image/png',
        category: 'image',
        extension,
        pageCount: 1,
        pageRange: 'all',
        rotation: 0,
        fitMode: 'contain',
        addedAt: Date.now(),
        thumbnailDataUrl: dataUrl,
        rawBytes,
        width: img.width || canvas.width,
        height: img.height || canvas.height,
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  // Text / Markdown / CSV / JSON / Code
  const textContent = new TextDecoder().decode(rawBytes);
  const lines = textContent.split(/\r?\n/);
  const pageCount = Math.max(1, Math.ceil(lines.length / 42));
  const thumb = renderStyledDocumentThumbnail({
    title: file.name,
    subtitle: `${lines.length} lines · ${formatFileSize(file.size)}`,
    badge: extension,
    accentColor: '#334155',
    lines: lines.slice(0, 14),
    pageCount,
  });

  return {
    id,
    name: file.name,
    sizeBytes: file.size,
    mimeType: file.type || 'text/plain',
    category: 'text',
    extension,
    pageCount,
    pageRange: 'all',
    rotation: 0,
    fitMode: 'contain',
    addedAt: Date.now(),
    thumbnailDataUrl: thumb,
    rawBytes,
    textContent,
    width: 595,
    height: 842,
  };
}

export function createCustomTextDocumentItem(title: string, body: string): MergeFileItem {
  const safeTitle = title.trim() || 'Untitled_Note.md';
  const filename = safeTitle.includes('.') ? safeTitle : `${safeTitle}.md`;
  const rawBytes = new TextEncoder().encode(body);
  const lines = body.split(/\r?\n/);
  const pageCount = Math.max(1, Math.ceil(lines.length / 42));
  const thumb = renderStyledDocumentThumbnail({
    title: filename,
    subtitle: `${lines.length} lines · Custom Note`,
    badge: 'MD',
    accentColor: '#334155',
    lines: lines.slice(0, 14),
    pageCount,
  });

  return {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: filename,
    sizeBytes: rawBytes.byteLength,
    mimeType: 'text/markdown',
    category: 'text',
    extension: 'MD',
    pageCount,
    pageRange: 'all',
    rotation: 0,
    fitMode: 'contain',
    addedAt: Date.now(),
    thumbnailDataUrl: thumb,
    rawBytes,
    textContent: body,
    width: 595,
    height: 842,
    notes: 'Custom authored note page',
  };
}

async function renderRotatedImageToPngBytes(
  dataUrl: string,
  rotation: RotationAngle,
  quality: number
): Promise<{ pngBytes: Uint8Array; width: number; height: number; previewUrl: string }> {
  const img = await loadImageElement(dataUrl);
  const swapDims = rotation === 90 || rotation === 270;
  const w = swapDims ? img.height : img.width;
  const h = swapDims ? img.width : img.height;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, w);
  canvas.height = Math.max(1, h);
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();

  const outUrl = canvas.toDataURL('image/png', quality);
  return {
    pngBytes: dataUrlToUint8Array(outUrl),
    width: canvas.width,
    height: canvas.height,
    previewUrl: outUrl,
  };
}

/**
 * Generates visual preview canvases for the Live Inspector for all pages (no page limit per file).
 */
export async function renderCompositePreviewPages(
  items: MergeFileItem[],
  settings: MergeSettings
): Promise<string[]> {
  if (items.length === 0) return [];

  if (settings.outputFormat === 'stitched-png' || settings.outputFormat === 'stitched-jpeg') {
    const stitched = await buildStitchedCanvas(items, settings);
    return [stitched.toDataURL('image/png')];
  }

  const pages: string[] = [];
  const pageDims = calculatePageDimensions(settings.pageSize, settings.orientation);
  const marginPt = getMarginPoints(settings.margin);

  // Optional Table of Contents Cover Page (supports up to 20 files cleanly)
  if (settings.includeTableOfContents) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(pageDims.width);
    canvas.height = Math.round(pageDims.height);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, 12);

    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(settings.documentTitle || 'Unified Document Package', 48, 68);

    ctx.fillStyle = '#64748B';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText(
      `Author: ${settings.documentAuthor || 'OmniFuse'} · ${items.length} Combined Source Files`,
      48,
      92
    );

    ctx.strokeStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(48, 108);
    ctx.lineTo(canvas.width - 48, 108);
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('INDEXED CONTENTS (UP TO 20 FILES · UNLIMITED PAGES)', 48, 134);

    let y = 162;
    const rowStep = items.length > 12 ? 28 : 32;
    items.forEach((item, idx) => {
      const selectedPages = parsePageRange(item.pageRange, item.pageCount);
      ctx.fillStyle = '#0F172A';
      ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${String(idx + 1).padStart(2, '0')}. ${item.name.slice(0, 38)}`, 48, y);

      ctx.fillStyle = '#64748B';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(
        `${item.extension} · ${selectedPages.length}p · ${formatFileSize(item.sizeBytes)}`,
        canvas.width - 210,
        y
      );
      y += rowStep;
    });

    if (settings.watermarkText.trim()) {
      drawCanvasWatermark(ctx, canvas.width, canvas.height, settings.watermarkText);
    }

    pages.push(canvas.toDataURL('image/png'));
  }

  // Render every selected page for every file with zero page limit per file
  for (const item of items) {
    const selectedPages = parsePageRange(item.pageRange, item.pageCount);
    let cachedImg: HTMLImageElement | null = null;
    try {
      const rotated = await renderRotatedImageToPngBytes(
        item.thumbnailDataUrl,
        item.rotation,
        settings.imageQuality
      );
      cachedImg = await loadImageElement(rotated.previewUrl);
    } catch {
      cachedImg = null;
    }

    for (let pIdx = 0; pIdx < selectedPages.length; pIdx++) {
      const pageNumberInSource = selectedPages[pIdx] + 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(pageDims.width);
      canvas.height = Math.round(pageDims.height);
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = settings.backgroundColor || '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (cachedImg) {
        const boxW = Math.max(40, canvas.width - marginPt * 2);
        const boxH = Math.max(
          40,
          canvas.height - marginPt * 2 - (settings.includePageNumbers ? 24 : 0)
        );
        const fit = calculateImageFitRect(
          cachedImg.width,
          cachedImg.height,
          boxW,
          boxH,
          item.fitMode
        );
        ctx.drawImage(cachedImg, marginPt + fit.x, marginPt + fit.y, fit.width, fit.height);
      } else {
        ctx.fillStyle = '#334155';
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(item.name, marginPt, marginPt + 30);
      }

      if (item.pageCount > 1) {
        ctx.fillStyle = '#475569';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(
          `${item.name} — Source Page ${pageNumberInSource} of ${item.pageCount}`,
          marginPt,
          22
        );
      }

      if (settings.watermarkText.trim()) {
        drawCanvasWatermark(ctx, canvas.width, canvas.height, settings.watermarkText);
      }

      pages.push(canvas.toDataURL('image/png'));
    }
  }

  // Stamp unified page numbers
  if (settings.includePageNumbers && pages.length > 0) {
    const numberedPages: string[] = [];
    for (let i = 0; i < pages.length; i++) {
      const img = await loadImageElement(pages[i]);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = '#64748B';
      ctx.font = '11px "JetBrains Mono", monospace';
      const label = `Page ${i + 1} of ${pages.length}`;
      const metrics = ctx.measureText(label);
      ctx.fillText(label, (canvas.width - metrics.width) / 2, canvas.height - 16);
      numberedPages.push(canvas.toDataURL('image/png'));
    }
    return numberedPages;
  }

  return pages;
}

function drawCanvasWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string
) {
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 5);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.09)';
  ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text.toUpperCase(), 0, 0);
  ctx.restore();
}

async function buildStitchedCanvas(
  items: MergeFileItem[],
  settings: MergeSettings
): Promise<HTMLCanvasElement> {
  const renderedImages: HTMLImageElement[] = [];
  for (const item of items) {
    const rotated = await renderRotatedImageToPngBytes(
      item.thumbnailDataUrl,
      item.rotation,
      settings.imageQuality
    );
    const img = await loadImageElement(rotated.previewUrl);
    renderedImages.push(img);
  }

  const gap = Math.max(0, settings.stitchSpacingPx);
  const pad = Math.max(16, gap);
  const canvas = document.createElement('canvas');

  if (settings.stitchDirection === 'horizontal') {
    const targetH = 680;
    const scaled = renderedImages.map((img) => {
      const s = targetH / Math.max(1, img.height);
      return { img, w: Math.round(img.width * s), h: targetH };
    });
    const totalW = scaled.reduce((acc, cur) => acc + cur.w, 0) + gap * Math.max(0, scaled.length - 1) + pad * 2;
    canvas.width = Math.max(300, totalW);
    canvas.height = targetH + pad * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = settings.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x = pad;
    for (const s of scaled) {
      ctx.drawImage(s.img, x, pad, s.w, s.h);
      x += s.w + gap;
    }
    return canvas;
  }

  if (settings.stitchDirection === 'grid-2col') {
    const colW = 520;
    const cols = 2;
    const rows = Math.ceil(renderedImages.length / cols);
    const cellH = 640;
    canvas.width = cols * colW + (cols - 1) * gap + pad * 2;
    canvas.height = Math.max(300, rows * cellH + Math.max(0, rows - 1) * gap + pad * 2);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = settings.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    renderedImages.forEach((img, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cellX = pad + col * (colW + gap);
      const cellY = pad + row * (cellH + gap);
      const fit = calculateImageFitRect(img.width, img.height, colW, cellH, 'contain');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(cellX, cellY, colW, cellH);
      ctx.drawImage(img, cellX + fit.x, cellY + fit.y, fit.width, fit.height);
    });
    return canvas;
  }

  // Default: vertical continuous stitch
  const targetW = 780;
  const scaled = renderedImages.map((img) => {
    const s = targetW / Math.max(1, img.width);
    return { img, w: targetW, h: Math.round(img.height * s) };
  });
  const totalH = scaled.reduce((acc, cur) => acc + cur.h, 0) + gap * Math.max(0, scaled.length - 1) + pad * 2;
  canvas.width = targetW + pad * 2;
  canvas.height = Math.max(300, totalH);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = settings.backgroundColor || '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let y = pad;
  for (const s of scaled) {
    ctx.drawImage(s.img, pad, y, s.w, s.h);
    y += s.h + gap;
  }
  return canvas;
}

async function generateMergedPdfBytes(
  items: MergeFileItem[],
  settings: MergeSettings
): Promise<{ pdfBytes: Uint8Array; totalPages: number }> {
  const mergedPdf = await PDFDocument.create();
  mergedPdf.setTitle(settings.documentTitle || 'Unified Document Package');
  mergedPdf.setAuthor(settings.documentAuthor || 'OmniFuse Studio');
  mergedPdf.setCreator('OmniFuse Studio Desktop Merger');

  const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const fontMono = await mergedPdf.embedFont(StandardFonts.Courier);

  const stdDims = calculatePageDimensions(settings.pageSize, settings.orientation);
  const marginPt = getMarginPoints(settings.margin);

  // 1. Optional Table of Contents page
  if (settings.includeTableOfContents && items.length > 0) {
    const tocPage = mergedPdf.addPage([stdDims.width, stdDims.height]);
    tocPage.drawRectangle({
      x: 0,
      y: stdDims.height - 12,
      width: stdDims.width,
      height: 12,
      color: rgb(0.06, 0.09, 0.16),
    });

    tocPage.drawText(settings.documentTitle || 'Unified Document Package', {
      x: 48,
      y: stdDims.height - 68,
      size: 20,
      font: fontBold,
      color: rgb(0.06, 0.09, 0.16),
    });

    tocPage.drawText(
      `Prepared by: ${settings.documentAuthor || 'OmniFuse Studio'} · Files Combined: ${items.length}`,
      {
        x: 48,
        y: stdDims.height - 92,
        size: 10,
        font: fontMono,
        color: rgb(0.39, 0.45, 0.55),
      }
    );

    let y = stdDims.height - 140;
    items.forEach((item, index) => {
      if (y < 72) return;
      const selected = parsePageRange(item.pageRange, item.pageCount);
      tocPage.drawText(`${String(index + 1).padStart(2, '0')}. ${item.name}`, {
        x: 48,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.06, 0.09, 0.16),
      });
      tocPage.drawText(
        `${item.extension} · ${selected.length} page(s) · ${formatFileSize(item.sizeBytes)}`,
        {
          x: stdDims.width - 220,
          y,
          size: 9.5,
          font: fontMono,
          color: rgb(0.39, 0.45, 0.55),
        }
      );
      y -= 26;
    });
  }

  // 2. Process each item in queue order
  for (const item of items) {
    if (item.category === 'pdf' && item.rawBytes) {
      try {
        const srcDoc = await PDFDocument.load(item.rawBytes, { ignoreEncryption: true });
        const indices = parsePageRange(item.pageRange, srcDoc.getPageCount());
        const copiedPages = await mergedPdf.copyPages(srcDoc, indices);
        for (const cp of copiedPages) {
          if (item.rotation !== 0) {
            const currentRot = cp.getRotation().angle;
            cp.setRotation(degrees((currentRot + item.rotation) % 360));
          }
          mergedPdf.addPage(cp);
        }
        continue;
      } catch {
        // Fallback to image embedding if source PDF is malformed
      }
    }

    if (item.category === 'image') {
      const rotated = await renderRotatedImageToPngBytes(
        item.thumbnailDataUrl,
        item.rotation,
        settings.imageQuality
      );
      const embeddedImg = await mergedPdf.embedPng(rotated.pngBytes);
      const pageDims = calculatePageDimensions(
        settings.pageSize,
        settings.orientation,
        rotated.width,
        rotated.height
      );
      const page = mergedPdf.addPage([pageDims.width, pageDims.height]);

      const availW = Math.max(50, pageDims.width - marginPt * 2);
      const availH = Math.max(
        50,
        pageDims.height - marginPt * 2 - (settings.includePageNumbers ? 24 : 0)
      );
      const fit = calculateImageFitRect(
        rotated.width,
        rotated.height,
        availW,
        availH,
        item.fitMode
      );

      page.drawImage(embeddedImg, {
        x: marginPt + fit.x,
        y: marginPt + (settings.includePageNumbers ? 20 : 0) + fit.y,
        width: fit.width,
        height: fit.height,
      });
      continue;
    }

    // Text / Markdown / Code files
    const rawText = item.textContent || new TextDecoder().decode(item.rawBytes || new Uint8Array());
    const allLines = rawText.split(/\r?\n/);
    const linesPerPage = 42;
    const totalTextPages = Math.max(1, Math.ceil(allLines.length / linesPerPage));
    const selectedIndices = parsePageRange(item.pageRange, totalTextPages);

    for (const pageIdx of selectedIndices) {
      const page = mergedPdf.addPage([stdDims.width, stdDims.height]);
      const slice = allLines.slice(pageIdx * linesPerPage, (pageIdx + 1) * linesPerPage);

      page.drawText(`${item.name} (Page ${pageIdx + 1}/${totalTextPages})`, {
        x: Math.max(36, marginPt),
        y: stdDims.height - Math.max(36, marginPt),
        size: 9.5,
        font: fontMono,
        color: rgb(0.4, 0.45, 0.55),
      });

      let y = stdDims.height - Math.max(36, marginPt) - 28;
      for (const rawLine of slice) {
        const cleanLine = rawLine.replace(/[^\x20-\x7E]/g, ' ');
        const isHeading = cleanLine.startsWith('#');
        page.drawText(cleanLine.replace(/^#+\s*/, '').slice(0, 88), {
          x: Math.max(36, marginPt),
          y,
          size: isHeading ? 13 : 10.5,
          font: isHeading ? fontBold : fontRegular,
          color: isHeading ? rgb(0.06, 0.09, 0.16) : rgb(0.18, 0.22, 0.3),
        });
        y -= isHeading ? 20 : 15;
        if (y < 48) break;
      }
    }
  }

  // 3. Apply unified page numbers & watermark across all pages
  const allPages = mergedPdf.getPages();
  const totalPages = allPages.length;
  const watermark = settings.watermarkText.trim().toUpperCase();

  allPages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    if (settings.includePageNumbers) {
      const label = `Page ${idx + 1} of ${totalPages}`;
      const textWidth = fontMono.widthOfTextAtSize(label, 9.5);
      page.drawText(label, {
        x: (width - textWidth) / 2,
        y: 18,
        size: 9.5,
        font: fontMono,
        color: rgb(0.39, 0.45, 0.55),
      });
    }

    if (watermark) {
      page.drawText(watermark, {
        x: width * 0.22,
        y: height * 0.45,
        size: 38,
        font: fontBold,
        color: rgb(0.82, 0.85, 0.9),
        rotate: degrees(32),
        opacity: 0.28,
      });
    }
  });

  const pdfBytes = await mergedPdf.save();
  return { pdfBytes, totalPages };
}

export async function executeUnifiedMerge(
  items: MergeFileItem[],
  settings: MergeSettings
): Promise<{
  filename: string;
  downloadUrl: string;
  sizeBytes: number;
  totalPages: number;
  previewPages: string[];
}> {
  const cleanBase = (settings.outputFilename || 'unified-document-package')
    .trim()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-');

  const previewPages = await renderCompositePreviewPages(items, settings);

  if (settings.outputFormat === 'stitched-png' || settings.outputFormat === 'stitched-jpeg') {
    const isJpeg = settings.outputFormat === 'stitched-jpeg';
    const mime = isJpeg ? 'image/jpeg' : 'image/png';
    const ext = isJpeg ? 'jpg' : 'png';
    const stitchedCanvas = await buildStitchedCanvas(items, settings);
    const dataUrl = stitchedCanvas.toDataURL(mime, settings.imageQuality);
    const bytes = dataUrlToUint8Array(dataUrl);
    const blob = new Blob([bytes], { type: mime });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      filename: `${cleanBase}.${ext}`,
      downloadUrl,
      sizeBytes: bytes.byteLength,
      totalPages: 1,
      previewPages,
    };
  }

  if (settings.outputFormat === 'zip-bundle') {
    const zip = new JSZip();
    const { pdfBytes, totalPages } = await generateMergedPdfBytes(items, settings);
    zip.file(`${cleanBase}-merged.pdf`, pdfBytes);

    const manifestLines = [
      `# ${settings.documentTitle || 'Unified Document Package'}`,
      `Generated by: ${settings.documentAuthor || 'OmniFuse Studio'}`,
      `Timestamp: ${new Date().toISOString()}`,
      `Total Source Files: ${items.length}`,
      `Unified PDF Pages: ${totalPages}`,
      '',
      '## Included Files',
      ...items.map(
        (item, i) =>
          `${i + 1}. **${item.name}** (${item.extension} · ${item.pageCount}p · ${formatFileSize(item.sizeBytes)})`
      ),
    ];
    zip.file('MANIFEST.md', manifestLines.join('\n'));

    const sourcesFolder = zip.folder('source-files');
    items.forEach((item, idx) => {
      const prefix = String(idx + 1).padStart(2, '0');
      if (item.rawBytes && sourcesFolder) {
        sourcesFolder.file(`${prefix}_${item.name}`, item.rawBytes);
      } else if (item.thumbnailDataUrl && sourcesFolder) {
        sourcesFolder.file(
          `${prefix}_${item.name}.png`,
          uint8ToBase64(dataUrlToUint8Array(item.thumbnailDataUrl)),
          { base64: true }
        );
      }
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(zipBlob);
    return {
      filename: `${cleanBase}.zip`,
      downloadUrl,
      sizeBytes: zipBlob.size,
      totalPages,
      previewPages,
    };
  }

  // Default: Master Unified PDF
  const { pdfBytes, totalPages } = await generateMergedPdfBytes(items, settings);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  return {
    filename: `${cleanBase}.pdf`,
    downloadUrl,
    sizeBytes: pdfBytes.byteLength,
    totalPages,
    previewPages,
  };
}
