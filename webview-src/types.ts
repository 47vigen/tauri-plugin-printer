export type ScaleOption = "noscale" | "shrink" | "fit"
export type MethodOption = "duplex" | "duplexshort" | "simplex"
export type PaperOption =
  | "A2"
  | "A3"
  | "A4"
  | "A5"
  | "A6"
  | "letter"
  | "legal"
  | "tabloid"
export type OrientationOption = "portrait" | "landscape"

export type Printer = {
  id: string
  name: string
  driver_name: string
  job_count: number
  print_processor: string
  port_name: string
  share_name: string
  computer_name: string
  printer_status: number // https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-printer
  shared: boolean
  type: number // 0: local; 1: connection
  priority: number
}

export type ColorType = "color" | "monochrome"

export type RangeOptions = {
  from: number
  to: number
}
export type PrintSettings = {
  paper?: PaperOption
  method?: MethodOption
  scale?: ScaleOption
  color_type?: ColorType
  orientation?: OrientationOption
  repeat?: Number
  range?: RangeOptions | string
}

export type PrintFileOptions = {
  id?: string
  name?: string
  path?: string
  file?: Buffer | ArrayBuffer | Uint8Array
  print_setting?: PrintSettings
  remove_temp?: boolean
}

export type JobsStatus = {
  code: number
  name: string
  description: string
}
export type Jobs = {
  job_status: JobsStatus
  computer_name: string
  data_type: string
  document_name: string
  id: string
  job_id: number
  job_time: number
  pages_printed: number
  position: number
  printer_name: string
  priority: number
  size: number
  submitted_time: number | null
  total_pages: number
  username: string
}

export type ResponseResult = {
  message: string | undefined
  success: boolean
}
