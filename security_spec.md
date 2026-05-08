# Security Specification for Stakes.io

## Data Invariants
- Users can only create their own profile.
- Stakes must have a creatorId matching the authenticated user.
- Stakes cannot have their status updated to a "terminal" state (completed/failed) without valid criteria (though for this MVP, we trust the owner).
- Once a stake is completed or failed, it cannot be edited further.
- Cheers can be added by any authenticated user but not edited/deleted by others.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing (Create Stake)**: Creating a stake with a different `creatorId`.
2. **Identity Spoofing (Update Profile)**: Modifying someone else's profile.
3. **Ghost Field Injection**: Adding `isAdmin: true` to a stake document.
4. **State Shortcut**: Creating a stake already marked as `completed`.
5. **Terminal State Bypass**: Changing a `failed` stake back to `pending`.
6. **Timeline Fraud**: Setting `createdAt` to a month ago instead of `request.time`.
7. **Resource Poisoning**: Using a 10MB string for the `task` description.
8. **ID Poisoning**: Using a path-traversal string as a stake document ID.
9. **Anonymous Vandalism**: Creating a cheer without being signed in.
10. **Ownership Theft**: Changing the `creatorId` of an existing stake.
11. **PII Leak**: Reading all user profiles blindly (only specific fields or the user's own data should be accessible if private).
12. **Outdated Update**: Updating a stake without setting `updatedAt` to `request.time`.

## Test Runner (firestore.rules.test.ts)
(To be implemented in the next step)
