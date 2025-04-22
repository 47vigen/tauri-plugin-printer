import { Jobs, Printer, ResponseResult, PrintFileOptions } from "./types";
export type * from "./types";
/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
export declare const getPrinters: (id?: string | null) => Promise<Printer[]>;
/**
 * Print File.
 * @params first_param: File Path, second_param: Print Setting
 * @returns A process status.
 */
export declare const printFile: (options: PrintFileOptions) => Promise<ResponseResult>;
/**
 * Get all jobs.
 * @returns A array of all printer jobs.
 */
export declare const getJobs: (printerid?: string | null) => Promise<Jobs[]>;
/**
 * Get job by id.
 * @returns Printer job.
 */
export declare const getJob: (jobid: string) => Promise<Jobs | null>;
/**
 * Restart jobs.
 * @param jobid
 */
export declare const restartJob: (jobid?: string | null) => Promise<ResponseResult>;
/**
 * Resume jobs.
 * @param jobid
 */
export declare const resumeJob: (jobid?: string | null) => Promise<ResponseResult>;
/**
 * Pause jobs.
 * @param jobid
 */
export declare const pauseJob: (jobid?: string | null) => Promise<ResponseResult>;
/**
 * Remove jobs.
 * @param jobid
 */
export declare const removeJob: (jobid?: string | null) => Promise<ResponseResult>;
