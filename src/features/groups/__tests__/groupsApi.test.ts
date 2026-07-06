import { client } from "../../../shared/api/client";
import {
  createGroup,
  deleteGroup,
  getGroup,
  getGroupBalances,
  getGroupSettlements,
  getGroups,
  recordGroupSettlement,
  updateGroup,
  acceptGroupInvitation,
} from "../api/groupsApi";

jest.mock("../../../shared/api/client", () => ({
  client: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockPost = jest.mocked(client.post);
const mockGet = jest.mocked(client.get);
const mockPatch = jest.mocked(client.patch);
const mockDelete = jest.mocked(client.delete);

// Matches real backend DTO (CreateGroupResponseDto)
const validGroupResponse = {
  id: "g1",
  name: "Viaje a Mendoza",
  type: "trip",
  currency: "ARS",
  members: [{ id: "m1", displayName: "Vos", isCurrentUser: true }],
  membersCount: 1,
  expensesCount: 0,
  totalAmount: 0,
  currentUserBalance: 0,
};

describe("groupsApi.createGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("posts to /groups with the correct body", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        data: {
          id: "server-id-1",
          name: "Viaje a Mendoza",
          type: "trip",
          currency: "ARS",
        },
      },
    });

    await createGroup({
      name: "Viaje a Mendoza",
      type: "trip",
      currency: "ARS",
      members: [{ displayName: "friend", email: "friend@example.com" }],
    });

    expect(mockPost).toHaveBeenCalledWith("/groups", {
      name: "Viaje a Mendoza",
      type: "trip",
      currency: "ARS",
      members: [{ displayName: "friend", email: "friend@example.com" }],
    });
  });

  it("returns the response data from the server", async () => {
    const serverResponse = {
      id: "server-id-1",
      name: "Viaje a Mendoza",
      type: "trip",
      currency: "ARS",
      members: [],
    };
    mockPost.mockResolvedValueOnce({ data: { data: serverResponse } });

    const result = await createGroup({
      name: "Viaje a Mendoza",
      type: "trip",
      currency: "ARS",
      members: [],
    });
    expect(result).toEqual(serverResponse);
  });

  it("maps FOOD category to other type", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        data: {
          id: "server-id-2",
          name: "Cenas del mes",
          type: "other",
          currency: "ARS",
        },
      },
    });

    await createGroup({
      name: "Cenas del mes",
      type: "other",
      currency: "ARS",
      members: [],
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/groups",
      expect.objectContaining({ type: "other" }),
    );
  });

  it("propagates errors from the HTTP client", async () => {
    mockPost.mockRejectedValueOnce(new Error("Network error"));

    await expect(
      createGroup({ name: "Test", type: "trip", currency: "ARS", members: [] }),
    ).rejects.toThrow("Network error");
  });
});

describe("groupsApi.getGroups", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls GET /groups", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [] } });

    await getGroups();

    expect(mockGet).toHaveBeenCalledWith("/groups");
  });

  it("returns the response data envelope", async () => {
    const groups = [
      {
        id: "g1",
        name: "Test",
        description: null,
        currency: "ARS",
        createdAt: "2026-06-26T00:00:00.000Z",
        updatedAt: "2026-06-26T00:00:00.000Z",
        currentUserBalance: -12500,
      },
    ];
    mockGet.mockResolvedValueOnce({ data: { data: groups } });

    const result = await getGroups();

    expect(result).toEqual({ data: groups });
    expect(result.data[0]?.currentUserBalance).toBe(-12500);
  });

  it("propagates errors from the HTTP client", async () => {
    mockGet.mockRejectedValueOnce(new Error("Unauthorized"));

    await expect(getGroups()).rejects.toThrow("Unauthorized");
  });
});

describe("groupsApi.acceptGroupInvitation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("posts the invitation token to the accept endpoint and expects no response body", async () => {
    mockPost.mockResolvedValueOnce({ status: 204 });

    await acceptGroupInvitation("invite-token");

    expect(mockPost).toHaveBeenCalledWith("/groups/invitations/accept", { token: "invite-token" });
  });
});

describe("groupsApi.getGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls GET /groups/:id and returns parsed data", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: validGroupResponse } });

    const result = await getGroup("g1");

    expect(mockGet).toHaveBeenCalledWith("/groups/g1");
    expect(result).toEqual(validGroupResponse);
  });

  it("throws when the response is missing id", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { name: "No ID group" } } });

    await expect(getGroup("g1")).rejects.toThrow(
      "API response does not match contract",
    );
  });

  it("propagates HTTP errors", async () => {
    mockGet.mockRejectedValueOnce(new Error("Not found"));

    await expect(getGroup("g1")).rejects.toThrow("Not found");
  });
});

