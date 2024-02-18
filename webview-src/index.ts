import { invoke } from "@tauri-apps/api/core"
import { Buffer } from "buffer"
import { jobStatus } from "./constants"
import { nanoid } from "nanoid"
import {
  Jobs,
  Printer,
  PrintSettings,
  ResponseResult,
  PrintFileOptions
} from "./types"
import { decodeBase64, parseIfJSON, encodeBase64 } from "utils"

/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
export const getPrinters = async (
  id: string | null = null
): Promise<Printer[]> => {
  if (id != null) {
    const printername = decodeBase64(id)
    const result: string = await invoke("plugin:printer|get_printers_by_name", {
      printername
    })
    const item = parseIfJSON(result, null)
    if (item == null) return []
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
    ]
  }
  const result: string = await invoke("plugin:printer|get_printers")
  const listRaw: any[] = parseIfJSON(result)
  const printers: Printer[] = []

  for (let i = 0; i < listRaw.length; i++) {
    const item: any = listRaw[i]
    const id = encodeBase64(item.Name)

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
    })
  }
  return printers
}

/**
 * Print File.
 * @params first_param: File Path, second_param: Print Setting
 * @returns A process status.
 */
export const printFile = async (
  options: PrintFileOptions
): Promise<ResponseResult> => {
  if (!options.id && !options.name) {
    throw new Error("print_file require id | name as string")
  }

  if (!options.path && !options.file) {
    throw new Error(
      "print_file require parameter path as string | file as Buffer"
    )
  }

  let id: string | undefined = ""

  if (typeof options.id != "undefined") {
    id = decodeBase64(options.id)
  } else {
    id = options.name
  }

  const printerSettings: PrintSettings = {
    paper: "A4",
    method: "simplex",
    scale: "noscale",
    orientation: "portrait",
    repeat: 1
  }

  if (typeof options?.print_setting?.paper != "undefined")
    printerSettings.paper = options.print_setting.paper
  if (typeof options?.print_setting?.method != "undefined")
    printerSettings.method = options.print_setting.method
  if (typeof options?.print_setting?.scale != "undefined")
    printerSettings.scale = options.print_setting.scale
  if (typeof options?.print_setting?.orientation != "undefined")
    printerSettings.orientation = options.print_setting.orientation
  if (typeof options?.print_setting?.repeat != "undefined")
    printerSettings.repeat = options.print_setting.repeat
  if (typeof options?.print_setting?.range != "undefined")
    printerSettings.range = options.print_setting.range
  if (typeof options.path != "undefined") {
    if (options.path.split(".").length <= 1)
      throw new Error("File not supported")
    if (options.path.split(".").pop() != "pdf")
      throw new Error("File not supported")
  }

  let rangeStr = ""
  if (printerSettings.range) {
    if (typeof printerSettings.range == "string") {
      if (!new RegExp(/^[0-9,]+$/).test(printerSettings.range)) {
        throw new Error("Invalid range value ")
      }

      rangeStr =
        printerSettings.range[printerSettings.range.length - 1] != ","
          ? printerSettings.range
          : printerSettings.range.substring(0, printerSettings.range.length - 1)
    } else if (printerSettings.range.from) {
      rangeStr = `${printerSettings.range.from}-${printerSettings.range.to}`
    }
  }

  const printerSettingStr = `-print-settings ${rangeStr},${printerSettings.paper},${printerSettings.method},${printerSettings.scale},${printerSettings.orientation},${printerSettings.repeat}x`

  let tempPath: string = ""
  if (options.file) {
    const file =
      options.file instanceof Buffer ? options.file : Buffer.from(options.file)

    const fileSignature = file.subarray(0, 4).toString("hex")

    if (fileSignature != "25504446") {
      throw new Error("File not supported")
    }

    const filename: string = `${nanoid()}.pdf`
    tempPath = await invoke<string>("plugin:printer|create_temp_file", {
      bufferData: file.toString("base64"),
      filename
    })

    if (!tempPath) {
      throw new Error("Fail to create temp file")
    }
  }

  const optionsParams: any = {
    id: `"${id}"`,
    path: options.path,
    printerSetting: printerSettingStr,
    removeAfterPrint: options.remove_temp ? options.remove_temp : true
  }

  if (options.file) {
    optionsParams.path = tempPath
  }

  await invoke("plugin:printer|print_pdf", optionsParams)

  return {
    success: true,
    message: "OK"
  }
}

/**
 * Get all jobs.
 * @returns A array of all printer jobs.
 */
