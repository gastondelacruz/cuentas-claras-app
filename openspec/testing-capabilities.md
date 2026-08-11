# Testing Capabilities — cuentas-claras-app

**Document Version**: 1.0  
**Generated**: 2026-06-04  
**Project**: cuentas-claras-app  
**Status**: Pre-Scaffold (Inferred)

---

## Overview

This document declares the testing infrastructure and strategy for the Expo React Native + TypeScript app. Testing capabilities are **inferred** for the planned stack because the project has not yet been scaffolded. After initial `expo init` and dependency setup, these declarations will be validated and updated.

---

## Test Runner & Framework

| Component | Tool | Status | Notes |
|-----------|------|--------|-------|
| **Test Runner** | Jest | Planned | jest + jest-expo for React Native compatibility |
| **Test Environment** | jest-expo | Planned | Expo-specific preset for native modules |
| **Component Testing** | @testing-library/react-native | Planned | User-centric component testing |
| **Assertion Helpers** | @testing-library/jest-native | Planned | Native matchers (e.g., `toBeOnTheScreen`) |
| **Snapshot Testing** | Jest snapshots | Supported | For component shape validation |

---

## Test Organization

### Directory Structure
```
cuentas-claras-app/
├── __tests__/                          # Root test utilities, setup
│   ├── setup.ts                        # Jest setup, mocks, globals
│   └── fixtures/                       # Mock data, constants
│       ├── auth.fixtures.ts
│       ├── groups.fixtures.ts
│       └── expenses.fixtures.ts
│
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── __tests__/
│   │   │   │   ├── useAuth.test.ts
│   │   │   │   └── LoginScreen.test.tsx
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   └── hooks/
│   │   │
│   │   └── [other features with __tests__/]
│   │
│   └── shared/
│       ├── ui/
│       │   ├── __tests__/
│       │   │   ├── Button.test.tsx
│       │   │   └── Input.test.tsx
│       │   └── [components]
│       │
│       ├── hooks/
│       │   ├── __tests__/
│       │   │   └── useDebounce.test.ts
│       │   └── [hooks]
│       │
│       ├── utils/
│       │   ├── __tests__/
│       │   │   └── formatCurrency.test.ts
│       │   └── [utilities]
│       │
│       └── api/
│           ├── __tests__/
│           │   └── client.test.ts
│           └── [api setup]
```

### Test File Naming
- **Component tests**: `{ComponentName}.test.tsx`
- **Hook tests**: `{hookName}.test.ts`
- **Utility tests**: `{utilityName}.test.ts`
- **Service tests**: `{serviceName}.test.ts`

---

## Testing Layers

### 1. Unit Tests
**Scope**: Utilities, helpers, validation logic  
**Example**: `formatCurrency('100', 'ARS')` → `'$100,00'`  
**Tool**: Jest + @testing-library/jest-native (for assertions)

```typescript
// src/shared/utils/__tests__/formatCurrency.test.ts
import { formatCurrency } from '../formatCurrency';

describe('formatCurrency', () => {
  it('formats ARS amounts with thousand separators', () => {
    expect(formatCurrency(1000, 'ARS')).toBe('$1.000,00');
  });
});
```

### 2. Component Tests
**Scope**: React components, user interactions, screen navigation  
**Example**: Button click triggers callback  
**Tool**: @testing-library/react-native

```typescript
// src/shared/ui/__tests__/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button onPress={onPress} label="Submit" />);
    
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### 3. Hook Tests
**Scope**: Custom hooks (useAuth, useExpenses, etc.)  
**Example**: Hook state updates on API response  
**Tool**: @testing-library/react-native + renderHook

```typescript
// src/features/auth/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('stores token after login', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('user@test.com', 'password');
    });
    
    expect(result.current.token).toBeDefined();
  });
});
```

### 4. API Integration Tests
**Scope**: Axios instance, interceptors, error handling  
**Example**: 401 response triggers token refresh  
**Tool**: Jest + axios mock adapter

```typescript
// src/shared/api/__tests__/client.test.ts
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createClient } from '../client';

