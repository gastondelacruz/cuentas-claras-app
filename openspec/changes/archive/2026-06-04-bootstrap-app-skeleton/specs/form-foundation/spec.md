# form-foundation Specification

## Purpose

Defines the reusable form pattern: `react-hook-form` + `zod` schema validation wired through `zodResolver`, a shared `Input` primitive that accepts and displays validation errors, and a `Controller`-based registration pattern. No real form submissions or API calls at bootstrap — only the wiring and contracts are established.

---

## Requirements

### Requirement: Zod Schema as Form Contract

Every feature form MUST define its validation contract as a Zod schema. The schema MUST be the single source of truth for field types and validation rules; the inferred TypeScript type MUST be used as the `useForm` generic.

#### Scenario: Zod schema infers correct TypeScript type

- GIVEN a Zod schema `z.object({ email: z.string().email(), password: z.string().min(8) })`
- WHEN the inferred type is used as `useForm<LoginFormValues>()`
- THEN TypeScript accepts valid fields and rejects unknown properties at compile time

#### Scenario: Schema rejects invalid email at runtime

- GIVEN the `loginSchema` is parsed with `{ email: 'not-an-email', password: '12345678' }`
- WHEN `schema.safeParse(data)` is called
- THEN `success === false`
- AND `error.issues` contains an issue with path `['email']`

---

### Requirement: zodResolver Wiring

`useForm` MUST be initialized with `resolver: zodResolver(schema)`. Validation MUST run on field blur by default (`mode: 'onBlur'`).

#### Scenario: Invalid input triggers field error on blur

- GIVEN a form component uses `zodResolver` with a schema requiring `email` to be a valid email
- WHEN the user blurs the email field with value `'bad'`
- THEN `formState.errors.email` is defined
- AND `errors.email.message` is a non-empty string

#### Scenario: Valid input clears the field error

- GIVEN the email field has an error from a previous invalid entry
- WHEN the user types `'user@example.com'` and blurs
- THEN `formState.errors.email` is `undefined`

---

### Requirement: Shared Input Primitive

`src/shared/ui/Input.tsx` MUST accept props: `value`, `onChangeText`, `onBlur`, `placeholder`, `errorMessage?: string`, and `testID`. When `errorMessage` is provided and non-empty, the component MUST render it below the input field.

#### Scenario: Input renders error message when provided

- GIVEN `<Input errorMessage="Required" testID="email-input" />`
- WHEN the component renders
- THEN a `Text` element with content `"Required"` is present in the tree

#### Scenario: Input renders without error message when prop is absent

- GIVEN `<Input testID="email-input" />` with no `errorMessage`
- WHEN the component renders
- THEN no error `Text` element is present below the input

#### Scenario: Input forwards value and change handler

- GIVEN `<Input value="hello" onChangeText={handler} />`
- WHEN the user types a character
- THEN `onChangeText` is called with the new string value

---

### Requirement: Controller + Input Registration Pattern

Feature forms MUST register fields using `react-hook-form`'s `Controller` component wrapping the shared `Input` primitive. The form MUST pass `field.value`, `field.onChange`, `field.onBlur`, and `fieldState.error?.message` to the `Input`.

#### Scenario: Controlled field value updates form state

- GIVEN a form with a `Controller` wrapping `Input` for the `email` field
- WHEN `fireEvent.changeText` updates the input to `'a@b.com'`
- THEN `getValues('email')` returns `'a@b.com'`

#### Scenario: Controller passes error message to Input

- GIVEN the form has a validation error on `email`
- WHEN the `Controller` render function runs
- THEN the `Input` receives `errorMessage` matching `formState.errors.email.message`

---

### Requirement: Reusable Validation Pattern Documentation

`src/shared/ui/README.md` (or equivalent inline JSDoc) MUST document the standard Controller + Input + zodResolver pattern with a minimal code example so future developers can follow it without consulting these specs.

#### Scenario: Pattern example compiles without errors

- GIVEN the documented code example is copied verbatim into a test file
- WHEN TypeScript compiles it
- THEN zero type errors are reported