export const getJobs = async (
  printerid: string | null = null
): Promise<Jobs[]> => {
  const allJobs: Jobs[] = []
  if (printerid != null) {
    const printer = await getPrinters(printerid)
    if (printer.length == 0) return []
    const result: any = await invoke("plugin:printer|get_jobs", {
      printername: printer[0].name
    })
    let listRawJobs: any = parseIfJSON(result, [])
    if (listRawJobs.length == undefined) listRawJobs = [listRawJobs]
    for (const job of listRawJobs) {
      const id = encodeBase64(`${printer[0].name}_@_${job.Id}`)
      allJobs.push({
        id,
        job_id: job.Id,
        job_status:
          jobStatus[job.JobStatus as keyof typeof jobStatus] != undefined
            ? {
                code: job.JobStatus,
                description:
                  jobStatus[job.JobStatus as keyof typeof jobStatus]
                    .description,
                name: jobStatus[job.JobStatus as keyof typeof jobStatus].name
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
      })
    }
    return allJobs
  }
  const listPrinter = await getPrinters()
  for (const printer of listPrinter) {
    const result: any = await invoke("plugin:printer|get_jobs", {
      printername: printer.name
    })
    let listRawJobs: any = parseIfJSON(result, [])
    if (listRawJobs.length == undefined) listRawJobs = [listRawJobs]
    for (const job of listRawJobs) {
      const id = encodeBase64(`${printer.name}_@_${job.Id}`)
      allJobs.push({
        id,
        job_id: job.Id,
        job_status:
          jobStatus[job.JobStatus as keyof typeof jobStatus] != undefined
            ? {
                code: job.JobStatus,
                description:
                  jobStatus[job.JobStatus as keyof typeof jobStatus]
                    .description,
                name: jobStatus[job.JobStatus as keyof typeof jobStatus].name
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
      })
    }
  }

  return allJobs
}

/**
 * Get job by id.
 * @returns Printer job.
 */
export const getJob = async (jobid: string): Promise<Jobs | null> => {
  const idextract = decodeBase64(jobid)
  const [printername = null, id = null] = idextract.split("_@_")
  if (printername == null || id == null) null
  const result: any = await invoke("plugin:printer|get_jobs_by_id", {
    printername: printername,
    jobid: id
  })
  const job = parseIfJSON(result, null)
  return {
    id: jobid,
    job_id: job.Id,
    job_status:
      jobStatus[job.JobStatus as keyof typeof jobStatus] != undefined
        ? {
            code: job.JobStatus,
            description:
              jobStatus[job.JobStatus as keyof typeof jobStatus].description,
            name: jobStatus[job.JobStatus as keyof typeof jobStatus].name
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
  }
}

/**
 * Restart jobs.
 * @param jobid
 */
export const restartJob = async (
  jobid: string | null = null
): Promise<ResponseResult> => {
  try {
    const result = {
      success: true,
      message: "OK"
    }
    if (jobid != null) {
      const idextract = decodeBase64(jobid)

      const [printername = null, id = null] = idextract.split("_@_")
      if (printername == null || id == null) throw new Error("Wrong jobid")

      await invoke("plugin:printer|restart_job", {
        printername,
        jobid: id.toString()
      })

      return result
    }

    const listPrinter = await getPrinters()
    for (const printer of listPrinter) {
      const result: any = await invoke("plugin:printer|get_jobs", {
        printername: printer.name
      })
      const listRawJobs = parseIfJSON(result, [])
      for (const job of listRawJobs) {
        await invoke("plugin:printer|restart_job", {
          printername: printer.name,
          jobid: job.Id.toString()
        })
      }
    }

    return result
  } catch (err: any) {
    return {
      success: false,
      message: err.message ? err.message : "Fail to restart job"
    }
  }
}

/**
 * Resume jobs.
 * @param jobid
 */
export const resumeJob = async (
  jobid: string | null = null
): Promise<ResponseResult> => {
  try {
    const result = {
      success: true,
      message: "OK"
    }
    if (jobid != null) {
      const idextract = decodeBase64(jobid)
      const [printername = null, id = null] = idextract.split("_@_")
      if (printername == null || id == null) throw new Error("Wrong jobid")

      await invoke("plugin:printer|resume_job", {
        printername,
        jobid: id.toString()
      })

      return result
    }

    const listPrinter = await getPrinters()
    for (const printer of listPrinter) {
      const result: any = await invoke("plugin:printer|get_jobs", {
        printername: printer.name
      })
      const listRawJobs = parseIfJSON(result)
      for (const job of listRawJobs) {
        await invoke("plugin:printer|resume_job", {
          printername: printer.name,
          jobid: job.Id.toString()
        })
      }
    }

    return result
  } catch (err: any) {
    return {
      success: false,
      message: err.message ? err.message : "Fail to resume job"
    }
  }
}

/**
 * Pause jobs.
 * @param jobid
 */
export const pauseJob = async (
  jobid: string | null = null
): Promise<ResponseResult> => {
  try {
    const result = {
      success: true,
      message: "OK"
    }
    if (jobid != null) {
      const idextract = decodeBase64(jobid)
      const [printername = null, id = null] = idextract.split("_@_")
      if (printername == null || id == null) throw new Error("Wrong jobid")

      await invoke("plugin:printer|pause_job", {
        printername,
        jobid: id.toString()
      })

      return result
    }

    const listPrinter = await getPrinters()
    for (const printer of listPrinter) {
      const result: any = await invoke("plugin:printer|get_jobs", {
        printername: printer.name
      })
      const listRawJobs = parseIfJSON(result)
      for (const job of listRawJobs) {
        await invoke("plugin:printer|pause_job", {
          printername: printer.name,
          jobid: job.Id.toString()
        })
      }
    }

    return result
  } catch (err: any) {
    return {
      success: false,
      message: err.message ? err.message : "Fail to pause job"
    }
  }
}

/**
 * Remove jobs.
 * @param jobid
 */
export const removeJob = async (
  jobid: string | null = null
): Promise<ResponseResult> => {
  try {
    const result = {
      success: true,
      message: "OK"
    }
    if (jobid != null) {
      const idextract = decodeBase64(jobid)
      const [printername = null, id = null] = idextract.split("_@_")
      if (printername == null || id == null) throw new Error("Wrong jobid")

      await invoke("plugin:printer|remove_job", {
        printername,
        jobid: id.toString()
      })

      return result
    }

    const listPrinter = await getPrinters()
    for (const printer of listPrinter) {
      const result: any = await invoke("plugin:printer|get_jobs", {
        printername: printer.name
      })
      const listRawJobs = parseIfJSON(result)
      for (const job of listRawJobs) {
        await invoke("plugin:printer|remove_job", {
          printername: printer.name,
          jobid: job.Id.toString()
        })
      }
    }

    return result
  } catch (err: any) {
    return {
      success: false,
      message: err.message ? err.message : "Fail to pause job"
    }
  }
}
