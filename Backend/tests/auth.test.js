jest.mock("../utils/lighthouse", () => {
  return jest.fn(async () => ({
    performance: 80,
    accessibility: 80,
    bestPractices: 80,
    seo: 80
  }));
});

jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

const request = require("supertest");
const app = require("../server");

const User = require("../models/User");

describe("Authentication API", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });


  test("Signup should reject missing fields", async () => {

    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "test@example.com"
      });

    expect(response.status).toBe(400);
  });


  test("Login should return 404 when user does not exist", async () => {

    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrong@example.com",
        password: "wrongpassword"
      });

    expect(response.status).toBe(404);

    expect(response.body.message).toBe("User not found");
  });

});