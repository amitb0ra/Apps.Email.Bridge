import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { UIKitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit/UIKitInteractionContext";
import { IUIKitModalViewParam } from "@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder";
import { TextObjectType } from "@rocket.chat/apps-engine/definition/uikit/blocks";
import { get, set } from "../helpers/persistence";

export async function confirmSendEmail({
    modify,
    read,
    persistence,
    http,
    slashCommandContext,
    uiKitContext,
    subject,
    body,
    recipients,
}: {
    modify: IModify;
    read: IRead;
    persistence: IPersistence;
    http: IHttp;
    slashCommandContext?: SlashCommandContext;
    uiKitContext?: UIKitInteractionContext;
    subject?: string;
    body?: string;
    recipients?: string[];
}): Promise<IUIKitModalViewParam> {
    const blocks = modify.getCreator().getBlockBuilder();

    blocks.addInputBlock({
        blockId: "recipientsBlockId",
        label: {
            text: "Recipients:",
            type: TextObjectType.PLAINTEXT,
        },
        element: blocks.newPlainTextInputElement({
            actionId: "recipientsBlockId",
            initialValue: recipients?.join(", ") || "",
        }),
    });

    blocks.addInputBlock({
        blockId: "subjectBlockId",
        label: {
            text: "Subject:",
            type: TextObjectType.PLAINTEXT,
        },
        element: blocks.newPlainTextInputElement({
            actionId: "subjectBlockId",
            initialValue: subject,
        }),
    });

    blocks.addInputBlock({
        blockId: "bodyBlockId",
        label: {
            text: "Body:",
            type: TextObjectType.PLAINTEXT,
        },
        element: blocks.newPlainTextInputElement({
            actionId: "bodyBlockId",
            initialValue: body,
        }),
    });

    return {
        id: "ConfirmSendEmail",
        title: blocks.newPlainTextObject("Confirm Send Email"),
        submit: blocks.newButtonElement({
            text: blocks.newPlainTextObject("Send"),
        }),
        blocks: blocks.getBlocks(),
    };
}
