'use strict';

var core = require('@tauri-apps/api/core');
var buffer = require('buffer');
var nanoid = require('nanoid');

const jobStatus = {
    512: {
        name: "Completed",
        description: "An error condition, possibly on a print job that precedes this one in the queue, blocked the print job."
    },
    4096: {
        name: "Completed",
        description: "The print job is complete, including any post-printing processing."
    },
    256: {
        name: "Deleted",
        description: "The print job was deleted from the queue, typically after printing."
    },
    4: {
        name: "Deleting",
        description: "The print job is in the process of being deleted."
    },
    2: {
        name: "Error",
        description: "The print job is in an error state."
    },
    0: {
        name: "None",
        description: "The print job has no specified state."
    },
    32: {
        name: "Offline",
        description: "The printer is offline."
    },
    64: {
        name: "PaperOut",
        description: "The printer is out of the required paper size."
    },
    1: {
        name: "Paused",
        description: "The print job is paused."
    },
    128: {
        name: "Printed",
        description: "The print job printed."
    },
    16: {
        name: "Printing",
        description: "The print job is now printing."
    },
    2048: {
        name: "Restarted",
        description: "The print job was blocked but has restarted."
    },
    8192: {
        name: "Retained",
        description: "The print job is retained in the print queue after printing."
    },
    1024: {
        name: "UserIntervention",
        description: "The printer requires user action to fix an error condition."
    },
    8: {
        name: "Spooling",
        description: "The print job is spooling."
    }
};

// Utility function to decode base64-encoded strings
const decodeBase64 = (str) => typeof atob === "function"
    ? atob(str)
    : buffer.Buffer.from(str, "base64").toString("utf-8");
// Utility function to encode strings to base64
const encodeBase64 = (str) => typeof btoa === "function" ? btoa(str) : buffer.Buffer.from(str).toString("base64");
// Utility function to parse JSON safely
const parseIfJSON = (str, defaultValue = []) => {
    try {
        return JSON.parse(str);
    }
    catch {
        return defaultValue;
    }
};

/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
const getPrinters = async (id = null) => {
    if (id != null) {
        const printername = decodeBase64(id);
        const result = await core.invoke("plugin:printer|get_printers_by_name", {
            printername
        });
        const item = parseIfJSON(result, null);
        if (item == null)
            return [];
        return [
            {
                id,
                name: item.Name,
                driver_name: item.DriverName,
                job_count: item.JobCount,
                print_processor: item.PrintProcessor,
                port_name: item.PortName,
                share_name: item.ShareName,
                computer_name: item.ComputerName,
                printer_status: item.PrinterStatus,
                shared: item.Shared,
                type: item.Type,
                priority: item.Priority
            }
        ];
    }
    const result = await core.invoke("plugin:printer|get_printers");
    const listRaw = parseIfJSON(result);
    const printers = [];
    for (let i = 0; i < listRaw.length; i++) {
        const item = listRaw[i];
        const id = encodeBase64(item.Name);
        printers.push({
            id,
            name: item.Name,
            driver_name: item.DriverName,
            job_count: item.JobCount,
            print_processor: item.PrintProcessor,
            port_name: item.PortName,
            share_name: item.ShareName,
            computer_name: item.ComputerName,
            printer_status: item.PrinterStatus,
            shared: item.Shared,
            type: item.Type,
            priority: item.Priority
        });
    }
    return printers;
};
/**
 * Print File.
 * @params first_param: File Path, second_param: Print Setting
 * @returns A process status.
 */
