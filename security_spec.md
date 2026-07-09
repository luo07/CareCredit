# Security Specification

## Data Invariants
1. Users must only be able to create their own profile. Only the owner can modify their `bio`, `name`, `skills`, `supportNeeds`, `languages`, `avatarUrl`.
2. Users cannot modify their `credits`, `role`, or `trustScore` directly.
3. Only verified Taylor's University students can create users or perform primary actions, but since the app verifies email on login, `email_verified` is required for all writes.
4. Tasks can only be created by signed-in verified users.
5. Task status can only be updated in valid state transitions.
6. Messages within a task can only be read/written by task participants (`creatorId` or `acceptedById`).
7. Users cannot write directly to transactions.
8. Feedback can only be written if the user was part of the task, and the task is complete.

## The Dirty Dozen Payloads
1. User creates profile for another `userId`.
2. User modifies `role` to 'admin' directly.
3. User modifies `credits` to 1000 directly.
4. User updates `status` of a task they don't own to 'cancelled'.
5. User updates `status` to a non-existent state like 'hacked'.
6. User creates a task with a massive 2MB description string.
7. User reads messages of a task they are not involved in.
8. User creates a message in a task they are not involved in.
9. User modifies an existing transaction record.
10. User creates feedback for a task they are not involved in.
11. User sets feedback rating to 100 (range 1-5).
12. User creates a profile without required fields.
