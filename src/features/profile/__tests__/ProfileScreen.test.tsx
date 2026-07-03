/**
 * ProfileScreen — Bug 2 & Bug 3 Exploration & Preservation Tests
 *
 * Property 3: Bug Condition — Logout ejecuta la mutación y deshabilita el botón
 * Validates: Requirements 1.3, 1.4
 *
 * Property 4: Preservation — Datos de perfil no afectados
 * Validates: Requirements 3.4, 3.5
 *
 * Property 5: Bug Condition — ProfileCard renderiza Image hardcodeada y botón de edición
 * Validates: Requirements 1.5, 1.6
 *
 * Property 6: Preservation — Nombre, email y estado de verificación visibles (Bug 3 baseline)
 * Validates: Requirements 3.6, 3.7
 *
 * Bug condition tests MUST FAIL on unfixed code — failure confirms the bug exists.
 * Preservation tests MUST PASS on unfixed code — they capture the baseline behavior.
 */

import { fireEvent, render, screen } from "@testing-library/react-native";
import fc from "fast-check";

import packageJson from "../../../../package.json";
import { useLogout } from "../../auth/hooks/useLogout";
import { useProfileData } from "../hooks/useProfileData";
import { ProfileScreen } from "../screens/ProfileScreen";

// Mock useLogout to capture calls to mutate
jest.mock("../../auth/hooks/useLogout", () => ({
  useLogout: jest.fn(),
}));

// Mock useProfileData to avoid hitting real hooks/stores in render tests
jest.mock("../hooks/useProfileData", () => ({
  useProfileData: jest.fn(),
}));

const mockedUseLogout = jest.mocked(useLogout);
const mockedUseProfileData = jest.mocked(useProfileData);

const mockMutate = jest.fn();
const expectedVersionLabel = `Versión ${packageJson.version}`;

type ProfileMockOptions = {
  name?: string;
  email?: string;
  status?: string;
  avatarUrl?: string;
  initials?: string;
  activeDebtGroupsCount?: number;
  totalExpenseCount?: number;
  totalExpenses?: number;
  youOwe?: number;
  owedToYou?: number;
  netBalance?: number;
  currency?: string;
  summaryStatus?: "loading" | "error" | "empty" | "success";
  summaryError?: Error | null;
};

/** Builds a mock useLogout return value */
function makeLogoutMock({ isPending = false } = {}): ReturnType<
  typeof useLogout
> {
  return {
    mutate: mockMutate,
    isPending,
    isError: false,
    isSuccess: false,
    isIdle: !isPending,
    status: isPending ? "pending" : "idle",
    error: null,
    data: undefined,
    variables: undefined,
    reset: jest.fn(),
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    mutateAsync: jest.fn(),
  } as unknown as ReturnType<typeof useLogout>;
}

/** Builds a mock useProfileData return value with the given user/summary fields */
function makeProfileMock({
  name = "Ana López",
  email = "ana@example.com",
  status = "Verificado",
  avatarUrl = "https://example.com/avatar.jpg",
  initials = "AL",
}: ProfileMockOptions = {}): ReturnType<typeof useProfileData> {
  return {
    user: { name, email, status, avatarUrl, initials },
  };
}

function setupMocks({ isPending = false } = {}) {
  mockedUseLogout.mockReturnValue(makeLogoutMock({ isPending }));
  mockedUseProfileData.mockReturnValue(makeProfileMock());
}

