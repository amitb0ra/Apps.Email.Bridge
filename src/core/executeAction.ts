import {
    IRead,
    IHttp,
    IPersistence,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { IExecutionContext } from "../definations/IExecutionContext";
import { EmailBridgeApp } from "../../EmailBridgeApp";
import { chatSummary } from "./chatSummary";
import { getReport, searchEmail, sendEmail } from "./gmail";
import { sendMessage } from "../helpers/message";
import { getData } from "../helpers/persistence";

export async function executeAction(
    app: EmailBridgeApp,
    user: IUser,
    room: IRoom,
    read: IRead,
    http: IHttp,
    persistence: IPersistence,
    executionContext: IExecutionContext
) {
    for (const actionId of executionContext.actionIds) {
        switch (actionId) {
            case "summary":
                console.log("Summary action triggered");
                await chatSummary(user, room, read, http, persistence);
                break;
            case "send-email":
                console.log("Send email action triggered");

                if (
                    !executionContext.sendEmail ||
                    !executionContext.sendEmail.recipients ||
                    executionContext.sendEmail.recipients.length === 0
                ) {
                    console.log("No recipients provided");
                    await sendMessage(
                        read,
                        user,
                        room,
                        "No recipients provided. Please specify at least one recipient."
                    );
                    return;
                }

                const summary = await getData(
                    read.getPersistenceReader(),
                    user.id,
                    "SUMMARY"
                );

                if (summary) {
                    console.log("Summary found in persistence");
                    await sendEmail(
                        app,
                        http,
                        read,
                        user,
                        room,
                        summary.subject,
                        summary.body,
                        executionContext.sendEmail.recipients
                    );
                } else {
                    console.log("No summary found in persistence");
                    if (
                        !executionContext.sendEmail.subject ||
                        !executionContext.sendEmail.body
                    ) {
                        console.log("Subject or body is missing");
                        await sendMessage(
                            read,
                            user,
                            room,
                            "Subject or body is missing. Please provide both."
                        );
                        return;
                    }
                    await sendEmail(
                        app,
                        http,
                        read,
                        user,
                        room,
                        executionContext.sendEmail.subject,
                        executionContext.sendEmail.body,
                        executionContext.sendEmail.recipients
                    );
                }
                break;
            case "search-email":
                console.log("Search email action triggered");
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
            case "send-message":
                console.log("Send message action triggered");
                break;
            case "report":
                console.log("Report action triggered");
                await getReport(app, http, read, user, room);
                break;
            default:
                console.warn(`Unknown action type: ${actionId}`);
                break;
        }
    }
}
