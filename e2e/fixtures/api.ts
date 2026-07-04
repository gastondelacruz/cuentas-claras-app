import { Page, Route } from '@playwright/test';

const now = '2026-07-03T12:00:00.000Z';

type Group = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  currency: string;
  members: Array<{
    id: string;
    displayName: string;
    email: string;
    isCurrentUser?: boolean;
    removedAt?: string | null;
  }>;
  membersCount: number;
  expensesCount: number;
  totalAmount: number;
  currentUserBalance: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};

type GroupExpense = {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  currency: string;
  paidBy: { id: string; displayName: string };
  participantsCount: number;
  splitType: string;
  category: string;
  notes: string | null;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = LoginRequest & {
  name: string;
};

type LogoutRequest = {
  refreshToken: string;
};

type CreateGroupRequest = {
  name: string;
  type: string;
  currency: string;
  members?: Array<{ displayName: string; email: string }>;
};

type CreateGroupExpenseRequest = {
  title: string;
  amount: number;
  currency: string;
  paidByMemberId: string;
  participantMemberIds: string[];
  splitType: 'equal';
  category?: string | null;
  notes?: string | null;
  expenseDate: string;
};

type PersonalTransaction = {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  currency: string;
  category: string;
  accountId: string;
  accountName: string;
  occurredAt: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

type CreatePersonalTransactionRequest = {
  type: 'expense' | 'income';
  amount: number;
  currency: string;
  category: string;
  accountId?: string;
  occurredAt: string;
  note?: string;
};

const currentUser = {
  id: 'user-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
};

const defaultGroup: Group = {
  id: 'group-1',
  name: 'Viaje a Bariloche',
  description: 'Shared travel expenses',
  type: 'trip',
  currency: 'ARS',
  members: [
    { id: 'member-1', displayName: 'Ada Lovelace', email: currentUser.email, isCurrentUser: true },
    { id: 'member-2', displayName: 'Grace Hopper', email: 'grace@example.com' },
  ],
  membersCount: 2,
  expensesCount: 1,
  totalAmount: 12500,
  currentUserBalance: 6250,
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
};

const defaultExpense: GroupExpense = {
  id: 'expense-1',
  groupId: defaultGroup.id,
  title: 'Cena compartida',
  amount: 12500,
  currency: 'ARS',
  paidBy: { id: 'member-1', displayName: 'Ada Lovelace' },
  participantsCount: 2,
  splitType: 'equal',
  category: 'FOOD',
  notes: null,
  expenseDate: now,
  createdAt: now,
  updatedAt: now,
};

const defaultTransaction: PersonalTransaction = {
  id: 'personal-1',
  type: 'expense',
  amount: 4200,
  currency: 'ARS',
  category: 'Comida',
  accountId: 'account-ars',
  accountName: 'Pesos',
  occurredAt: now,
  note: 'Almuerzo',
  createdAt: now,
  updatedAt: now,
};

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': 'authorization,content-type',
  };
}