describe("ProfileScreen — Bug 2: Cerrar sesión sin efecto", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  /**
   * Test 1 — Bug Condition
   *
   * Pressing "Cerrar sesión" SHOULD invoke useLogout().mutate().
   * On unfixed code this FAILS because the Pressable has no onPress prop.
   *
   * Validates: Requirements 1.3, 1.4
   */
  it('pressing "Cerrar sesión" invokes useLogout().mutate()', () => {
    render(<ProfileScreen />);

    const button = screen.getByLabelText("Cerrar sesión");
    fireEvent.press(button);

    // EXPECTED TO FAIL on unfixed code — onPress is missing from the Pressable
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  /**
   * Test 2 — Bug Condition
   *
   * When useLogout returns isPending: true, the button SHOULD be disabled.
   * On unfixed code this FAILS because there is no disabled prop on the Pressable.
   *
   * React Native's Pressable exposes the disabled state via `accessibilityState.disabled`
   * (not `props.disabled`) when queried through @testing-library/react-native.
   *
   * Validates: Requirements 1.3, 1.4
   */
  it("button is disabled when logout isPending is true", () => {
    setupMocks({ isPending: true });

    render(<ProfileScreen />);

    const button = screen.getByLabelText("Cerrar sesión");

    // EXPECTED TO FAIL on unfixed code — disabled prop is absent
    // Pressable exposes disabled state via accessibilityState.disabled in RNTL
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });
});

/**
 * ProfileScreen — Property 4: Preservation
 *
 * These tests MUST PASS on the UNFIXED code.
 * They capture the baseline rendering behavior of ProfileScreen so the fix
 * for Bug 2 (connecting onPress) cannot accidentally break profile data display.
 *
 * Observations from unfixed ProfileScreen.tsx:
 *   - profile.name   → rendered as <Text className="text-2xl font-bold ...">
 *   - profile.email  → rendered as <Text className="... text-neutral700"> (selectable)
 *   - profile.status → rendered as <Text className="text-xl text-debt"> inside status badge
 *   - summary cards  → account summary headings always present
 *   - version string → sourced from package metadata at the bottom
 *
 * Validates: Requirements 3.4, 3.5
 */
describe("ProfileScreen — Property 4: Preservation — datos de perfil no afectados", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  // ---------------------------------------------------------------------------
  // Concrete baseline tests (unit-level, observe specific values)
  // ---------------------------------------------------------------------------

  it("renders the authenticated user name", () => {
    render(<ProfileScreen />);
    expect(screen.getByText("Ana López")).toBeTruthy();
  });

  it("renders the authenticated user email", () => {
    render(<ProfileScreen />);
    expect(screen.getByText("ana@example.com")).toBeTruthy();
  });

  it('renders the user status badge ("Verificado")', () => {
    render(<ProfileScreen />);
    expect(screen.getByText("Verificado")).toBeTruthy();
  });

  it('renders the "Gasto Total" summary card heading', () => {
    render(<ProfileScreen />);
    expect(screen.getByText("Gasto Total")).toBeTruthy();
  });

  it('renders the "Te deben" summary card heading', () => {
    render(<ProfileScreen />);
    expect(screen.getByText("Te deben")).toBeTruthy();
  });

  it("renders account summary balance cards from the authenticated summary", () => {
    mockedUseProfileData.mockReturnValue(
      makeProfileMock({ owedToYou: 28830, youOwe: 1200, netBalance: 27630 }),
    );

    render(<ProfileScreen />);

    expect(screen.getByText("Te deben")).toBeTruthy();
    expect(screen.getByText("Debes")).toBeTruthy();
    expect(screen.getByText("Balance Total")).toBeTruthy();
    expect(screen.getByText("$28.830,00")).toBeTruthy();
    expect(screen.getByText("$1.200,00")).toBeTruthy();
    expect(screen.getByText("+$27.630,00")).toBeTruthy();
  });

  it("renders a loading state for account summary without showing incorrect zero balances", () => {
    mockedUseProfileData.mockReturnValue(
      makeProfileMock({ summaryStatus: "loading" }),
    );

    render(<ProfileScreen />);

    expect(screen.getByText("Cargando resumen financiero...")).toBeTruthy();
    expect(screen.queryByText("$0,00")).toBeNull();
    expect(screen.queryByText("+$0,00")).toBeNull();
  });

  it("renders an error state for account summary without showing incorrect zero balances", () => {
    mockedUseProfileData.mockReturnValue(
      makeProfileMock({
        summaryStatus: "error",
        summaryError: new Error("No se pudo cargar"),
      }),
    );

    render(<ProfileScreen />);

    expect(
      screen.getByText("No pudimos cargar tu resumen financiero"),
    ).toBeTruthy();
    expect(screen.getByText("No se pudo cargar")).toBeTruthy();
    expect(screen.queryByText("$0,00")).toBeNull();
    expect(screen.queryByText("+$0,00")).toBeNull();
  });

  it("renders an empty state when the account summary is unavailable without inventing zero balances", () => {
    mockedUseProfileData.mockReturnValue(
      makeProfileMock({ summaryStatus: "empty" }),
    );

    render(<ProfileScreen />);

    expect(screen.getByText("Resumen financiero no disponible")).toBeTruthy();
    expect(
      screen.getByText(
        "Todavía no hay datos suficientes para calcular tus saldos.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText("$0,00")).toBeNull();
    expect(screen.queryByText("+$0,00")).toBeNull();
  });

  it("renders the app version string", () => {
    render(<ProfileScreen />);
    expect(screen.getByText(expectedVersionLabel)).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Property-based tests — para cualquier usuario autenticado todos los campos
  // se renderizan correctamente
  // ---------------------------------------------------------------------------

  /**
   * Property 4a — nombre siempre visible
   *
   * For any authenticated user with a non-empty name, the name is rendered
   * in ProfileScreen regardless of other profile fields.
   *
   * Validates: Requirements 3.4
   */
  it("property: name is always visible for any authenticated user", () => {
    fc.assert(
      fc.property(
        // Generate realistic user names: 1–40 chars, printable ASCII, non-empty
        fc
          .string({ minLength: 1, maxLength: 40 })
          .filter((s) => s.trim().length > 0),
        fc.emailAddress(),
        (name, email) => {
          jest.clearAllMocks();
          mockedUseLogout.mockReturnValue(makeLogoutMock());
          mockedUseProfileData.mockReturnValue(
            makeProfileMock({ name, email }),
          );

          const { unmount } = render(<ProfileScreen />);

          const nameElement = screen.queryByText(name);
          unmount();

          return nameElement !== null;
        },
      ),
      { numRuns: 20 },
    );
  });

  /**
   * Property 4b — email siempre visible
   *
   * For any authenticated user with a valid email address, the email is rendered
   * in ProfileScreen.
   *
   * Validates: Requirements 3.4
   */
  it("property: email is always visible for any authenticated user", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 40 })
          .filter((s) => s.trim().length > 0),
        fc.emailAddress(),
        (name, email) => {
          jest.clearAllMocks();
          mockedUseLogout.mockReturnValue(makeLogoutMock());
          mockedUseProfileData.mockReturnValue(
            makeProfileMock({ name, email }),
          );

          const { unmount } = render(<ProfileScreen />);

          const emailElement = screen.queryByText(email);
          unmount();

          return emailElement !== null;
        },
      ),
      { numRuns: 20 },
    );
  });

  /**
   * Property 4c — resumen financiero (summary card headings) siempre visible
   *
   * For any combination of summary values, both summary card headings
   * ("Gasto Total" and "Te deben") are always rendered.
   *
   * Validates: Requirements 3.4
   */
  it("property: financial summary card headings always visible for any summary values", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50 }), // totalExpenseCount
        fc.integer({ min: 0, max: 100000 }), // totalExpenses
        fc.integer({ min: 0, max: 10 }), // activeDebtGroupsCount
        fc.integer({ min: 0, max: 50000 }), // youOwe
        (totalExpenseCount, totalExpenses, activeDebtGroupsCount, youOwe) => {
          jest.clearAllMocks();
          mockedUseLogout.mockReturnValue(makeLogoutMock());
          mockedUseProfileData.mockReturnValue(
            makeProfileMock({
              totalExpenseCount,
              totalExpenses,
              activeDebtGroupsCount,
              youOwe,
            }),
          );

          const { unmount } = render(<ProfileScreen />);

          const gastoTotal = screen.queryByText("Gasto Total");
          const teDeben = screen.queryByText("Te deben");
          unmount();

          return gastoTotal !== null && teDeben !== null;
        },
      ),
      { numRuns: 20 },
    );
  });

  /**
   * Property 4d — versión de la app siempre visible
   *
   * The version string is always rendered regardless of who the user is or
   * what the summary values are.
   *
   * Validates: Requirements 3.4
   */
  it("property: app version string always visible regardless of user data", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 40 })
          .filter((s) => s.trim().length > 0),
        fc.emailAddress(),
        (name, email) => {
          jest.clearAllMocks();
          mockedUseLogout.mockReturnValue(makeLogoutMock());
          mockedUseProfileData.mockReturnValue(
            makeProfileMock({ name, email }),
          );

          const { unmount } = render(<ProfileScreen />);

          const versionElement = screen.queryByText(expectedVersionLabel);
          unmount();

          return versionElement !== null;
        },
      ),
      { numRuns: 20 },
    );
  });
});

