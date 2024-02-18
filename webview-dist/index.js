"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeJob = exports.pauseJob = exports.resumeJob = exports.restartJob = exports.getJob = exports.getJobs = exports.printFile = exports.getPrinters = void 0;
const core_1 = require("@tauri-apps/api/core");
const buffer_1 = require("buffer");
const constants_1 = require("./constants");
const nanoid_1 = require("nanoid");
const utils_1 = require("utils");
/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
const getPrinters = async (id = null) => {
    if (id != null) {
        const printername = (0, utils_1.decodeBase64)(id);
        const result = await (0, core_1.invoke)("plugin:printer|get_printers_by_name", {
            printername
        });
        const item = (0, utils_1.parseIfJSON)(result, null);
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
    const result = await (0, core_1.invoke)("plugin:printer|get_printers");
    const listRaw = (0, utils_1.parseIfJSON)(result);
    const printers = [];
    for (let i = 0; i < listRaw.length; i++) {
        const item = listRaw[i];
        const id = (0, utils_1.encodeBase64)(item.Name);
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
exports.getPrinters = getPrinters;
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
        id = (0, utils_1.decodeBase64)(options.id);
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
        const file = options.file instanceof buffer_1.Buffer ? options.file : buffer_1.Buffer.from(options.file);
        const fileSignature = file.subarray(0, 4).toString("hex");
        if (fileSignature != "25504446") {
            throw new Error("File not supported");
        }
        const filename = `${(0, nanoid_1.nanoid)()}.pdf`;
        tempPath = await (0, core_1.invoke)("plugin:printer|create_temp_file", {
            bufferData: file.toString("base64"),
            filename
        });
        if (!tempPath) {
            throw new Error("Fail to create temp file");
        }
    }
    const optionsParams = {
        id: `"${id}"`,
        path: options.path,
        printerSetting: printerSettingStr,
        removeAfterPrint: options.remove_temp ? options.remove_temp : true
    };
    if (options.file) {
        optionsParams.path = tempPath;
    }
    await (0, core_1.invoke)("plugin:printer|print_pdf", optionsParams);
    return {
        success: true,
        message: "OK"
    };
};
exports.printFile = printFile;
/**
 * Get all jobs.
 * @returns A array of all printer jobs.
 */
const getJobs = async (printerid = null) => {
    const allJobs = [];
    if (printerid != null) {
        const printer = await (0, exports.getPrinters)(printerid);
        if (printer.length == 0)
            return [];
        const result = await (0, core_1.invoke)("plugin:printer|get_jobs", {
            printername: printer[0].name
        });
        let listRawJobs = (0, utils_1.parseIfJSON)(result, []);
        if (listRawJobs.length == undefined)
            listRawJobs = [listRawJobs];
        for (const job of listRawJobs) {
            const id = (0, utils_1.encodeBase64)(`${printer[0].name}_@_${job.Id}`);
            allJobs.push({
                id,
                job_id: job.Id,
                job_status: constants_1.jobStatus[job.JobStatus] != undefined
                    ? {
                        code: job.JobStatus,
                        description: constants_1.jobStatus[job.JobStatus]
                            .description,
                        name: constants_1.jobStatus[job.JobStatus].name
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
    const listPrinter = await (0, exports.getPrinters)();
    for (const printer of listPrinter) {
        const result = await (0, core_1.invoke)("plugin:printer|get_jobs", {
            printername: printer.name
        });
        let listRawJobs = (0, utils_1.parseIfJSON)(result, []);
        if (listRawJobs.length == undefined)
            listRawJobs = [listRawJobs];
        for (const job of listRawJobs) {
            const id = (0, utils_1.encodeBase64)(`${printer.name}_@_${job.Id}`);
            allJobs.push({
                id,
                job_id: job.Id,
                job_status: constants_1.jobStatus[job.JobStatus] != undefined
                    ? {
                        code: job.JobStatus,
                        description: constants_1.jobStatus[job.JobStatus]
                            .description,
                        name: constants_1.jobStatus[job.JobStatus].name
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
exports.getJobs = getJobs;
/**
 * Get job by id.
 * @returns Printer job.
 */
const getJob = async (jobid) => {
    const idextract = (0, utils_1.decodeBase64)(jobid);
    const [printername = null, id = null] = idextract.split("_@_");
    if (printername == null || id == null)
        null;
    const result = await (0, core_1.invoke)("plugin:printer|get_jobs_by_id", {
        printername: printername,
        jobid: id
    });
    const job = (0, utils_1.parseIfJSON)(result, null);
    return {
        id: jobid,
        job_id: job.Id,
        job_status: constants_1.jobStatus[job.JobStatus] != undefined
            ? {
                code: job.JobStatus,
                description: constants_1.jobStatus[job.JobStatus].description,
                name: constants_1.jobStatus[job.JobStatus].name
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
exports.getJob = getJob;
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
            const idextract = (0, utils_1.decodeBase64)(jobid);
            const [printername = null, id = null] = idextract.split("_@_");
            if (printername == null || id == null)
                throw new Error("Wrong jobid");
            await (0, core_1.invoke)("plugin:printer|restart_job", {
                printername,
                jobid: id.toString()
            });
            return result;
        }
        const listPrinter = await (0, exports.getPrinters)();
        for (const printer of listPrinter) {
            const result = await (0, core_1.invoke)("plugin:printer|get_jobs", {
                printername: printer.name
            });
            const listRawJobs = (0, utils_1.parseIfJSON)(result, []);
            for (const job of listRawJobs) {
                await (0, core_1.invoke)("plugin:printer|restart_job", {
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
exports.restartJob = restartJob;
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
            const idextract = (0, utils_1.decodeBase64)(jobid);
            const [printername = null, id = null] = idextract.split("_@_");
            if (printername == null || id == null)
                throw new Error("Wrong jobid");
            await (0, core_1.invoke)("plugin:printer|resume_job", {
                printername,
                jobid: id.toString()
            });
            return result;
        }
        const listPrinter = await (0, exports.getPrinters)();
        for (const printer of listPrinter) {
            const result = await (0, core_1.invoke)("plugin:printer|get_jobs", {
                printername: printer.name
            });
            const listRawJobs = (0, utils_1.parseIfJSON)(result);
            for (const job of listRawJobs) {
                await (0, core_1.invoke)("plugin:printer|resume_job", {
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
exports.resumeJob = resumeJob;
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
            const idextract = (0, utils_1.decodeBase64)(jobid);
            const [printername = null, id = null] = idextract.split("_@_");
            if (printername == null || id == null)
                throw new Error("Wrong jobid");
            await (0, core_1.invoke)("plugin:printer|pause_job", {
                printername,
                jobid: id.toString()
            });
            return result;
        }
        const listPrinter = await (0, exports.getPrinters)();
        for (const printer of listPrinter) {
            const result = await (0, core_1.invoke)("plugin:printer|get_jobs", {
                printername: printer.name
            });
            const listRawJobs = (0, utils_1.parseIfJSON)(result);
            for (const job of listRawJobs) {
                await (0, core_1.invoke)("plugin:printer|pause_job", {
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
exports.pauseJob = pauseJob;
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
            const idextract = (0, utils_1.decodeBase64)(jobid);
            const [printername = null, id = null] = idextract.split("_@_");
            if (printername == null || id == null)
                throw new Error("Wrong jobid");
            await (0, core_1.invoke)("plugin:printer|remove_job", {
                printername,
                jobid: id.toString()
            });
            return result;
        }
        const listPrinter = await (0, exports.getPrinters)();
        for (const printer of listPrinter) {
            const result = await (0, core_1.invoke)("plugin:printer|get_jobs", {
                printername: printer.name
            });
            const listRawJobs = (0, utils_1.parseIfJSON)(result);
            for (const job of listRawJobs) {
                await (0, core_1.invoke)("plugin:printer|remove_job", {
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
exports.removeJob = removeJob;
