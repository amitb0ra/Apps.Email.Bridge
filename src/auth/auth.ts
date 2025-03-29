import { IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { EmailBridgeApp } from "../../EmailBridgeApp";
import { sendMessage } from "../helpers/message";

export async function auth(
    app: EmailBridgeApp,
    read: IRead,
    modify: IModify,
    sender: IUser,
    room: IRoom
): Promise<void> {
    const url = await app
        .getOauth2ClientInstance()
        .getUserAuthorizationUrl(sender);

    const message = "Authorize Gmail";
    const blocks = modify.getCreator().getBlockBuilder();

    blocks.addActionsBlock({
        elements: [
            blocks.newButtonElement({
                actionId: "authorize",
                text: blocks.newPlainTextObject("Authorize Gmail"),
                url: url.toString(),
            }),
        ],
    });

    await sendMessage(read, sender, room, message, blocks);
}