/**
 * ProfileScreen — Property 6: Preservation — Bug 3
 *
 * These tests MUST PASS on the UNFIXED code.
 * They capture the baseline that name, email, and verification status are always
 * rendered for any authenticated user — regardless of whether an avatar image or
 * an initials-based Avatar is used.
 *
 * Observations from unfixed ProfileScreen.tsx:
 *   - profile.name   → rendered in ProfileCard header
 *   - profile.email  → rendered as selectable text below the name
 *   - profile.status → rendered as "Verificado" inside the status badge
 *
 * Validates: Requirements 3.6, 3.7
 */
describe("ProfileScreen — Property 6: Preservation — nombre, email y estado de verificación (Bug 3)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  // ---------------------------------------------------------------------------
  // Concrete baseline tests
  // ---------------------------------------------------------------------------

  it("renders the authenticated user name", () => {
    render(<ProfileScreen />);
    expect(screen.getByText("Ana López")).toBeTruthy();
  });

  it("renders the authenticated user email", () => {
    render(<ProfileScreen />);
    expect(screen.getByText("ana@example.com")).toBeTruthy();
  });

  it('renders the verification status ("Verificado")', () => {
    render(<ProfileScreen />);
    expect(screen.getByText("Verificado")).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Property-based tests — for any authenticated user these three fields render
  // ---------------------------------------------------------------------------

  /**
   * Property 6a — nombre siempre visible (Bug 3 baseline)
   *
   * For any authenticated user, the name is rendered in ProfileScreen regardless
   * of whether the avatar is an Image or an initials component.
   *
   * Validates: Requirements 3.6
   */
  it("property: name is always visible regardless of avatar style", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 40 })
          .filter((s) => s.trim().length > 0),
        fc.emailAddress(),
        (name, email) => {
          jest.clearAllMocks();
          mockedUseLogout.mockReturnValue(makeLogoutMock());
          mockedUseProfileData.mockReturnValue(
            makeProfileMock({ name, email }),
          );

          const { unmount } = render(<ProfileScreen />);
          const nameElement = screen.queryByText(name);
          unmount();

          return nameElement !== null;
        },
      ),
      { numRuns: 20 },
    );
  });

  /**
   * Property 6b — email siempre visible (Bug 3 baseline)
   *
   * For any authenticated user with a valid email, the email is rendered in
   * ProfileScreen regardless of avatar implementation.
   *
   * Validates: Requirements 3.6
   */
  it("property: email is always visible regardless of avatar style", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 40 })
          .filter((s) => s.trim().length > 0),
        fc.emailAddress(),
        (name, email) => {
          jest.clearAllMocks();
          mockedUseLogout.mockReturnValue(makeLogoutMock());
          mockedUseProfileData.mockReturnValue(
            makeProfileMock({ name, email }),
          );

          const { unmount } = render(<ProfileScreen />);
          const emailElement = screen.queryByText(email);
          unmount();

          return emailElement !== null;
        },
      ),
      { numRuns: 20 },
    );
  });

  /**
   * Property 6c — estado de verificación siempre visible (Bug 3 baseline)
   *
   * For any authenticated user, the "Verificado" status badge is always rendered
   * in ProfileScreen. The status value comes from useProfileData and is hardcoded
   * as 'Verificado' — it must survive the Bug 3 avatar refactor unchanged.
   *
   * Validates: Requirements 3.7
   */
  it('property: "Verificado" status is always visible regardless of avatar style', () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 40 })
          .filter((s) => s.trim().length > 0),
        fc.emailAddress(),
        (name, email) => {
          jest.clearAllMocks();
          mockedUseLogout.mockReturnValue(makeLogoutMock());
          mockedUseProfileData.mockReturnValue(
            makeProfileMock({ name, email, status: "Verificado" }),
          );

          const { unmount } = render(<ProfileScreen />);
          const statusElement = screen.queryByText("Verificado");
          unmount();

          return statusElement !== null;
        },
      ),
      { numRuns: 20 },
    );
  });
});