async function fulfillJson(route: Route, status: number, body?: unknown) {
  await route.fulfill({
    status,
    headers: corsHeaders(),
    contentType: 'application/json',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function getRequestBody<T>(route: Route): T {
  const data = route.request().postData();
  return data ? JSON.parse(data) as T : {} as T;
}

function assertRequiredString(body: Record<string, unknown>, field: string) {
  if (typeof body[field] !== 'string' || body[field].length === 0) {
    throw new Error(`Request body is missing required string field: ${field}`);
  }
}

function assertRequiredNumber(body: Record<string, unknown>, field: string) {
  if (typeof body[field] !== 'number' || !Number.isFinite(body[field])) {
    throw new Error(`Request body is missing required number field: ${field}`);
  }
}

function assertRequiredStringArray(body: Record<string, unknown>, field: string) {
  if (!Array.isArray(body[field]) || !(body[field] as unknown[]).every((item) => typeof item === 'string')) {
    throw new Error(`Request body is missing required string array field: ${field}`);
  }
}

function assertLoginRequest(body: LoginRequest) {
  const record = body as Record<string, unknown>;
  assertRequiredString(record, 'email');
  assertRequiredString(record, 'password');
}

function assertRegisterRequest(body: RegisterRequest) {
  const record = body as Record<string, unknown>;
  assertRequiredString(record, 'name');
  assertRequiredString(record, 'email');
  assertRequiredString(record, 'password');
}

function assertLogoutRequest(body: LogoutRequest) {
  const record = body as Record<string, unknown>;
  assertRequiredString(record, 'refreshToken');
}

function assertCreateGroupRequest(body: CreateGroupRequest) {
  const record = body as Record<string, unknown>;
  assertRequiredString(record, 'name');
  assertRequiredString(record, 'type');
  assertRequiredString(record, 'currency');
}

function assertCreateGroupExpenseRequest(body: CreateGroupExpenseRequest) {
  const record = body as Record<string, unknown>;
  assertRequiredString(record, 'title');
  assertRequiredNumber(record, 'amount');
  assertRequiredString(record, 'currency');
  assertRequiredString(record, 'paidByMemberId');
  assertRequiredStringArray(record, 'participantMemberIds');
  assertRequiredString(record, 'splitType');
  assertRequiredString(record, 'expenseDate');
}

function assertCreatePersonalTransactionRequest(body: CreatePersonalTransactionRequest) {
  const record = body as Record<string, unknown>;
  assertRequiredString(record, 'type');
  assertRequiredNumber(record, 'amount');
  assertRequiredString(record, 'currency');
  assertRequiredString(record, 'category');
  assertRequiredString(record, 'occurredAt');
}

export async function installApiMocks(page: Page) {
  const groups = new Map<string, Group>([[defaultGroup.id, { ...defaultGroup }]]);
  const groupExpenses = new Map<string, GroupExpense[]>([[defaultGroup.id, [{ ...defaultExpense }]]]);
  const personalTransactions: PersonalTransaction[] = [{ ...defaultTransaction }];

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api/v1', '');
    const method = request.method();

    if (method === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders() });
      return;
    }

    if (method === 'POST' && path === '/auth/login') {
      const body = getRequestBody<LoginRequest>(route);
      assertLoginRequest(body);
      await fulfillJson(route, 200, {
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: currentUser,
        },
      });
      return;
    }

    if (method === 'POST' && path === '/auth/register') {
      const body = getRequestBody<RegisterRequest>(route);
      assertRegisterRequest(body);
      await fulfillJson(route, 201, {
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: {
            id: 'user-2',
            name: body.name,
            email: body.email,
          },
        },
      });
      return;
    }

    if (method === 'POST' && path === '/auth/logout') {
      const body = getRequestBody<LogoutRequest>(route);
      assertLogoutRequest(body);
      await route.fulfill({ status: 204, headers: corsHeaders() });
      return;
    }

    if (method === 'GET' && path === '/me/summary') {
      await fulfillJson(route, 200, {
        data: {
          totalGroups: groups.size,
          totalExpenses: [...groupExpenses.values()].reduce((total, expenses) => total + expenses.length, 0),
          totalsByCurrency: [{ currency: 'ARS', totalPaid: 16700, totalOwed: 10450, totalToReceive: 6250 }],
          activeSince: now,
        },
      });
      return;
    }

    if (method === 'GET' && path === '/groups') {
      await fulfillJson(route, 200, { data: [...groups.values()] });
      return;
    }

    if (method === 'POST' && path === '/groups') {
      const body = getRequestBody<CreateGroupRequest>(route);
      assertCreateGroupRequest(body);
      const id = `group-${groups.size + 1}`;
      const members = [
        { id: 'member-1', displayName: currentUser.name, email: currentUser.email, isCurrentUser: true },
        ...(body.members ?? []).map((member, index) => ({
          id: `member-${index + 2}`,
          displayName: member.displayName,
          email: member.email,
        })),
      ];
      const group: Group = {
        id,
        name: body.name,
        description: null,
        type: body.type,
        currency: body.currency,
        members,
        membersCount: members.length,
        expensesCount: 0,
        totalAmount: 0,
        currentUserBalance: 0,
        createdAt: now,
        updatedAt: now,
        archivedAt: null,
      };
      groups.set(id, group);
      groupExpenses.set(id, []);
      await fulfillJson(route, 201, { data: group });
      return;
    }

    const groupExpenseMatch = path.match(/^\/groups\/([^/]+)\/expenses$/);
    if (groupExpenseMatch && method === 'GET') {
      await fulfillJson(route, 200, { data: { expenses: groupExpenses.get(groupExpenseMatch[1]) ?? [], nextCursor: null } });
      return;
    }

    if (groupExpenseMatch && method === 'POST') {
      const groupId = groupExpenseMatch[1];
      const group = groups.get(groupId);
      const body = getRequestBody<CreateGroupExpenseRequest>(route);
      assertCreateGroupExpenseRequest(body);
      const expense: GroupExpense = {
        id: `expense-${(groupExpenses.get(groupId)?.length ?? 0) + 1}`,
        groupId,
        title: body.title,
        amount: body.amount,
        currency: body.currency,
        paidBy: { id: body.paidByMemberId, displayName: currentUser.name },
        participantsCount: body.participantMemberIds.length,
        splitType: body.splitType,
        category: body.category ?? 'OTHER',
        notes: body.notes ?? null,
        expenseDate: body.expenseDate,
        createdAt: now,
        updatedAt: now,
      };
      const expenses = groupExpenses.get(groupId) ?? [];
      expenses.unshift(expense);
      groupExpenses.set(groupId, expenses);
      if (group) {
        group.expensesCount = expenses.length;
        group.totalAmount += expense.amount;
        group.currentUserBalance += expense.amount / 2;
      }
      await fulfillJson(route, 201, { data: { ...expense, participants: [] } });
      return;
    }

    const groupMatch = path.match(/^\/groups\/([^/]+)$/);
    if (groupMatch && method === 'GET') {
      const group = groups.get(groupMatch[1]);
      await fulfillJson(route, group ? 200 : 404, group ? { data: group } : { message: 'Not found' });
      return;
    }

    const balancesMatch = path.match(/^\/groups\/([^/]+)\/balances$/);
    if (balancesMatch && method === 'GET') {
      const group = groups.get(balancesMatch[1]);
      await fulfillJson(route, 200, {
        data: {
          balances: (group?.members ?? []).map((member, index) => ({
            memberId: member.id,
            displayName: member.displayName,
            balance: index === 0 ? group?.currentUserBalance ?? 0 : -(group?.currentUserBalance ?? 0),
            currency: group?.currency ?? 'ARS',
            isCurrentUser: member.isCurrentUser,
          })),
        },
      });
      return;
    }

    if (method === 'GET' && path === '/me/personal-transactions') {
      const type = url.searchParams.get('type');
      const transactions = personalTransactions.filter((transaction) => !type || transaction.type === type);
      await fulfillJson(route, 200, {
        data: {
          transactions,
          nextCursor: null,
          total: transactions.length,
          incomeTotal: transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0),
          expenseTotal: transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0),
          currency: 'ARS',
        },
      });
      return;
    }

    if (method === 'GET' && path === '/me/personal-transactions/summary') {
      const type = url.searchParams.get('type') as 'expense' | 'income' | null;
      const transactions = personalTransactions.filter((transaction) => !type || transaction.type === type);
      const total = transactions.reduce((sum, item) => sum + item.amount, 0);
      await fulfillJson(route, 200, {
        data: {
          total,
          currency: 'ARS',
          incomeTotal: transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0),
          expenseTotal: transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0),
          breakdown: transactions.map((item) => ({ category: item.category, type: item.type, amount: item.amount, percentage: total ? 100 : 0 })),
        },
      });
      return;
    }

    if (method === 'POST' && path === '/me/personal-transactions') {
      const body = getRequestBody<CreatePersonalTransactionRequest>(route);
      assertCreatePersonalTransactionRequest(body);
      const transaction: PersonalTransaction = {
        id: `personal-${personalTransactions.length + 1}`,
        type: body.type,
        amount: body.amount,
        currency: body.currency,
        category: body.category,
        accountId: body.accountId ?? 'account-ars',
        accountName: 'Pesos',
        occurredAt: body.occurredAt,
        note: body.note ?? null,
        createdAt: now,
        updatedAt: now,
      };
      personalTransactions.unshift(transaction);
      await fulfillJson(route, 201, { data: transaction });
      return;
    }

    await fulfillJson(route, 404, { message: `Unhandled ${method} ${path}` });
  });
}

export async function login(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('juan@ejemplo.com').first().fill(currentUser.email);
  await page.getByPlaceholder('••••••••').first().fill('supersecret');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.getByText('Viaje a Bariloche').waitFor();
}

export async function register(page: Page) {
  await page.goto('/');
  await page.getByText('Registrarse').first().click();
  await page.getByPlaceholder('Juan García').fill('Grace Hopper');
  await page.getByPlaceholder('juan@ejemplo.com').fill('grace@example.com');
  await page.getByPlaceholder('••••••••').fill('supersecret');
  await page.getByRole('button', { name: 'Registrarse' }).click();
  await page.getByText('Viaje a Bariloche').waitFor();
}
