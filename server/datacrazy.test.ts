import { describe, expect, it } from "vitest";
import axios from "axios";

describe("Datacrazy API Token", () => {
  it("should validate token by fetching attendants", async () => {
    const token = process.env.DATACRAZY_API_TOKEN;
    expect(token).toBeDefined();
    expect(token?.startsWith("dc_")).toBe(true);

    const response = await axios.get(
      "https://api.g1.datacrazy.io/api/v1/attendants/crm",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("data");
    expect(Array.isArray(response.data.data)).toBe(true);
    expect(response.data.data.length).toBeGreaterThan(0);
  });
});
