export declare const jobStatus: {
    readonly 512: {
        readonly name: "Completed";
        readonly description: "An error condition, possibly on a print job that precedes this one in the queue, blocked the print job.";
    };
    readonly 4096: {
        readonly name: "Completed";
        readonly description: "The print job is complete, including any post-printing processing.";
    };
    readonly 256: {
        readonly name: "Deleted";
        readonly description: "The print job was deleted from the queue, typically after printing.";
    };
    readonly 4: {
        readonly name: "Deleting";
        readonly description: "The print job is in the process of being deleted.";
    };
    readonly 2: {
        readonly name: "Error";
        readonly description: "The print job is in an error state.";
    };
    readonly 0: {
        readonly name: "None";
        readonly description: "The print job has no specified state.";
    };
    readonly 32: {
        readonly name: "Offline";
        readonly description: "The printer is offline.";
    };
    readonly 64: {
        readonly name: "PaperOut";
        readonly description: "The printer is out of the required paper size.";
    };
    readonly 1: {
        readonly name: "Paused";
        readonly description: "The print job is paused.";
    };
    readonly 128: {
        readonly name: "Printed";
        readonly description: "The print job printed.";
    };
    readonly 16: {
        readonly name: "Printing";
        readonly description: "The print job is now printing.";
    };
    readonly 2048: {
        readonly name: "Restarted";
        readonly description: "The print job was blocked but has restarted.";
    };
    readonly 8192: {
        readonly name: "Retained";
        readonly description: "The print job is retained in the print queue after printing.";
    };
    readonly 1024: {
        readonly name: "UserIntervention";
        readonly description: "The printer requires user action to fix an error condition.";
    };
    readonly 8: {
        readonly name: "Spooling";
        readonly description: "The print job is spooling.";
    };
};
