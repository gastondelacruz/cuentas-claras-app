---
name: react-query
description: TanStack Query (React Query) for data fetching, caching, mutations, and server state synchronization in React Native / Expo apps. Use when implementing useQuery, useMutation, QueryClient, queryKey design, staleTime, retry logic, or invalidation.
version: 1.0.0
---

## Context7 — Consult Before Applying Rules

Before applying any rule from this skill, query Context7 for up-to-date documentation:

1. Resolve the library: `resolve-library-id` with name `TanStack Query`
2. Query the specific topic: `query-docs` with libraryId `/tanstack/query` and your concrete question
3. Let live docs override rules here when they conflict — this skill documents project conventions, not the library itself

## When to Apply

Use this skill when:
- Setting up `QueryClient` and `QueryClientProvider`
- Writing `useQuery` hooks for data fetching
- Writing `useMutation` hooks for data modification
- Designing `queryKey` arrays
- Configuring `staleTime`, `retry`, `refetchOnWindowFocus`
- Invalidating and refetching queries after mutations
- Handling loading, error, and success states

## Project Setup

This project already has `queryClient` in `src/shared/api/queryClient.ts` and the axios `client` in `src/shared/api/client.ts`.

**QueryClient config (already set):**
```ts
// src/shared/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});
```

Do NOT create a new QueryClient. Import from `src/shared/api/queryClient.ts`.

## Query Key Convention

Use arrays with the domain and identifiers. Keep keys stable and serializable:

```ts
// ✅ Good
['groups']                          // list
['groups', groupId]                 // single item
['expenses', { groupId }]           // filtered list
['auth', 'session']                 // non-resource keys

// ❌ Bad
['getGroups']                       // verb in key
[groupId]                           // missing domain
```

## useQuery Patterns

**Basic query:**
```tsx
import { useQuery } from '@tanstack/react-query';

function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => client.get('/v1/groups').then(r => r.data),
  });
}
```

**Dependent query:**
```tsx
function useGroupExpenses(groupId: string | undefined) {
  return useQuery({
    queryKey: ['expenses', { groupId }],
    queryFn: () => client.get(`/v1/groups/${groupId}/expenses`).then(r => r.data),
    enabled: Boolean(groupId),  // only runs when groupId is defined
  });
}
```

**Destructure only what you need:**
```tsx
const { data, isLoading, isError, error } = useGroups();
```

## useMutation Patterns

**Mutation with invalidation:**
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateGroupDto) =>
      client.post('/v1/groups', body).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
```

**Optimistic update (when needed):**
```tsx
function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) =>
      client.delete(`/v1/groups/${groupId}`),
    onMutate: async (groupId) => {
      await queryClient.cancelQueries({ queryKey: ['groups'] });
      const previous = queryClient.getQueryData(['groups']);
      queryClient.setQueryData(['groups'], (old: Group[]) =>
        old.filter(g => g.id !== groupId)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['groups'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
```

## Error Handling

React Query surfaces errors via `isError` and `error`. Always handle both loading and error states:

```tsx
function GroupList() {
  const { data, isLoading, isError, error } = useGroups();

  if (isLoading) return <ActivityIndicator />;
  if (isError) return <Text>Error: {error.message}</Text>;

  return <FlatList data={data} ... />;
}
```

## Rules

- **Do NOT call `useQuery` inside callbacks or conditions** — hooks must be at top level
- **Keep `queryFn` as a plain async function** — it receives `{ queryKey, signal }` and should throw on error
- **Never store query results in Zustand** — React Query IS the server-state store; Zustand is for client/UI state only
- **One hook per query** — wrap `useQuery` in a named hook (`useGroups`, `useGroupById`) instead of calling it inline in components
- **Cancel on unmount** — pass `signal` from `queryFn` params to fetch/axios for proper cancellation
- **Avoid `enabled: false` as a workaround** — prefer dependent queries (`enabled: Boolean(id)`) for conditional fetching

## Common Mistakes

**Wrong: storing server data in Zustand**
```ts
// Don't do this — React Query handles server state
const groups = useGroupStore(s => s.groups);
```

**Wrong: queryFn that swallows errors**
```ts
queryFn: async () => {
  try {
    return await fetch(...).then(r => r.json());
  } catch { return null; }  // ❌ React Query won't know it failed
}
```

**Right: let errors propagate**
```ts
queryFn: async ({ signal }) => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
```

## File Placement

- Query hooks → `src/features/<domain>/hooks/use<Entity>.ts`
- Mutation hooks → `src/features/<domain>/hooks/use<Action><Entity>.ts`
- QueryClient (shared singleton) → `src/shared/api/queryClient.ts` (already exists, don't recreate)
