import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { RecordingsService } from './recordings.service';
import { DRIZZLE } from '../database/database.module';
import { FrameExtractionService } from './frame-extraction.service';
import { VisionService } from './vision.service';
import { VisionTimelineService } from './vision-timeline.service';
import { PlaywrightService } from './playwright.service';
import { SynthesisService } from './synthesis.service';
import { AssetsService } from '../assets/assets.service';
import { CredentialsService } from '../credentials/credentials.service';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  mkdtempSync: jest.fn().mockReturnValue('/tmp/cs-recording-test'),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn().mockReturnValue(Buffer.from('fake-image')),
  rmSync: jest.fn(),
}));

const mockInsertReturning = jest.fn();
const mockInsertValues = jest.fn().mockReturnValue({ returning: mockInsertReturning });
const mockInsert = jest.fn().mockReturnValue({ values: mockInsertValues });
const mockUpdateSet = jest.fn().mockReturnValue({ where: jest.fn() });
const mockUpdate = jest.fn().mockReturnValue({ set: mockUpdateSet });
const mockSelectLimit = jest.fn().mockResolvedValue([{ processingStatus: null }]);
const mockSelectWhere = jest.fn().mockReturnValue({ limit: mockSelectLimit });
const mockSelectFrom = jest.fn().mockReturnValue({ where: mockSelectWhere });
const mockSelect = jest.fn().mockReturnValue({ from: mockSelectFrom });

const mockDb = {
  insert: mockInsert,
  update: mockUpdate,
  select: mockSelect,
};

function createMocks() {
  const mockFrameExtraction = {
    extractFrames: jest.fn().mockResolvedValue([
      { filePath: '/tmp/frame0.png', timestampMs: 0 },
      { filePath: '/tmp/frame1.png', timestampMs: 3000 },
    ]),
  };

  const mockVision = {
    isAvailable: jest.fn().mockReturnValue(true),
    analyzeFrames: jest.fn().mockResolvedValue([
      { success: true, elements: [{ type: 'button', label: 'Submit', state: '' }] },
      { success: true, elements: [{ type: 'input', label: 'Email', state: '' }] },
    ]),
  };

  const mockTimeline = {
    buildTimeline: jest.fn().mockReturnValue({
      summary: 'Test summary',
      durationMs: 6000,
      frameCount: 2,
      failedFrames: 0,
      events: [],
    }),
  };

  const mockPlaywright = {
    isAvailable: jest.fn().mockReturnValue(true),
    inspectUrls: jest.fn().mockResolvedValue({
      urlsInspected: ['https://example.com'],
      snapshots: [{
        url: 'https://example.com',
        ariaTree: 'root\n  button "Submit"',
        counts: { buttons: 1, inputs: 1, links: 0, headings: 1, images: 0, total: 3 },
        success: true,
      }],
      durationMs: 500,
    }),
  };

  const mockSynthesis = {
    synthesize: jest.fn().mockReturnValue({
      prompt: '# Test Prompt',
      summary: 'Test summary',
      urlsInspected: ['https://example.com'],
    }),
  };

  const mockAssetsService = {
    createAsset: jest.fn().mockResolvedValue({
      id: 'ast_test0001',
      storageKey: 'test/ast_test0001.png',
      mimeType: 'image/png',
      byteSize: 1024,
    }),
  };

  const mockCredentialsService = {
    getDecryptedKeyForProvider: jest.fn().mockResolvedValue(null),
  };

  return {
    mockFrameExtraction,
    mockVision,
    mockTimeline,
    mockPlaywright,
    mockSynthesis,
    mockAssetsService,
    mockCredentialsService,
  };
}

const mockFile = {
  buffer: Buffer.from('fake-video'),
  size: 1024,
  mimetype: 'video/webm',
} as Express.Multer.File;

const mockDto = {
  title: 'Test Recording',
  seedUrl: 'https://example.com',
  notes: 'Test notes',
  agentTarget: 'CLAUDE_CODE' as const,
};