const printFile = async (options) => {
    if (!options.id && !options.name) {
        throw new Error("print_file require id | name as string");
    }
    if (!options.path && !options.file) {
        throw new Error("print_file require parameter path as string | file as Buffer");
    }
    let id = "";
    if (typeof options.id != "undefined") {
        id = decodeBase64(options.id);
    }
    else {
        id = options.name;
    }
    const printerSettings = {
        paper: "A4",
        method: "simplex",
        scale: "noscale",
        orientation: "portrait",
        repeat: 1
    };
    if (typeof options?.print_setting?.paper != "undefined")
        printerSettings.paper = options.print_setting.paper;
    if (typeof options?.print_setting?.method != "undefined")
        printerSettings.method = options.print_setting.method;
    if (typeof options?.print_setting?.scale != "undefined")
        printerSettings.scale = options.print_setting.scale;
    if (typeof options?.print_setting?.orientation != "undefined")
        printerSettings.orientation = options.print_setting.orientation;
    if (typeof options?.print_setting?.repeat != "undefined")
        printerSettings.repeat = options.print_setting.repeat;
    if (typeof options?.print_setting?.range != "undefined")
        printerSettings.range = options.print_setting.range;
    if (typeof options.path != "undefined") {
        if (options.path.split(".").length <= 1)
            throw new Error("File not supported");
        if (options.path.split(".").pop() != "pdf")
            throw new Error("File not supported");
    }
    let rangeStr = "";
    if (printerSettings.range) {
        if (typeof printerSettings.range == "string") {
            if (!new RegExp(/^[0-9,]+$/).test(printerSettings.range)) {
                throw new Error("Invalid range value ");
            }
            rangeStr =
                printerSettings.range[printerSettings.range.length - 1] != ","
                    ? printerSettings.range
                    : printerSettings.range.substring(0, printerSettings.range.length - 1);
        }
        else if (printerSettings.range.from) {
            rangeStr = `${printerSettings.range.from}-${printerSettings.range.to}`;
        }
    }
    const printerSettingStr = `-print-settings ${rangeStr},${printerSettings.paper},${printerSettings.method},${printerSettings.scale},${printerSettings.orientation},${printerSettings.repeat}x`;
    let tempPath = "";
    if (options.file) {
        const file = options.file instanceof buffer.Buffer ? options.file : buffer.Buffer.from(options.file);
        const fileSignature = file.subarray(0, 4).toString("hex");
        if (fileSignature != "25504446") {
            throw new Error("File not supported");
        }
        const filename = `${nanoid.nanoid()}.pdf`;
        console.log("🚀 ~ filename:", filename);
        tempPath = await core.invoke("plugin:printer|create_temp_file", {
            bufferData: file.toString("base64"),
            filename
        });
        console.log("🚀 ~ tempPath:", tempPath);
        if (!tempPath) {
            throw new Error("Fail to create temp file");
        }
    }
    const optionsParams = {
        id: `"${id}"`,
        path: tempPath ?? options.path,
        printerSetting: printerSettingStr,
        removeAfterPrint: options.remove_temp ?? true
    };
    console.log("🚀 ~ optionsParams:", optionsParams);
    await core.invoke("plugin:printer|print_pdf", optionsParams);
    return {
        success: true,
        message: "OK"
    };
};
/**
 * Get all jobs.
 * @returns A array of all printer jobs.
 */
