import {
    IRead,
    IHttp,
    IPersistence,
    IModify,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { IExecutionContext } from "../definations/IExecutionContext";
import { EmailBridgeApp } from "../../EmailBridgeApp";
import { chatSummary } from "../actions/chatSummary";
import { getReport, searchEmail } from "../actions/gmail";
import { sendMessage } from "../helpers/message";
import { get } from "../helpers/persistence";
import { confirmSendEmail } from "../modal/confirmSendEmail";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands/SlashCommandContext";

export async function executeAction(
    app: EmailBridgeApp,
    user: IUser,
    room: IRoom,
    read: IRead,
    modify: IModify,
    http: IHttp,
    context: SlashCommandContext,
    persistence: IPersistence,
    executionContext: IExecutionContext,
    threadId?: string
) {
    for (const actionId of executionContext.actionIds) {
        switch (actionId) {
            case "summary":
                console.log("Summary action triggered");
                await chatSummary(
                    user,
                    room,
                    read,
                    http,
                    persistence,
                    threadId
                );
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

                const summary = await get(
                    read.getPersistenceReader(),
                    `${user.id}#SUMMARY`
                );

                const triggerId = context.getTriggerId() as string;
                const userId = context.getSender();

                if (summary) {
                    console.log("Summary found in persistence");
                    const modal = await confirmSendEmail({
                        modify: modify,
                        read: read,
                        persistence: persistence,
                        http: http,
                        slashCommandContext: context,
                        uiKitContext: undefined,
                        subject: summary.subject,
                        body: summary.body,
                        recipients: executionContext.sendEmail.recipients,
                    });

                    await modify
                        .getUiController()
                        .openModalView(modal, { triggerId }, userId);
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

                    const modal = await confirmSendEmail({
                        modify: modify,
                        read: read,
                        persistence: persistence,
                        http: http,
                        slashCommandContext: context,
                        uiKitContext: undefined,
                        subject: executionContext.sendEmail.subject,
                        body: executionContext.sendEmail.body,
                        recipients: executionContext.sendEmail.recipients,
                    });

                    await modify
                        .getUiController()
                        .openModalView(modal, { triggerId }, userId);
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
                    modify,
                    executionContext.searchEmail?.keywords,
                    executionContext.searchEmail?.startDate,
                    executionContext.searchEmail?.endDate
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
