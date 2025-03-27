# TODO

## App flow (MVP):

1. ~~on app install, send welcome message~~

2. ~~command list:~~
   - ~~/email help - send help message.~~
   - ~~/email auth - authenticate email.~~
   - ~~/email {prompt} - get execution context~~

3. ~~get execution context~~
    - ~~get execution context from user prompt~~

4. ~~execute action~~
    - ~~execute actionIds~~

### Actions:

1. summary
    - summarize thread/channel/discussion
2. ~~send email~~
    - ~~to specified recipient(s)~~
3. search emails
    - ~~date range and keywords~~
    - send in-channel as message and/or extract attachment and upload to channel
4. ~~report~~
    - ~~total emails~~

## MORE FUN (AFTER MVP):

1. /email auth - more email providers
    - google - authenticate google email
    - outlook - authenticate outlook email

2. /email contact - open contact manage contextual bar
    - CRUD on contacts
    - get contact list from email provider

3. get execution context
    - if "out of context", open modal to provide more context and retry

4. execute action
    - handle success and failure of actions

### Actions:

1. summary
    - summarize based on filter of time, usernames, unread, etc.
    - select how you want summary like follow up questions, assigned tasks etc.
    - file summary
2. send email
    - open modal to edit email or confirm before sending.
    - more parameters like cc, bcc, attachments etc.
3. search emails
    - based on unread, from, to, cc, bcc, etc.
    - open modal to list emails and select which ones to send to channel.
4. report
    - daily/weekly/monthly report
    - report on unread emails, emails sent, emails received, from whom, topics etc.
5. more email functions like change label etc.
6. send notification of new emails
7. etc.