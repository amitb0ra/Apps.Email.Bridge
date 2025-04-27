import {
    IAppAccessors,
    IAppInstallationContext,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    IAuthData,
    IOAuth2ClientOptions,
} from "@rocket.chat/apps-engine/definition/oauth2/IOAuth2";
import { createOAuth2Client } from "@rocket.chat/apps-engine/definition/oauth2/OAuth2";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { EmailCommand } from "./src/commands/EmailCommand";
import { OAuth2Client } from "@rocket.chat/apps-engine/server/oauth2/OAuth2Client";
import { sendHelperMessageOnInstall } from "./src/helpers/message";
import { UIKitViewSubmitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit/UIKitInteractionContext";
import { ExecuteViewSubmitHandler } from "./src/handlers/ExecuteViewSubmitHandler";
export class EmailBridgeApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async extendConfiguration(
        configuration: IConfigurationExtend
    ): Promise<void> {
        await Promise.all([
            configuration.slashCommands.provideSlashCommand(
                new EmailCommand(this)
            ),
            this.getOauth2ClientInstance().setup(configuration),
        ]);
    }

    public async handleCallback(token: IAuthData) {
        if (token) {
            console.log("Authentication Success");
        } else {
            console.log("Authentication Failed");
        }
    }

    public oauth2ClientInstance: OAuth2Client;
    public getOauth2ClientInstance(): OAuth2Client {
        const oauthConfig: IOAuth2ClientOptions = {
            alias: "email-bridge-app",
            accessTokenUri: "https://oauth2.googleapis.com/token",
            authUri: "https://accounts.google.com/o/oauth2/auth",
            refreshTokenUri: "https://oauth2.googleapis.com/token",
            revokeTokenUri: "https://oauth2.googleapis.com/revoke",
            defaultScopes: [
                "https://mail.google.com/",
                "https://www.googleapis.com/auth/contacts",
            ],
            authorizationCallback: this.handleCallback.bind(this),
        };

        try {
            if (!this.oauth2ClientInstance) {
                this.oauth2ClientInstance = createOAuth2Client(
                    this,
                    oauthConfig
                );
            }
        } catch (error) {
            console.error("getOauth2ClientInstance error", error);
            throw new Error("Failed to create OAuth2 client instance");
        }
        return this.oauth2ClientInstance;
    }

    public async onInstall(
        context: IAppInstallationContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<void> {
        const { user } = context;
        await sendHelperMessageOnInstall(user, read, modify);
        return;
    }

    public async executeViewSubmitHandler(
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ) {
        const handler = new ExecuteViewSubmitHandler(
            this,
            read,
            http,
            modify,
            persistence
        );
        return await handler.run(context);
    }
}