const getJobs = async (printerid = null) => {
    const allJobs = [];
    if (printerid != null) {
        const printer = await getPrinters(printerid);
        if (printer.length == 0)
            return [];
        const result = await core.invoke("plugin:printer|get_jobs", {
            printername: printer[0].name
        });
        let listRawJobs = parseIfJSON(result, []);
        if (listRawJobs.length == undefined)
            listRawJobs = [listRawJobs];
        for (const job of listRawJobs) {
            const id = encodeBase64(`${printer[0].name}_@_${job.Id}`);
            allJobs.push({
                id,
                job_id: job.Id,
                job_status: jobStatus[job.JobStatus] != undefined
                    ? {
                        code: job.JobStatus,
                        description: jobStatus[job.JobStatus]
                            .description,
                        name: jobStatus[job.JobStatus].name
                    }
                    : {
                        code: job.JobStatus,
                        description: "Unknown Job Status",
                        name: "Unknown"
                    },
                computer_name: job.ComputerName,
                data_type: job.Datatype,
                document_name: job.DocumentName,
                job_time: job.JobTime,
                pages_printed: job.PagesPrinted,
                position: job.Position,
                printer_name: job.PrinterName,
                priority: job.Priority,
                size: job.Size,
                submitted_time: job.SubmittedTime
                    ? +job.SubmittedTime?.replace("/Date(", "")?.replace(")/", "")
                    : null,
                total_pages: job.TotalPages,
                username: job.UserName
            });
        }
        return allJobs;
    }
    const listPrinter = await getPrinters();
    for (const printer of listPrinter) {
        const result = await core.invoke("plugin:printer|get_jobs", {
            printername: printer.name
        });
        let listRawJobs = parseIfJSON(result, []);
        if (listRawJobs.length == undefined)
            listRawJobs = [listRawJobs];
        for (const job of listRawJobs) {
            const id = encodeBase64(`${printer.name}_@_${job.Id}`);
            allJobs.push({
                id,
                job_id: job.Id,
                job_status: jobStatus[job.JobStatus] != undefined
                    ? {
                        code: job.JobStatus,
                        description: jobStatus[job.JobStatus]
                            .description,
                        name: jobStatus[job.JobStatus].name
                    }
                    : {
                        code: job.JobStatus,
                        description: "Unknown Job Status",
                        name: "Unknown"
                    },
                computer_name: job.ComputerName,
                data_type: job.Datatype,
                document_name: job.DocumentName,
                job_time: job.JobTime,
                pages_printed: job.PagesPrinted,
                position: job.Position,
                printer_name: job.PrinterName,
                priority: job.Priority,
                size: job.Size,
                submitted_time: job.SubmittedTime
                    ? +job.SubmittedTime?.replace("/Date(", "")?.replace(")/", "")
                    : null,
                total_pages: job.TotalPages,
                username: job.UserName
            });
        }
    }
    return allJobs;
};
/**
 * Get job by id.
 * @returns Printer job.
 */
const getJob = async (jobid) => {
    const idextract = decodeBase64(jobid);
    const [printername = null, id = null] = idextract.split("_@_");
    const result = await core.invoke("plugin:printer|get_jobs_by_id", {
        printername: printername,
        jobid: id
    });
    const job = parseIfJSON(result, null);
    return {
        id: jobid,
        job_id: job.Id,
        job_status: jobStatus[job.JobStatus] != undefined
            ? {
                code: job.JobStatus,
                description: jobStatus[job.JobStatus].description,
                name: jobStatus[job.JobStatus].name
            }
            : {
                code: job.JobStatus,
                description: "Unknown Job Status",
                name: "Unknown"
            },
        computer_name: job.ComputerName,
        data_type: job.Datatype,
        document_name: job.DocumentName,
        job_time: job.JobTime,
        pages_printed: job.PagesPrinted,
        position: job.Position,
        printer_name: job.PrinterName,
        priority: job.Priority,
        size: job.Size,
        submitted_time: job.SubmittedTime
            ? +job.SubmittedTime?.replace("/Date(", "")?.replace(")/", "")
            : null,
        total_pages: job.TotalPages,
        username: job.UserName
    };
};
/**
 * Restart jobs.
 * @param jobid
 */
const restartJob = async (jobid = null) => {
    try {
        const result = {
            success: true,
            message: "OK"
        };
        if (jobid != null) {
            const idextract = decodeBase64(jobid);
            const [printername = null, id = null] = idextract.split("_@_");
            if (printername == null || id == null)
                throw new Error("Wrong jobid");
            await core.invoke("plugin:printer|restart_job", {
                printername,
                jobid: id.toString()
            });
            return result;
        }
        const listPrinter = await getPrinters();
        for (const printer of listPrinter) {
            const result = await core.invoke("plugin:printer|get_jobs", {
                printername: printer.name
            });
            const listRawJobs = parseIfJSON(result, []);
            for (const job of listRawJobs) {
                await core.invoke("plugin:printer|restart_job", {
                    printername: printer.name,
                    jobid: job.Id.toString()
                });
            }
        }
        return result;
    }
    catch (err) {
        return {
            success: false,
            message: err.message ? err.message : "Fail to restart job"
        };
    }
};
/**
 * Resume jobs.
 * @param jobid
 */
