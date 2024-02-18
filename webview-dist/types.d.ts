export declare type ScaleOption = "noscale" | "shrink" | "fit";
export declare type MethodOption = "duplex" | "duplexshort" | "simplex";
export declare type PaperOption = "A2" | "A3" | "A4" | "A5" | "A6" | "letter" | "legal" | "tabloid";
export declare type OrientationOption = "portrait" | "landscape";
export declare type Printer = {
    id: string;
    name: string;
    driver_name: string;
    job_count: number;
    print_processor: string;
    port_name: string;
    share_name: string;
    computer_name: string;
    printer_status: number;
    shared: boolean;
    type: number;
    priority: number;
};
export declare type ColorType = "color" | "monochrome";
export declare type RangeOptions = {
    from: number;
    to: number;
};
export declare type PrintSettings = {
    paper?: PaperOption;
    method?: MethodOption;
    scale?: ScaleOption;
    color_type?: ColorType;
    orientation?: OrientationOption;
    repeat?: Number;
    range?: RangeOptions | string;
};
export declare type PrintFileOptions = {
    id?: string;
    name?: string;
    path?: string;
    base64?: string;
    print_setting?: PrintSettings;
    remove_temp?: boolean;
};
export declare type JobsStatus = {
    code: number;
    name: string;
    description: string;
};
export declare type Jobs = {
    job_status: JobsStatus;
    computer_name: string;
    data_type: string;
    document_name: string;
    id: string;
    job_id: number;
    job_time: number;
    pages_printed: number;
    position: number;
    printer_name: string;
    priority: number;
    size: number;
    submitted_time: number | null;
    total_pages: number;
    username: string;
};
export declare type ResponseResult = {
    message: string | undefined;
    success: boolean;
};
