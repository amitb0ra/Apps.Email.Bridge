const GET_EXECUTION_CONTEXT_FROM_USER_PROMPT = `
You are a system agent tasked with analyzing a user's natural language input to determine the user's intended action related to email interaction. Your goal is to classify the user's intent into one or more valid action IDs and extract the relevant data (such as recipients, search keywords, date ranges, etc.) for each action.

### Valid Action IDs:
- "summary": User wants to summarize a discussion or email thread.
- "search": User wants to retrieve emails based on keywords, attachments, or time range.
- "report": User wants to request email statistics, such as daily counts or trends.
- "out-of-context": User's input does not match any of the valid actions above.

### Example Commands and Expected Outputs:

1. User Input: "summarize this thread and send it as email to my boss"  
   Expected Output:  
   {"actionIds": ["summary"], "summary": {"recipients": ["boss"]}}

2. User Input: "Can you summarize our discussion?"  
   Expected Output:  
   {"actionIds": ["summary"]}

3. User Input: "Find all emails with attachments from March."  
   Expected Output:  
   {"actionIds": ["search"], "search": {"keywords": ["attachments"], "startDate": "2025-03-01", "endDate": "2025-03-31"}}

4. User Input: "What's the weather like today?"  
   Expected Output:  
   {"actionIds": ["out-of-context"]}

### Rules:
1. Return only a valid JSON object in the format:  
   {"actionIds": [...]}

   Example:  
   {"actionIds": ["summary", "search"]}

2. Do NOT return anything else (no explanations, no markdown, no formatting).

3. If the user's prompt is ambiguous or lacks context, return:  
   {"actionIds": ["out-of-context"]}

USER PROMPT: {dialogue}`;

export function GetExecutionContextFromUserPrompt(dialogue: string): string {
    return GET_EXECUTION_CONTEXT_FROM_USER_PROMPT.replace(
        "{dialogue}",
        dialogue
    );
}

const SUMMARY_PROMPT = `
You are tasked with summarizing a dialogue in a professional and concise manner for email. The summary should be brief, structured as a formal email, and include only the necessary information to give the recipient a clear understanding of the conversation. Mention the names of specific persons involved.

The email summary should have:
1. A polite greeting to the recipient.
2. A clear, concise summary of the conversation.
3. A closing line that is appropriate for email communication.

### Example Dialogue Summaries:

1. Dialogue: 
   Tim: Hi, what's up? Kim: Bad mood tbh, I was going to do lots of stuff but ended up procrastinating Tim: What did you plan on doing? Kim: Oh you know, uni stuff and unfucking my room Kim: Maybe tomorrow I'll move my ass and do everything Kim: We were going to defrost a fridge so instead of shopping I'll eat some defrosted veggies Tim: For doing stuff I recommend Pomodoro technique where u use breaks for doing chores Tim: It really helps Kim: thanks, maybe I'll do that Tim: I also like using post-its in kaban style

   Summary:
   subject: Summary of Recent Discussion on Productivity Techniques

   body:
   In a recent conversation, Kim mentioned that she was feeling a bit demotivated and had procrastinated on tasks she had planned for the day, including some university work and cleaning her room. Tim suggested trying the Pomodoro technique for better productivity, which Kim appreciated and might try. 

2. Dialogue: 
   John: Ave. Was there any homework for tomorrow? Cassandra: hello :D Of course, as always :D John: What exactly? Cassandra: I'm not sure so I'll check it for you in 20minutes. John: Cool, thanks. Sorry I couldn't be there, but I was busy as fuck...my stupid boss as always was trying to piss me off Cassandra: No problem, what did he do this time? John: Nothing special, just the same as always, treating us like children, commanding to do this and that... Cassandra: sorry to hear that. but why don't you just go to your chief and tell him everything? John: I would, but I don't have any support from others, they are like goddamn pupets and pretend that everything's fine...I'm not gonna fix everything for everyone Cassandra: I understand...Nevertheless, just try to ignore him. I know it might sound ridiculous as fuck, but sometimes there's nothing more you can do. John: yeah I know...maybe some beer this week? Cassandra: Sure, but I got some time after classes only...this week is gonna be busy John: no problem, I can drive you home and we can go to some bar or whatever. Cassandra: cool. ok, i got this homework. it's page 15 ex. 2 and 3, I also asked the others to study another chapter, especially the vocabulary from the very first pages. Just read it. John: gosh...I don't know if I'm smart enough to do it :'D Cassandra: you are, don't worry :P Just circle all the words you don't know and we'll continue on Monday. John: ok...then I'll try my best :D Cassandra: sure, if you will have any questions just either text or call me and I'll help you. John: I hope I won't have to waste your time xD Cassandra: you're not wasting my time, I'm your teacher, I'm here to help. This is what I get money for, also :P John: just kidding :D ok, so i guess we'll stay in touch then Cassandra: sure, have a nice evening :D John: you too, se ya Cassandra: Byeeeee

   Summary:
   subject: Summary of Homework and Teacher-Student Conversation

   body:
   In a recent conversation between John and Cassandra, John inquired about homework and explained his absence due to work issues. Cassandra provided John with the details of the homework, which includes exercises on page 15, ex. 2 and 3, and suggested he study vocabulary from the first pages of the chapter. They also discussed meeting up for a beer later in the week after classes.

3. Dialogue: 
   Leon: did you find the job yet? Arthur: no bro, still unemployed :D Leon: hahaha, LIVING LIFE Arthur: i love it, waking up at noon, watching sports - what else could a man want? Leon: a paycheck? ;) Arthur: don't be mean... Leon: but seriously, my mate has an offer as a junior project manager at his company, are you interested? Arthur: sure thing, do you have any details? Leon: <file_photo> Arthur: that actually looks nice, should I reach out directly to your friend or just apply to this email address from the screenshot? Leon: it's his email, you can send your resume directly and I will mention to him who you are :)

   Summary:
   subject: Job Offer for Junior Project Manager

   body:
   In a conversation between Leon and Arthur, Leon offered Arthur a job opportunity for a junior project manager position at his friend’s company. Arthur expressed interest and inquired about the application process. Leon provided Arthur with the necessary contact details, recommending that he send his resume directly to his friend.

### Rules:
1. Return a valid email summary in the following format:
{ "subject": "[subject]" , "body": "[body]" }

2. Do NOT return anything else (no explanations, no markdown, no formatting).

3.Ensure the summary:
- Starts with a polite greeting to the recipient.
- Clearly summarizes the conversation in 1-3 short, simple sentences.
- Mentions the names of specific persons involved.
- Ends with a formal closing.

3. If the user's prompt is ambiguous or lacks context, return:
{ "subject": "out-of-context", "body": "out-of-context" }

USER PROMPT: {dialogue} `;

export function createSummaryPrompt(dialogue: string): string {
    return SUMMARY_PROMPT.replace("{dialogue}", dialogue);
}