describe('RecordingsService', () => {
  let service: RecordingsService;
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(async () => {
    jest.clearAllMocks();
    mocks = createMocks();

    // Default: db insert returns a valid frame row
    mockInsertReturning.mockResolvedValue([{
      id: 'frm_TEST0001',
      sessionId: 'sess_TEST0001',
      timestamp: 0,
      url: 'https://example.com',
      thumbnailUrl: 'data:image/png;base64,fake',
      diffSummary: { added: 0, changed: 0, removed: 0 },
      ariaTree: [],
      createdAt: new Date(),
    }]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordingsService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: FrameExtractionService, useValue: mocks.mockFrameExtraction },
        { provide: VisionService, useValue: mocks.mockVision },
        { provide: VisionTimelineService, useValue: mocks.mockTimeline },
        { provide: PlaywrightService, useValue: mocks.mockPlaywright },
        { provide: SynthesisService, useValue: mocks.mockSynthesis },
        { provide: AssetsService, useValue: mocks.mockAssetsService },
        { provide: CredentialsService, useValue: mocks.mockCredentialsService },
      ],
    }).compile();

    service = module.get<RecordingsService>(RecordingsService);
  });

  it('should process upload end-to-end (happy path)', async () => {
    const result = await service.processUpload('user_1', mockFile, mockDto);

    expect(mocks.mockVision.analyzeFrames).toHaveBeenCalled();
    expect(mocks.mockPlaywright.inspectUrls).toHaveBeenCalledWith([mockDto.seedUrl]);

    expect(result.status).toBe('complete');
    expect(result.promptStatus).toBe('not_started');
    expect(result.frames).toBeDefined();
    expect(result.frames[0]?.thumbnailUrl).toBe('/api/assets/ast_test0001');
    expect(result.inspection).toBeDefined();
    expect(result.processingMs).toBeGreaterThanOrEqual(0);
  });

  it('should throw when Playwright is unavailable', async () => {
    mocks.mockPlaywright.isAvailable.mockReturnValue(false);

    await expect(service.processUpload('user_1', mockFile, mockDto))
      .rejects.toThrow(InternalServerErrorException);

    // Verify session was updated to 'error'
    expect(mockUpdate).toHaveBeenCalled();
    const errorCall = mockUpdateSet.mock.calls.find((c: any[]) => c[0]?.status === 'error');
    expect(errorCall).toBeDefined();
    expect(errorCall![0].status).toBe('error');
  });

  it('should throw when Vision is unavailable', async () => {
    mocks.mockVision.isAvailable.mockReturnValue(false);

    await expect(service.processUpload('user_1', mockFile, mockDto))
      .rejects.toThrow(InternalServerErrorException);
  });

  it('should throw when Playwright inspectUrls rejects', async () => {
    mocks.mockPlaywright.inspectUrls.mockRejectedValue(new Error('browser crashed'));

    await expect(service.processUpload('user_1', mockFile, mockDto))
      .rejects.toThrow(InternalServerErrorException);

    // Verify the error message was propagated to the session
    const errorCall = mockUpdateSet.mock.calls.find((c: any[]) => c[0]?.lastError);
    expect(errorCall).toBeDefined();
    expect(errorCall![0].lastError).toContain('browser crashed');
  });

  it('should throw when all vision frames fail', async () => {
    mocks.mockVision.analyzeFrames.mockResolvedValue([
      { success: false, elements: [], error: 'API error' },
      { success: false, elements: [], error: 'API error' },
    ]);

    await expect(service.processUpload('user_1', mockFile, mockDto))
      .rejects.toThrow(InternalServerErrorException);

    const errorCall = mockUpdateSet.mock.calls.find((c: any[]) => c[0]?.lastError?.includes('Vision analysis failed'));
    expect(errorCall).toBeDefined();
    expect(errorCall![0].lastError).toContain('Vision analysis failed for all');
  });

  it('should succeed with partial vision frame failures', async () => {
    mocks.mockVision.analyzeFrames.mockResolvedValue([
      { success: true, elements: [{ type: 'button', label: 'OK', state: '' }] },
      { success: false, elements: [], error: 'timeout' },
    ]);

    const result = await service.processUpload('user_1', mockFile, mockDto);

    expect(result.status).toBe('complete');
  });
});
