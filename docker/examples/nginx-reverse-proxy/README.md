# nginx-reverse-proxy

Adds a reverse proxy in front of the Dolt Workbench that implements basic authentication.
It passes through user headers that can be used by the workbench as the author of commits
and tags.

## Getting started

```
% docker compose build
% docker compose up
```
