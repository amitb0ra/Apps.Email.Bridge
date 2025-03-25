import { IHttp } from "@rocket.chat/apps-engine/definition/accessors";
import { GetExecutionContextFromUserPrompt } from "../constants/prompts";
import { IExecutionContext } from "../definations/IExecutionContext";
import { llm } from "../helpers/llmProvider";

export async function getExecutionContext(
    http: IHttp,
    userPrompt: string
): Promise<IExecutionContext> {
    try {
        const prompt = GetExecutionContextFromUserPrompt(userPrompt);
        const response = await llm(http, prompt);
        const executionContext = JSON.parse(response) as IExecutionContext;

        if (executionContext.actionIds.includes("out-of-context")) {
            // TODO: modal to provide more context and retry
        }

        return executionContext;
    } catch (error) {
        console.error("Error in getUserContext:", error);
        throw new Error("Failed to get user context");
    }
}
