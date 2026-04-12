export interface TempWorkspace {
  basePath: string;
  videoPath: string;
  framesDir: string;
}

export interface IRecordingStorage {
  createWorkspace(
    requestId: string,
    videoBuffer: Buffer,
    extension: string,
  ): Promise<TempWorkspace>;

  writeFrame(
    workspace: TempWorkspace,
    filename: string,
    data: Buffer,
  ): Promise<string>;

  readFile(filePath: string): Promise<Buffer>;

  cleanup(workspace: TempWorkspace): Promise<void>;
}

export const RECORDING_STORAGE = Symbol('RECORDING_STORAGE');
