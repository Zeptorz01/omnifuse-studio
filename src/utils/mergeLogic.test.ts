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
  STUDIO_THEMES,
  getStudioThemeById,
  STUDIO_APP_ICONS,
  getStudioAppIconById,
  applyThemeWithoutChangingAppIcon,
  DEFAULT_STUDIO_PREFERENCES,
  clampBatchCount,
  stepBatchCount,
  cycleBatchPresetCount,
  findDuplicateQueueConflicts,
  resolveDuplicateRemoveFirstAndAdd,
  resolveDuplicateAddAgain,
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

test('parsePageRange resolves all, odd, even, ranges, and comma-separated page indices with no page limit', () => {
  assert.deepEqual(parsePageRange('all', 4), [0, 1, 2, 3]);
  assert.deepEqual(parsePageRange('odd', 6), [0, 2, 4]);
  assert.deepEqual(parsePageRange('even', 6), [1, 3, 5]);
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

test('enforceQueueLimit allows up to 50 files maximum with unlimited pages per file', () => {
  assert.equal(MAX_QUEUE_FILES, 50);
  const existing = Array.from({ length: 42 }, (_, i) => ({ id: `f-${i + 1}` }));
  const incoming = Array.from({ length: 12 }, (_, i) => ({ id: `new-${i + 1}` }));

  const res = enforceQueueLimit(existing, incoming);
  assert.equal(res.nextItems.length, 50);
  assert.equal(res.addedCount, 8);
  assert.equal(res.rejectedCount, 4);
  assert.equal(res.limitReached, true);
});

test('STUDIO_THEMES includes the original first theme (classic-layers) plus 10 studio themes (11 total)', () => {
  assert.equal(STUDIO_THEMES.length, 11);
  assert.equal(STUDIO_THEMES[0].id, 'classic-layers');
  assert.equal(STUDIO_THEMES[0].name, 'Original OmniFuse');
  const classic = getStudioThemeById('classic-layers');
  assert.equal(classic.iconLabel, 'Classic Stack');
  const nordic = getStudioThemeById('nordic-frost');
  assert.equal(nordic.name, 'Nordic Frost CAD');
  assert.equal(nordic.iconLabel, 'Arctic Crystal');
  const midnight = getStudioThemeById('midnight-carbon');
  assert.equal(midnight.recommendedDark, true);
  const sakura = getStudioThemeById('sakura-neon');
  assert.equal(sakura.name, 'Sakura Horizon');
  const cyberGold = getStudioThemeById('cyber-gold');
  assert.equal(cyberGold.recommendedDark, true);
});

test('Countable batch helpers step and cycle batch counts within [1, 50]', () => {
  assert.equal(clampBatchCount(0), 1);
  assert.equal(clampBatchCount(12), 12);
  assert.equal(clampBatchCount(50), 50);
  assert.equal(clampBatchCount(99), 50);

  assert.equal(stepBatchCount(12, 1), 13);
  assert.equal(stepBatchCount(12, -1), 11);
  assert.equal(stepBatchCount(50, 1), 50);
  assert.equal(stepBatchCount(1, -1), 1);

  assert.equal(cycleBatchPresetCount(12), 20);
  assert.equal(cycleBatchPresetCount(20), 35);
  assert.equal(cycleBatchPresetCount(35), 50);
  assert.equal(cycleBatchPresetCount(50), 4);
  assert.equal(cycleBatchPresetCount(4), 12);
});

test('Switching themes preserves appIconId while STUDIO_APP_ICONS allows independent app icon customization', () => {
  assert.equal(STUDIO_APP_ICONS.length, 11);
  assert.equal(DEFAULT_STUDIO_PREFERENCES.appIconId, 'classic-layers');
  assert.equal(DEFAULT_STUDIO_PREFERENCES.themeId, 'classic-layers');
  assert.equal(getStudioAppIconById('classic-layers').name, 'Original OmniFuse Stack');

  const updatedTheme = applyThemeWithoutChangingAppIcon(
    DEFAULT_STUDIO_PREFERENCES,
    'midnight-carbon',
    true
  );
  assert.equal(updatedTheme.themeId, 'midnight-carbon');
  assert.equal(updatedTheme.darkMode, true);
  assert.equal(updatedTheme.appIconId, 'classic-layers');
});

test('Duplicate File Detector detects duplicate filenames and resolves Remove First vs Add Same File Again', () => {
  const makeItem = (id: string, name: string, sizeBytes = 1024): MergeFileItem => ({
    id,
    name,
    sizeBytes,
    mimeType: 'application/pdf',
    category: 'pdf',
    extension: 'PDF',
    pageCount: 2,
    pageRange: 'all',
    rotation: 0,
    fitMode: 'contain',
    addedAt: 100,
    thumbnailDataUrl: '',
  });

  const existing = [
    makeItem('orig-1', 'Q4_Service_Agreement.pdf', 1000),
    makeItem('orig-2', 'Facility_Floorplan_RevB.jpg', 2000),
  ];
  const incomingDup = [makeItem('new-1', 'Q4_Service_Agreement.pdf', 1500)];

  const detection = findDuplicateQueueConflicts(existing, incomingDup);
  assert.equal(detection.hasDuplicates, true);
  assert.equal(detection.conflicts.length, 1);
  assert.equal(detection.conflicts[0].existingIndex, 0);
  assert.equal(detection.conflicts[0].existingItem.id, 'orig-1');

  // Option 1: Remove the first file and add this one
  const replaced = resolveDuplicateRemoveFirstAndAdd(existing, incomingDup);
  assert.equal(replaced.removedFirstCount, 1);
  assert.equal(replaced.addedCount, 1);
  assert.equal(replaced.nextItems.length, 2);
  assert.equal(replaced.nextItems[0].id, 'orig-2');
  assert.equal(replaced.nextItems[1].id, 'new-1');
  assert.equal(replaced.nextItems[1].sizeBytes, 1500);

  // Option 2: Add this same file again
  const addedAgain = resolveDuplicateAddAgain(existing, incomingDup);
  assert.equal(addedAgain.addedCount, 1);
  assert.equal(addedAgain.nextItems.length, 3);
  assert.equal(addedAgain.nextItems[0].id, 'orig-1');
  assert.equal(addedAgain.nextItems[2].name, 'Q4_Service_Agreement.pdf');
  assert.notEqual(addedAgain.nextItems[2].id, 'orig-1');
});