describe('API Client - Token Refresh', () => {
  it('refreshes token on 401 and retries request', async () => {
    const mock = new MockAdapter(client);
    mock.onGet('/groups').replyOnce(401);
    mock.onPost('/auth/refresh').reply(200, { accessToken: 'new-token' });
    mock.onGet('/groups').replyOnce(200, [{ id: '1', name: 'Friends' }]);
    
    const response = await client.get('/groups');
    expect(response.data).toHaveLength(1);
  });
});
```

### 5. Screen/Integration Tests (Optional First Phase)
**Scope**: Full screen flows (login → home navigation)  
**Example**: User logs in, lands on home, groups list loads  
**Tool**: @testing-library/react-native + mock backend

```typescript
// src/features/auth/screens/__tests__/LoginScreen.integration.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';

describe('LoginScreen - Integration', () => {
  it('logs in user and navigates to home', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'user@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));
    
    // Mock API responds with token
    await waitFor(() => {
      expect(navigation.navigate).toHaveBeenCalledWith('Home');
    });
  });
});
```

---

## Mocking Strategy

### API Mocking
- Use **jest.mock()** for Axios instance in test files
- Use **MSW (Mock Service Worker)** for complex multi-endpoint scenarios (optional, phase 2)
- Provide **fixtures** with realistic data (see `__tests__/fixtures/`)

### Secure Storage Mocking
```typescript
// __tests__/setup.ts
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key) => {
    // Return mock token
    return key === 'refreshToken' ? 'mock-refresh-token' : null;
  }),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));
```

### Native Module Mocking
```typescript
// For react-navigation, lucide-react-native, etc.
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({ navigate: jest.fn() })),
  // ...
}));
```

---

## Strict TDD Policy

### Current Status
**`strict_tdd: false`** — Project not yet scaffolded  

### Rationale
- Expo scaffold and initial boilerplate will be generated first
- Jest setup and test environment validation comes next
- Once confirmed, TDD will be enabled for all feature work

### Post-Scaffold Re-evaluation
After `expo init` and Jest configuration:
1. Confirm Jest + jest-expo run without errors
2. Validate @testing-library/react-native setup
3. Create first placeholder test (e.g., Button component)
4. Update `config.yaml` to `strict_tdd: true`
5. Require test coverage in all subsequent PRs

---

## Coverage & Quality Gates

### Coverage Targets
| Layer | Threshold | Exempt |
|-------|-----------|--------|
| **Business Logic** (services, hooks) | 80% | N/A |
| **Components** | 70% | Navigation boilerplate, styling-only components |
| **Utilities** | 85% | Type definitions, constants |
| **API Integration** | 75% | Environment-specific endpoints |

### Quality Gates in CI
- `pnpm verify` must pass the full Jest suite, TypeScript check, and high-threshold security audit
- `pnpm dlx expo-doctor` must pass the separate Expo compatibility check
- No snapshots added without review

---

## Test Execution & CI Integration

### Local Development
```bash
# Run required implementation verification
pnpm verify

# Run all tests directly
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run specific test file
pnpm test useAuth.test.ts
```

### CI/CD (GitHub Actions, TBD)
```yaml
# (Placeholder) .github/workflows/test.yml
on: [push, pull_request]
jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm verify
      - run: pnpm dlx expo-doctor
```

---

## Known Limitations & Gaps (Pre-Scaffold)

1. **Native Module Testing**: Some Expo modules may require specialized setup (e.g., expo-font, expo-secure-store)
2. **Device-Specific Features**: Navigation and geolocation tests may need device simulation
3. **Performance Testing**: No performance benchmarks defined yet (phase 2)
4. **E2E Testing**: Not included in initial scope; consider Detox or similar for future

---

## Migration Path: strict_tdd Enablement

**Timeline**: After scaffold (within 1–2 days)

1. Create `.github/workflows/test.yml` for CI
2. Configure Jest coverage thresholds in `package.json`
3. Add pre-commit hook to run tests
4. Write first 3–5 unit tests (Button, useAuth, formatCurrency)
5. Update `config.yaml` and `testing-capabilities.md` to `strict_tdd: true`
6. Enforce TDD in PR reviews

---

## References

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Expo + Jest Setup](https://docs.expo.dev/guides/testing-with-jest/)