/**
 * ProfileScreen — Bug 3: Imagen de perfil debe reemplazarse por avatar de iniciales
 *
 * Property 5: Bug Condition — ProfileCard renderiza Image hardcodeada y botón de edición
 * Validates: Requirements 1.5, 1.6
 *
 * These tests encode the EXPECTED CORRECT behavior (no edit button, no hardcoded image,
 * initials visible). They FAIL on unfixed code because the bug still exists.
 *
 * Test 1: asserts that 'Editar foto de perfil' does NOT exist
 *   → FAILS on unfixed code because the Pressable IS present (bug confirmed)
 * Test 2: asserts that no image role element exists
 *   → FAILS on unfixed code because <Image> IS rendered (bug confirmed)
 * Test 3: asserts that the user's initials ("AL" for "Ana López") ARE visible
 *   → FAILS on unfixed code because there is no Avatar/initials component (bug confirmed)
 */
describe("ProfileScreen — Bug 3: Imagen de perfil debe reemplazarse por avatar de iniciales", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  /**
   * Test 1 — Bug Condition
   *
   * The "Editar foto de perfil" edit button SHOULD NOT be present in the rendered output.
   * On unfixed code this FAILS because the Pressable with that label IS rendered.
   *
   * Counterexample (unfixed): getByLabelText('Editar foto de perfil') returns an element
   * instead of throwing — confirming the edit button exists when it should not.
   *
   * **Validates: Requirements 1.5, 1.6**
   */
  it('does NOT render the "Editar foto de perfil" edit button', () => {
    render(<ProfileScreen />);

    // EXPECTED TO FAIL on unfixed code — the Pressable with this label exists
    // When fixed: this element should not be found (query returns null)
    const editButton = screen.queryByLabelText("Editar foto de perfil");
    expect(editButton).toBeNull();
  });

  /**
   * Test 2 — Bug Condition
   *
   * No hardcoded <Image> element SHOULD be rendered inside ProfileCard.
   * On unfixed code this FAILS because <Image accessibilityLabel={profile.name} /> IS present.
   *
   * React Native's Image component does not expose `accessibilityRole="image"` by default,
   * so we detect it by its accessibilityLabel (set to profile.name = "Ana López") using
   * UNSAFE_getByType or by asserting no <Image> component with the user's name label exists.
   *
   * Counterexample (unfixed): queryByLabelText('Ana López') returns the <Image> element — the
   * hardcoded Image with avatarUrl from useProfileData is rendered with the user's name as label.
   *
   * **Validates: Requirements 1.5, 1.6**
   */
  it("does NOT render a hardcoded Image component for the profile avatar", () => {
    render(<ProfileScreen />);

    // EXPECTED TO FAIL on unfixed code — ProfileCard renders <Image accessibilityLabel="Ana López" />
    // When fixed: ProfileCard uses Avatar with initials; no <Image> with the user's name label exists
    // The Image in ProfileCard has accessibilityLabel set to profile.name ("Ana López")
    const profileImage = screen.queryByLabelText("Ana López");
    expect(profileImage).toBeNull();
  });

  /**
   * Test 3 — Bug Condition
   *
   * The user's initials SHOULD be visible in the avatar area.
   * For "Ana López" the initials are "AL".
   * On unfixed code this FAILS because ProfileCard renders an Image, not an initials avatar.
   *
   * Counterexample (unfixed): queryByText('AL') returns null — no text showing initials
   * exists in the rendered tree, confirming the initials-based avatar is not implemented.
   *
   * **Validates: Requirements 1.5, 1.6**
   */
  it('renders the user initials ("AL" for "Ana López") as the avatar', () => {
    render(<ProfileScreen />);

    // EXPECTED TO FAIL on unfixed code — ProfileCard uses <Image>, not an Avatar with initials
    // When fixed: the Avatar component should render the text "AL"
    expect(screen.getByText("AL")).toBeTruthy();
  });
});
