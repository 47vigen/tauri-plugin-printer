use crate::declare;
use crate::fsys;
use crate::windows;
use std::env;
use tauri::command;

#[command]
pub fn create_temp_file(buffer_data: String, filename: String) -> String {
    let dir = env::temp_dir();
    let result = fsys::create_file_from_base64(
        buffer_data.as_str(),
        format!("{}{}", dir.display(), filename).as_str(),
    );

    if result.is_ok() {
        return format!("{}{}", dir.display(), filename);
    }
    "".to_owned()
}

#[command]
pub fn remove_temp_file(filename: String) -> bool {
    let dir = env::temp_dir();
    let result = fsys::remove_file(format!("{}{}", dir.display(), filename).as_str());

    if result.is_ok() {
        return true;
    }
    false
}

#[command]
pub fn get_printers() -> String {
    if cfg!(windows) {
        return windows::get_printers();
    }

    "Unsupported OS".to_string()
}

#[command]
pub fn get_printers_by_name(printername: String) -> String {
    if cfg!(windows) {
        return windows::get_printers_by_name(printername);
    }

    "Unsupported OS".to_string()
}

#[command]
pub fn print_pdf(
    id: String,
    path: String,
    printer_setting: String,
    remove_after_print: bool,
) -> String {
    if cfg!(windows) {
        let options = declare::PrintOptions {
            id,
            path,
            print_setting: printer_setting,
            remove_after_print: remove_after_print,
        };
        return windows::print_pdf(options);
    }

    "Unsupported OS".to_string()
}

#[command]
pub fn get_jobs(printername: String) -> String {
    if cfg!(windows) {
        return windows::get_jobs(printername);
    }

    "Unsupported OS".to_string()
}

#[command]
pub fn get_jobs_by_id(printername: String, jobid: String) -> String {
    if cfg!(windows) {
        return windows::get_jobs_by_id(printername, jobid);
    }

    "Unsupported OS".to_string()
}

#[command]
pub fn resume_job(printername: String, jobid: String) -> String {
    if cfg!(windows) {
        return windows::resume_job(printername, jobid);
    }

    "Unsupported OS".to_string()
}

#[command]
pub fn restart_job(printername: String, jobid: String) -> String {
    if cfg!(windows) {
        return windows::restart_job(printername, jobid);
    }

    "Unsupported OS".to_string()
}

#[command]
pub fn pause_job(printername: String, jobid: String) -> String {
    if cfg!(windows) {
        return windows::pause_job(printername, jobid);
    }

    "Unsupported OS".to_string()
}

#[command]
pub fn remove_job(printername: String, jobid: String) -> String {
    if cfg!(windows) {
        return windows::remove_job(printername, jobid);
    }

    "Unsupported OS".to_string()
}
