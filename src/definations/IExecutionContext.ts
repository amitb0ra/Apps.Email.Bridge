export interface IExecutionContext {
    actionIds: ActionId[];
    summary?: SummaryContext;
    sendEmail?: SendEmailContext;
    searchEmail?: SearchEmailContext;
    report?: ReportContext;
}

export type ActionId =
    | "summary"
    | "send-email"
    | "search-email"
    | "send-message"
    | "report"
    | "out-of-context";

export interface SummaryContext {
    filter?: {
        startDate: Date;
        endDate: Date;
        usernames?: string[];
        unread?: boolean;
    };
    result?: {
        followUp?: boolean;
        fileSummary?: boolean;
        assignedTasks?: boolean;
    };
}

export interface SendEmailContext {
    subject: string;
    body: string;
    recipients: string[];
    cc?: string[];
    bcc?: string[];
    attachments?: string[];
    requires?: string[];
}

export interface SearchEmailContext {
    startDate: Date;
    endDate: Date;
    keywords: string[];
    unread?: boolean;
    from?: string[];
    to?: string[];
    cc?: string[];
    bcc?: string[];
}

export interface ReportContext {
    reportType: "daily" | "weekly" | "monthly";
}
