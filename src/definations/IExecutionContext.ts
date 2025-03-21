export interface IExecutionContext {
    actionIds: (
        | "summary"
        | "send-email"
        | "search-email"
        | "send-message"
        | "report"
        | "out-of-context"
    )[];
    sendEmail?: {
        recipients: string[];
    };
    search?: {
        keywords: string[];
        startDate: Date;
        endDate: Date;
    };
}
