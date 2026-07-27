# Module Assignment and Phishing Auto-Redirect Specification

## Module Assignment Options

Training modules can be assigned to:

1. All Users
2. Departments
3. Specific Users
4. Only Me, for admin testing

Each assignment should include:

- Module name
- Due date
- Audience type
- Assigned users/departments
- Reminder schedule
- Completion tracking
- Certificate mapping, if applicable

## Module Content Types

- Video training
- Interactive module
- Quiz
- Fill-in-the-blanks
- Puzzle
- Scenario-based decision module
- Microlearning card

## Phishing Simulation Assignment Options

Phishing campaigns can be sent to:

1. All Users
2. Departments
3. Specific Users
4. Only Me, for testing

Campaigns must include:

- Consent note
- Approved domain
- Approved template
- No credential collection confirmation
- HR/legal approval, if required
- Landing page or redirect rule

## Auto-Redirect After Phish Click

When a user clicks a phishing simulation link, the platform should automatically redirect to one of the following safe training experiences:

1. Training landing page
2. Video training
3. Interactive module
4. Quiz / microlearning

Recommended flow:

Email Sent → User Clicks → Safe Event Tracking → Auto Redirect → Training Completed → Report Updated

## Remedial Training Rules

If user clicks:

- Assign Phishing Basics module
- Show Red Flag Lens interactive exercise
- Require 3-question micro quiz
- Update user risk score

If user repeatedly clicks:

- Assign advanced module
- Notify manager/admin, optional
- Mark as needs coaching

## Production Safety Rule

Never collect real passwords or sensitive data. The redirect destination must be a training experience only.