describe("groupsApi.updateGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls PATCH /groups/:id with the payload and returns parsed data", async () => {
    const payload = { name: "Viaje a Bariloche" };
    mockPatch.mockResolvedValueOnce({
      data: { data: { ...validGroupResponse, name: "Viaje a Bariloche" } },
    });

    const result = await updateGroup("g1", payload);

    expect(mockPatch).toHaveBeenCalledWith("/groups/g1", payload);
    expect(result.name).toBe("Viaje a Bariloche");
  });

  it("throws when the response does not match the contract", async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: { name: "Invalid" } } });

    await expect(updateGroup("g1", { name: "Invalid" })).rejects.toThrow(
      "API response does not match contract",
    );
  });
});

describe("groupsApi.deleteGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls DELETE /groups/:id and returns parsed data", async () => {
    mockDelete.mockResolvedValueOnce({
      data: {
        data: { ...validGroupResponse, archivedAt: "2024-05-20T00:00:00.000Z" },
      },
    });

    const result = await deleteGroup("g1");

    expect(mockDelete).toHaveBeenCalledWith("/groups/g1");
    expect(result.archivedAt).toBe("2024-05-20T00:00:00.000Z");
  });

  it("throws when the response is missing id", async () => {
    mockDelete.mockResolvedValueOnce({ data: { data: { name: "No ID" } } });

    await expect(deleteGroup("g1")).rejects.toThrow(
      "API response does not match contract",
    );
  });
});

describe("groupsApi.getGroupBalances", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls GET /groups/:id/balances and returns parsed data", async () => {
    // Real backend shape: { memberId, displayName, balance, currency }
    const data = {
      balances: [
        { memberId: "m1", displayName: "Vos", balance: 0, currency: "ARS" },
      ],
    };
    mockGet.mockResolvedValueOnce({ data: { data } });

    const result = await getGroupBalances("g1");

    expect(mockGet).toHaveBeenCalledWith("/groups/g1/balances");
    expect(result).toEqual(data);
  });

  it("throws when the response does not match the contract", async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: { balances: [{ id: "m1" }] } },
    });

    await expect(getGroupBalances("g1")).rejects.toThrow(
      "API response does not match contract",
    );
  });
});

describe("groupsApi.getGroupSettlements", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls GET /groups/:id/settlements and returns parsed data", async () => {
    // Real backend shape: { fromMemberId, fromMemberName, toMemberId, toMemberName, amount, currency }
    const data = {
      settlements: [
        {
          fromMemberId: "m1",
          fromMemberName: "Vos",
          toMemberId: "m2",
          toMemberName: "Ana",
          amount: 30,
          currency: "ARS",
        },
      ],
    };
    mockGet.mockResolvedValueOnce({ data: { data } });

    const result = await getGroupSettlements("g1");

    expect(mockGet).toHaveBeenCalledWith("/groups/g1/settlements");
    expect(result).toEqual(data);
  });

  it("throws when the response does not match the contract", async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: { settlements: [{ id: "s1" }] } },
    });

    await expect(getGroupSettlements("g1")).rejects.toThrow(
      "API response does not match contract",
    );
  });
});

describe("groupsApi.recordGroupSettlement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls POST /groups/:id/settlements and returns parsed data", async () => {
    const input = {
      fromMemberId: "m1",
      toMemberId: "m2",
      amount: 30,
      currency: "ARS",
      paidAt: "2026-06-26T12:00:00.000Z",
    };
    const data = {
      payment: {
        id: "s1",
        groupId: "g1",
        fromMember: { id: "m1", displayName: "Vos" },
        toMember: { id: "m2", displayName: "Ana" },
        amount: 30,
        currency: "ARS",
        paidAt: "2026-06-26T12:00:00.000Z",
        notes: null,
        createdAt: "2026-06-26T12:00:00.000Z",
      },
      balances: [
        { memberId: "m1", displayName: "Vos", balance: 0, currency: "ARS" },
      ],
    };
    mockPost.mockResolvedValueOnce({ data: { data } });

    const result = await recordGroupSettlement("g1", input);

    expect(mockPost).toHaveBeenCalledWith("/groups/g1/settlements", input);
    expect(result).toEqual(data);
  });

  it("throws when the response does not match the contract", async () => {
    mockPost.mockResolvedValueOnce({
      data: { data: { payment: { id: "s1" } } },
    });

    await expect(
      recordGroupSettlement("g1", {
        fromMemberId: "m1",
        toMemberId: "m2",
        amount: 30,
        currency: "ARS",
        paidAt: "2026-06-26T12:00:00.000Z",
      }),
    ).rejects.toThrow("API response does not match contract");
  });
});
