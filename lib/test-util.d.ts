declare const tUtil:ITUtil;

export interface ITUtil {
  hideUrlTail(url: string):string;
  buildFiles(ctx: string|array):Promise<any>;
}

export default tUtil;