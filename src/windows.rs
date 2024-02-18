use crate::error::Error;
use crate::{declare::PrintOptions, fsys::remove_file};
use std::env;
use std::fs::File;
use std::io::Write;
use std::process::Command;

/**
 * Create sm.exe to temp
 */
fn create_file(path: String, bin: &[u8]) -> Result<(), std::io::Error> {
    let mut f = File::create(format!("{}sm.exe", path))?;
    f.write_all(bin)?;
    f.sync_all()?;
    Ok(())
}

/**
 * init sm.exe
 */
pub fn init_windows() -> Result<(), Error> {
    let sm = include_bytes!("bin/sm");
    let dir: std::path::PathBuf = env::temp_dir();
    let result: Result<(), std::io::Error> = create_file(dir.display().to_string(), sm);

    match result {
        Ok(_) => Ok({}),
        Err(error) => Err(Error::String(format!("{}", error))),
    }
}

/**
 * Get printers on windows using powershell
 */
pub fn get_printers() -> Result<String, Error> {
    let output = Command::new("powershell")
        .args(&["Get-Printer | Select-Object Name, DriverName, JobCount, PrintProcessor, PortName, ShareName, ComputerName, PrinterStatus, Shared, Type, Priority | ConvertTo-Json"])
        .output()
        .expect("Failed to execute command");

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/**
 * Get printers by name on windows using powershell
 */
pub fn get_printers_by_name(printername: String) -> Result<String, Error> {
    let output = Command::new("powershell")
        .args(&[format!("Get-Printer -Name \"{}\" | Select-Object Name, DriverName, JobCount, PrintProcessor, PortName, ShareName, ComputerName, PrinterStatus, Shared, Type, Priority | ConvertTo-Json", printername)])
        .output()
        .expect("Failed to execute command");

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/**
 * Print pdf file
 */
pub fn print_pdf(options: PrintOptions) -> Result<String, Error> {
    let dir: std::path::PathBuf = env::temp_dir();
    let print_setting = options.print_setting;
    let mut print = "-print-to-default".to_owned();
    if !options.id.is_empty() {
        print = format!("-print-to {}", options.id);
    }
    let shell_command = format!(
        "{}sm.exe {} {} -silent {}",
        dir.display(),
        print,
        print_setting,
        options.path
    );

    let output = Command::new("powershell")
        .args(&[shell_command])
        .output()
        .expect("Failed to execute command");

    if options.remove_after_print {
        let _ = remove_file(&options.path);
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/**
 * Get printer job on windows using powershell
 */
pub fn get_jobs(printername: String) -> Result<String, Error> {
    let output = Command::new("powershell")
        .args(&[format!("Get-PrintJob -PrinterName \"{}\"  | Select-Object DocumentName,Id,TotalPages,Position,Size,SubmmitedTime,UserName,PagesPrinted,JobTime,ComputerName,Datatype,PrinterName,Priority,SubmittedTime,JobStatus | ConvertTo-Json", printername)])
        .output()
        .expect("Failed to execute command");

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/**
 * Get printer job by id on windows using powershell
 */
pub fn get_jobs_by_id(printername: String, jobid: String) -> Result<String, Error> {
    let output = Command::new("powershell")
        .args(&[format!("Get-PrintJob -PrinterName \"{}\" -ID \"{}\"  | Select-Object DocumentName,Id,TotalPages,Position,Size,SubmmitedTime,UserName,PagesPrinted,JobTime,ComputerName,Datatype,PrinterName,Priority,SubmittedTime,JobStatus | ConvertTo-Json", printername, jobid)])
        .output()
        .expect("Failed to execute command");

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/**
 * Resume printers job on windows using powershell
 */
pub fn resume_job(printername: String, jobid: String) -> Result<String, Error> {
    let output = Command::new("powershell")
        .args(&[format!(
            "Resume-PrintJob -PrinterName \"{}\" -ID \"{}\"",
            printername, jobid
        )])
        .output()
        .expect("Failed to execute command");

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/**
 * Restart printers job on windows using powershell
 */
pub fn restart_job(printername: String, jobid: String) -> Result<String, Error> {
    let output = Command::new("powershell")
        .args(&[format!(
            "Restart-PrintJob -PrinterName \"{}\" -ID \"{}\"",
            printername, jobid
        )])
        .output()
        .expect("Failed to execute command");

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/**
 * Pause printers job on windows using powershell
 */
pub fn pause_job(printername: String, jobid: String) -> Result<String, Error> {
    let output = Command::new("powershell")
        .args(&[format!(
            "Suspend-PrintJob -PrinterName \"{}\" -ID \"{}\"",
            printername, jobid
        )])
        .output()
        .expect("Failed to execute command");

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/**
 * Remove printers job on windows using powershell
 */
pub fn remove_job(printername: String, jobid: String) -> Result<String, Error> {
    let output = Command::new("powershell")
        .args(&[format!(
            "Remove-PrintJob -PrinterName \"{}\" -ID \"{}\"",
            printername, jobid
        )])
        .output()
        .expect("Failed to execute command");

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
