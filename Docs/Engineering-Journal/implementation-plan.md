# Implementation Plan — RBAC Matrix Compliance (minimal, matrix-only)

Scope rule: implement only what the provided RBAC matrix specifies. No PATCH/DELETE
users, no new permissions beyond what the matrix implies, no UI features outside the
gating rules listed.

## Verified current state
- Analytics already enforces `canViewAnalytics` + super_admin `?clientId` switch.
- `register` is super_admin-only (matches matrix).
- `createClientUser`/`createClientApiKey` already use `canUserAccessClient`
  (super_admin OR own-tenant client_admin).
- `getClientApiKeys`/`listClientUsers` already tenant-scoped.
- Security (CORS allowlist, cookie sameSite, auth rate-limit) already done.

## Backend changes (Server/) — close only the matrix gaps
1. GET /admin/clients/:clientId -> allow client_admin (own tenant) + client_viewer
   (own tenant, read-only) in addition to super_admin. Use canUserAccessClient.
2. GET /admin/clients -> super_admin only (matrix: super_admin only). No change
   beyond confirming it stays super_admin-only (already is).
3. GET /admin/clients/:clientId/users -> allow client_admin (own tenant) +
   optionally client_viewer (own tenant) per matrix note. Apply canUserAccessClient
   (currently controller re-checks super_admin only - fix to include tenant roles).
4. POST /admin/clients/:clientId/users and POST /admin/clients/:clientId/api-keys ->
   confirm client_admin (own tenant) allowed (matrix says recommended). Already
   enforced via canUserAccessClient; verify no super_admin-only block remains.
5. GET /admin/clients/:clientId/api-keys -> client_admin (own tenant) allowed per
   matrix. Already tenant-scoped via getClientApiKeys; confirm.
6. onboard-super-admin -> leave as-is (public bootstrap; existing findAll() guard
   already disables after first user). No change.

No new endpoints, no new permissions. Only relax the read endpoints to include
tenant roles per matrix.

## Frontend changes (dashboard/) — mirror backend gating exactly
1. Session/role helper from useProfile: expose role, isSuperAdmin, canManageUsers
   (perm), canCreateApiKeys (perm), canViewAnalytics (perm), and clientId.
2. Sidebar nav gating:
   - super_admin: show Clients nav + onboarding hints/actions.
   - client_admin: show tenant user/key management (Client detail) but hide global
     client list + onboarding.
   - client_viewer: hide all management actions/buttons; show dashboard (read-only).
3. Client detail button gating: hide "New user"/"New API key" unless
   canManagerUsers/canCreateApiKeys. Key-once copy UI stays.
4. 403 handling: API 403 -> inline "access denied" (already partially present).
   401 -> redirect /login.

## Verification per change
- Backend: node --check on edited files; optional curl matrix (super_admin sees all;
  client_admin sees only own tenant; client_viewer gets 403 on mutations).
- Frontend: tsc --noEmit + next lint + next build green; nav/buttons hidden per role.

## Implemented
- [x] Docs/Engineering-Journal/implementation-plan.md written
- [x] Backend item 3: GET /admin/clients/:clientId/users already uses
      canUserAccessClient (tenant roles allowed).
- [x] Backend items 2,4,5: confirmed compliant (listClients super_admin-only;
      createClientUser/createClientApiKey + getClientApiKeys already tenant-scoped).
- [x] Backend item 1: GET /admin/clients/:clientId now uses canUserAccessClient
      (super_admin OR own-tenant client_admin/client_viewer). clientController.js.
- [x] Frontend item 1: role helper `useRole` derived from useProfile
      (role, isSuperAdmin, isClientAdmin, isClientViewer, clientId, permission
      flags). dashboard/src/hooks/useRole.ts.
- [x] Frontend item 2: sidebar nav gating — super_admin sees Clients; client
      roles see "My Client" (own tenant); hidden global list + onboarding for
      non-super-admins. sidebar.tsx.
- [x] Frontend item 3: client-detail hides New user / New API key unless
      canManageUsers / canCreateApiKeys. client-detail.tsx.
- [x] Frontend item 4: 401 -> redirect /login; 403 inline "access denied"
      (already present). api client wrapper redirects on 401.
- [x] Verification: backend node --check OK; frontend tsc --noEmit, eslint,
      next build all green.
