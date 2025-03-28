export interface IExecutionContext {
    actionIds: ("summary" | "search" | "report" | "out-of-context")[];
    summary?: {
        recipients: string[];
    };
    search?: {
        keywords: string[];
        startDate: Date;
        endDate: Date;
    };
}
