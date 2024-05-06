use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;

mod commands;
mod error;
mod fsys;
mod models;
mod windows;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::Printer;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the printer APIs.
pub trait PrinterExt<R: Runtime> {
    fn printer(&self) -> &Printer<R>;
}

impl<R: Runtime, T: Manager<R>> crate::PrinterExt<R> for T {
    fn printer(&self) -> &Printer<R> {
        self.state::<Printer<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("printer")
        .invoke_handler(tauri::generate_handler![
            commands::create_temp_file,
            commands::remove_temp_file,
            commands::get_printers,
            commands::get_printers_by_name,
            commands::print_pdf,
            commands::get_jobs,
            commands::get_jobs_by_id,
            commands::resume_job,
            commands::restart_job,
            commands::pause_job,
            commands::remove_job,
        ])
        .setup(|app, api| {
            #[cfg(desktop)]
            let printer = desktop::init(app, api)?;
            app.manage(printer);

            if cfg!(windows) {
                let _ = windows::init_windows();
            }

            Ok(())
        })
        .build()
}
