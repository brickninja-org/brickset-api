---
"@brickset-api/types": patch
"@brickset-api/client": patch
---

Align Brickset API parameter modeling and client-side validation:

- Fix `getSets` options typing so `query` matches docs as a string search term.
- Add stricter `setUserFlagLabels` typing helper in types.
- Add runtime validation guards in client for documented limits (pagination, quantity ranges, rating, flag-label length).
