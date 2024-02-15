use crate::error::Error;
use tauri::command;

#[command]
pub(crate) fn create_temp_file(buffer_data: String, filename: String) -> Result<String, Error> {
    let dir = std::env::temp_dir();
    let result = crate::fsys::create_file_from_base64(
        buffer_data.as_str(),
        format!("{}{}", dir.display(), filename).as_str(),
    );

    match result {
        Ok(_) => Ok(format!("{}{}", dir.display(), filename)),
        Err(error) => Err(Error::String(format!("{}", error))),
    }
}

#[command]
pub(crate) fn remove_temp_file(filename: String) -> Result<bool, Error> {
    let dir = std::env::temp_dir();
    let result = crate::fsys::remove_file(format!("{}{}", dir.display(), filename).as_str());

    match result {
        Ok(_) => Ok(true),
        Err(error) => Err(Error::String(format!("{}", error))),
    }
}

#[command]
pub(crate) fn get_printers() -> Result<String, Error> {
    if cfg!(windows) {
        let result = crate::windows::get_printers();
        match result {
            Ok(printers) => Ok(printers),
            Err(error) => Err(Error::String(format!("{}", error))),
        }
    } else {
        Err(Error::String("Unsupported OS".to_string()))
    }
}

#[command]
pub(crate) fn get_printers_by_name(printername: String) -> Result<String, Error> {
    if cfg!(windows) {
        let result = crate::windows::get_printers_by_name(printername);
        match result {
            Ok(printers) => Ok(printers),
            Err(error) => Err(Error::String(format!("{}", error))),
        }
    } else {
        Err(Error::String("Unsupported OS".to_string()))
    }
}

#[command]
pub(crate) fn print_pdf(
    id: String,
    path: String,
    printer_setting: String,
    remove_after_print: bool,
) -> Result<String, Error> {
    if cfg!(windows) {
        let options = crate::declare::PrintOptions {
            id,
            path,
            print_setting: printer_setting,
            remove_after_print,
        };
        let result = crate::windows::print_pdf(options);
        match result {
            Ok(printers) => Ok(printers),
            Err(error) => Err(Error::String(format!("{}", error))),
        }
    } else {
        Err(Error::String("Unsupported OS".to_string()))
    }
}

#[command]
pub(crate) fn get_jobs(printername: String) -> Result<String, Error> {
    if cfg!(windows) {
        let result = crate::windows::get_jobs(printername);
        match result {
            Ok(jobs) => Ok(jobs),
            Err(error) => Err(Error::String(format!("{}", error))),
        }
    } else {
        Err(Error::String("Unsupported OS".to_string()))
    }
}

#[command]
pub(crate) fn get_jobs_by_id(printername: String, jobid: String) -> Result<String, Error> {
    if cfg!(windows) {
        let result = crate::windows::get_jobs_by_id(printername, jobid);
        match result {
            Ok(jobs) => Ok(jobs),
            Err(error) => Err(Error::String(format!("{}", error))),
        }
    } else {
        Err(Error::String("Unsupported OS".to_string()))
    }
}

#[command]
pub(crate) fn resume_job(printername: String, jobid: String) -> Result<String, Error> {
    if cfg!(windows) {
        let result = crate::windows::resume_job(printername, jobid);
        match result {
            Ok(jobs) => Ok(jobs),
            Err(error) => Err(Error::String(format!("{}", error))),
        }
    } else {
        Err(Error::String("Unsupported OS".to_string()))
    }
}

#[command]
pub(crate) fn restart_job(printername: String, jobid: String) -> Result<String, Error> {
    if cfg!(windows) {
        let result = crate::windows::restart_job(printername, jobid);
        match result {
            Ok(jobs) => Ok(jobs),
            Err(error) => Err(Error::String(format!("{}", error))),
        }
    } else {
        Err(Error::String("Unsupported OS".to_string()))
    }
}

#[command]
pub(crate) fn pause_job(printername: String, jobid: String) -> Result<String, Error> {
    if cfg!(windows) {
        let result = crate::windows::pause_job(printername, jobid);
        match result {
            Ok(jobs) => Ok(jobs),
            Err(error) => Err(Error::String(format!("{}", error))),
        }
    } else {
        Err(Error::String("Unsupported OS".to_string()))
    }
}

#[command]
pub(crate) fn remove_job(printername: String, jobid: String) -> Result<String, Error> {
    if cfg!(windows) {
        let result = crate::windows::remove_job(printername, jobid);
        match result {
            Ok(jobs) => Ok(jobs),
            Err(error) => Err(Error::String(format!("{}", error))),
        }
    } else {
        Err(Error::String("Unsupported OS".to_string()))
    }
}
