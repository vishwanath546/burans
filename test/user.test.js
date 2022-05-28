const request = require("supertest");
const app = require("../index");

describe("GET /user", function () {
  it("responds with json", async function () {
    var data = await request(app).get("/client/getCategory");
    expect(data.status).toEqual(200);
  });
});

describe("GET /user", function () {
  it("responds with json", async function () {
    var data = await request(app)
      .post("/client/getSubCategoryProduct")
      .send({ page: "1" });
    expect(data.status).toEqual(200);
  });
});
