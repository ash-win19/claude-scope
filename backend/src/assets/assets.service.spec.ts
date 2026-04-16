import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { AssetStorageService } from './asset-storage.service';
import { DRIZZLE } from '../database/database.module';

const mockInsertReturning = jest.fn();
const mockInsertValues = jest.fn().mockReturnValue({ returning: mockInsertReturning });
const mockInsert = jest.fn().mockReturnValue({ values: mockInsertValues });

const mockDb = {
  insert: mockInsert,
};

describe('AssetsService', () => {
  let service: AssetsService;
  const storage = {
    write: jest.fn(),
    read: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: AssetStorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
  });

  it('removes the stored file if metadata insert fails', async () => {
    const error = new Error('fk violation');
    mockInsertReturning.mockRejectedValue(error);

    await expect(
      service.createAsset('sess_123', 'frm_123', 'thumbnail', Buffer.from('png'), 'image/png'),
    ).rejects.toThrow(error);

    expect(storage.write).toHaveBeenCalledTimes(1);
    expect(storage.remove).toHaveBeenCalledTimes(1);
    expect(storage.remove).toHaveBeenCalledWith(expect.stringMatching(/^sess_123\/ast_[a-f0-9]{8}\.png$/));
  });
});
