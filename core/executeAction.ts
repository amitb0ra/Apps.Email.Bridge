import { IRead, IHttp } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { chatSummary } from "../core/chatSummary";
import { IExecutionContext } from "../definations/IExecutionContext";
import { getReport, searchEmail } from "../core/gmail";
import { EmailBridgeApp } from "../EmailBridgeApp";
import { sendMessage } from "../helpers/sendMessage";

export async function executeAction(
    app: EmailBridgeApp,
    user: IUser,
    room: IRoom,
    read: IRead,
    http: IHttp,
    executionContext: IExecutionContext
) {
    for (const actionId of executionContext.actionIds) {
        switch (actionId) {
            case "summary":
                chatSummary(
                    app,
                    user,
                    room,
                    read,
                    http,
                    executionContext.summary?.recipients
                );
                break;
            case "search":
                await searchEmail(
                    app,
                    http,
                    read,
                    user,
                    room,
                    executionContext.search?.keywords,
                    executionContext.search?.startDate,
                    executionContext.search?.endDate
                );
                break;
            case "report":
                await getReport(app, http, read, user, room);
                break;
            default:
                console.warn(`Unknown action type: ${actionId}`);
                break;
        }
    }
}
