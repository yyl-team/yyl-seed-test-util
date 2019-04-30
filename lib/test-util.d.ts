declare const tUtil:ITUtil;

interface ITUtil {
  hideUrlTail(url: string):string;
  buildFiles(ctx: string | string[]): Promise<any>;
  frag: IFrag;
  initPlugins(plugins: string[], iPath: string): Promise<any>;
  parseConfig(configPath: string): object;
  server: IServer;
}

interface IFrag {
  path: any;
  init(iPath: string): Promise<any>;
  build(): Promise<any>;
  destroy(): Promise<any>;
}

interface IServer {
  start(root: string, port: number): Promise<any>;
  getAppSync(): any;
  use(middleware: any): void;
  abort(): Promise<any>;
}

export = tUtil;