const resumeJob = async (jobid = null) => {
    try {
        const result = {
            success: true,
            message: "OK"
        };
        if (jobid != null) {
            const idextract = decodeBase64(jobid);
            const [printername = null, id = null] = idextract.split("_@_");
            if (printername == null || id == null)
                throw new Error("Wrong jobid");
            await core.invoke("plugin:printer|resume_job", {
                printername,
                jobid: id.toString()
            });
            return result;
        }
        const listPrinter = await getPrinters();
        for (const printer of listPrinter) {
            const result = await core.invoke("plugin:printer|get_jobs", {
                printername: printer.name
            });
            const listRawJobs = parseIfJSON(result);
            for (const job of listRawJobs) {
                await core.invoke("plugin:printer|resume_job", {
                    printername: printer.name,
                    jobid: job.Id.toString()
                });
            }
        }
        return result;
    }
    catch (err) {
        return {
            success: false,
            message: err.message ? err.message : "Fail to resume job"
        };
    }
};
/**
 * Pause jobs.
 * @param jobid
 */
const pauseJob = async (jobid = null) => {
    try {
        const result = {
            success: true,
            message: "OK"
        };
        if (jobid != null) {
            const idextract = decodeBase64(jobid);
            const [printername = null, id = null] = idextract.split("_@_");
            if (printername == null || id == null)
                throw new Error("Wrong jobid");
            await core.invoke("plugin:printer|pause_job", {
                printername,
                jobid: id.toString()
            });
            return result;
        }
        const listPrinter = await getPrinters();
        for (const printer of listPrinter) {
            const result = await core.invoke("plugin:printer|get_jobs", {
                printername: printer.name
            });
            const listRawJobs = parseIfJSON(result);
            for (const job of listRawJobs) {
                await core.invoke("plugin:printer|pause_job", {
                    printername: printer.name,
                    jobid: job.Id.toString()
                });
            }
        }
        return result;
    }
    catch (err) {
        return {
            success: false,
            message: err.message ? err.message : "Fail to pause job"
        };
    }
};
/**
 * Remove jobs.
 * @param jobid
 */
const removeJob = async (jobid = null) => {
    try {
        const result = {
            success: true,
            message: "OK"
        };
        if (jobid != null) {
            const idextract = decodeBase64(jobid);
            const [printername = null, id = null] = idextract.split("_@_");
            if (printername == null || id == null)
                throw new Error("Wrong jobid");
            await core.invoke("plugin:printer|remove_job", {
                printername,
                jobid: id.toString()
            });
            return result;
        }
        const listPrinter = await getPrinters();
        for (const printer of listPrinter) {
            const result = await core.invoke("plugin:printer|get_jobs", {
                printername: printer.name
            });
            const listRawJobs = parseIfJSON(result);
            for (const job of listRawJobs) {
                await core.invoke("plugin:printer|remove_job", {
                    printername: printer.name,
                    jobid: job.Id.toString()
                });
            }
        }
        return result;
    }
    catch (err) {
        return {
            success: false,
            message: err.message ? err.message : "Fail to pause job"
        };
    }
};

exports.getJob = getJob;
exports.getJobs = getJobs;
exports.getPrinters = getPrinters;
exports.pauseJob = pauseJob;
exports.printFile = printFile;
exports.removeJob = removeJob;
exports.restartJob = restartJob;
exports.resumeJob = resumeJob;
