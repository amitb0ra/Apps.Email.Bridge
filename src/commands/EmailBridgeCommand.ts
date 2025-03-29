import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { EmailBridgeApp } from "../../EmailBridgeApp";
import { sendMessage } from "../helpers/message";
import { getExecutionContext } from "../core/getExecutionContext";
import { HELP_MESSAGE } from "../constants/dialogue";
import { executeAction } from "../core/executeAction";
import { auth } from "../auth/auth";

export class EmailBridgeCommand implements ISlashCommand {
    public constructor(private readonly app: EmailBridgeApp) {}
    public command = "email-bridge";
    public i18nParamsExample = "";
    public i18nDescription = "";
    public providesPreview = false;

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<void> {
        const command = context.getArguments();
        const sender = context.getSender();
        const room = context.getRoom();

        if (!Array.isArray(command)) {
            return;
        }

        switch (command[0]) {
            case "help":
                sendMessage(read, sender, room, HELP_MESSAGE);
                break;
            case "auth":
                auth(this.app, read, modify, sender, room);
                break;
            default:
                const executionContext = await getExecutionContext(
                    http,
                    command.join(" ")
                );

                if (executionContext) {
                    console.log("Execution context: ", executionContext);

                    if (
                        !executionContext.actionIds.includes("out-of-context")
                    ) {
                        executeAction(
                            this.app,
                            sender,
                            room,
                            read,
                            http,
                            executionContext
                        );
                    }
                }
        }
    }
}
