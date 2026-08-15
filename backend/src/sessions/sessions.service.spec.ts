import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { DRIZZLE } from '../database/database.module';
import { SynthesisService } from '../recordings/synthesis.service';

const LIST_COLUMNS = [
  'id',
  'userId',
  'title',
  'status',
  'duration',
  'frameCount',
  'urlCount',
  'agentTarget',
  'seedUrl',
  'processingTime',
  'promptStatus',
  'createdAt',
  'updatedAt',
];

const BLOB_COLUMNS = [
  'prompt',
  'analysis',
  'inspectionJson',
  'processingStatus',
  'notes',
  'lastError',
  'promptError',
  'urls',
  'inspectionDurationMs',
];

describe('SessionsService.findAllByUser', () => {
  let service: SessionsService;
  let mockLimit: jest.Mock;
  let mockSelect: jest.Mock;

  beforeEach(async () => {
    mockLimit = jest.fn().mockResolvedValue([]);
    const mockOrderBy = jest
      .fn()
      .mockImplementation(() =>
        Object.assign(Promise.resolve([]), { limit: mockLimit }),
      );
    const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
    mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: DRIZZLE, useValue: { select: mockSelect } },
        { provide: SynthesisService, useValue: {} },
      ],
    }).compile();

    service = module.get(SessionsService);
  });

  it('selects metadata columns and omits blob fields', async () => {
    await service.findAllByUser('user_1');

    expect(mockSelect).toHaveBeenCalledTimes(1);
    const calls = mockSelect.mock.calls as [Record<string, unknown>][];
    const cols = calls[0][0];
    expect(Object.keys(cols).sort()).toEqual([...LIST_COLUMNS].sort());
    for (const blob of BLOB_COLUMNS) {
      expect(cols).not.toHaveProperty(blob);
    }
    expect(mockLimit).not.toHaveBeenCalled();
  });

  it('applies limit when provided', async () => {
    await service.findAllByUser('user_1', 5);
    expect(mockLimit).toHaveBeenCalledWith(5);
  });
});
