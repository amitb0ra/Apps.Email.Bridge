import { IRead, IHttp } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { IExecutionContext } from "../definations/IExecutionContext";
import { EmailBridgeApp } from "../../EmailBridgeApp";
import { chatSummary } from "./chatSummary";

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
                console.log("Summary action triggered");
                chatSummary(user, room, read, http);
                break;
            case "send-email":
                console.log("Send email action triggered");
                break;
            case "search-email":
                console.log("Search email action triggered");
                break;
            case "send-message":
                console.log("Send message action triggered");
                break;
            case "report":
                console.log("Report action triggered");
                break;
            default:
                console.warn(`Unknown action type: ${actionId}`);
                break;
        }
    }
}
