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
        subject: string;
        body: string;
        recipients: string[];
    };
    search?: {
        keywords: string[];
        startDate: Date;
        endDate: Date;
    };
}
