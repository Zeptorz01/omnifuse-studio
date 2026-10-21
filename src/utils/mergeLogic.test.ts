import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyFileKind,
  formatFileSize,
  parsePageRange,
  rotateClockwise,
  calculatePageDimensions,
  calculateImageFitRect,
  moveQueueItem,
  filterQueueItems,
  calculateQueueMetrics,
  MAX_QUEUE_FILES,
  enforceQueueLimit,
} from './mergeLogic';
import { MergeFileItem } from '../types/merger';

test('classifyFileKind identifies PDF, JPEG, PNG, and text files accurately', () => {
  assert.deepEqual(classifyFileKind('contract-v2.pdf', 'application/pdf'), {
    category: 'pdf',
    extension: 'PDF',
  });
  assert.deepEqual(classifyFileKind('scan_01.jpeg', 'image/jpeg'), {
    category: 'image',
    extension: 'JPG',
  });
  assert.deepEqual(classifyFileKind('diagram.png', 'image/png'), {
    category: 'image',
    extension: 'PNG',
  });
  assert.deepEqual(classifyFileKind('notes.md', 'text/markdown'), {
    category: 'text',
    extension: 'MD',
  });
});

test('formatFileSize formats bytes, KB, and MB with tabular clarity', () => {
  assert.equal(formatFileSize(0), '0 B');
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(2048), '2.0 KB');
  assert.equal(formatFileSize(1048576 * 2.5), '2.50 MB');
});

test('parsePageRange resolves all, ranges, and comma-separated page indices with no page limit', () => {
  assert.deepEqual(parsePageRange('all', 4), [0, 1, 2, 3]);
  assert.deepEqual(parsePageRange('1-2, 4', 5), [0, 1, 3]);
  assert.deepEqual(parsePageRange('3-1', 4), [0, 1, 2]);
  assert.deepEqual(parsePageRange('99', 3), [0, 1, 2]);
  const hundredPages = parsePageRange('all', 120);
  assert.equal(hundredPages.length, 120);
  assert.equal(hundredPages[119], 119);
});

test('rotateClockwise cycles through 0, 90, 180, 270', () => {
  assert.equal(rotateClockwise(0), 90);
  assert.equal(rotateClockwise(90), 180);
  assert.equal(rotateClockwise(180), 270);
  assert.equal(rotateClockwise(270), 0);
});

test('calculatePageDimensions handles portrait and landscape orientation', () => {
  const portrait = calculatePageDimensions('letter', 'portrait');
  assert.equal(portrait.width, 612);
  assert.equal(portrait.height, 792);

  const landscape = calculatePageDimensions('letter', 'landscape');
  assert.equal(landscape.width, 792);
  assert.equal(landscape.height, 612);
});

test('calculateImageFitRect scales contain and cover properly', () => {
  const rect = calculateImageFitRect(1000, 500, 500, 500, 'contain');
  assert.equal(rect.width, 500);
  assert.equal(rect.height, 250);
  assert.equal(rect.x, 0);
  assert.equal(rect.y, 125);
});

test('moveQueueItem reorders array items without mutating original array', () => {
  const original = ['a', 'b', 'c', 'd'];
  const moved = moveQueueItem(original, 0, 2);
  assert.deepEqual(moved, ['b', 'c', 'a', 'd']);
  assert.deepEqual(original, ['a', 'b', 'c', 'd']);
});

test('filterQueueItems and calculateQueueMetrics compute accurate totals', () => {
  const sampleItems: MergeFileItem[] = [
    {
      id: '1',
      name: 'Service_Agreement.pdf',
      sizeBytes: 120000,
      mimeType: 'application/pdf',
      category: 'pdf',
      extension: 'PDF',
      pageCount: 3,
      pageRange: '1-2',
      rotation: 0,
      fitMode: 'contain',
      addedAt: 1,
      thumbnailDataUrl: '',
    },
    {
      id: '2',
      name: 'Site_Inspection.jpg',
      sizeBytes: 80000,
      mimeType: 'image/jpeg',
      category: 'image',
      extension: 'JPG',
      pageCount: 1,
      pageRange: 'all',
      rotation: 90,
      fitMode: 'contain',
      addedAt: 2,
      thumbnailDataUrl: '',
    },
  ];

  const filtered = filterQueueItems(sampleItems, 'inspection', 'all');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, '2');

  const metrics = calculateQueueMetrics(sampleItems, true);
  assert.equal(metrics.totalFiles, 2);
  assert.equal(metrics.totalSelectedPages, 4); // 2 from PDF + 1 from JPG + 1 TOC page
  assert.equal(metrics.totalSizeBytes, 200000);
});

test('enforceQueueLimit allows >10 files up to 20 maximum with unlimited pages per file', () => {
  assert.equal(MAX_QUEUE_FILES, 20);
  const existing = Array.from({ length: 12 }, (_, i) => ({ id: `f-${i + 1}` }));
  const incoming = Array.from({ length: 10 }, (_, i) => ({ id: `new-${i + 1}` }));

  const res = enforceQueueLimit(existing, incoming);
  assert.equal(res.nextItems.length, 20);
  assert.equal(res.addedCount, 8);
  assert.equal(res.rejectedCount, 2);
  assert.equal(res.limitReached, true);
});

