import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity";
import { assert } from "chai";

describe("change-vote test suite", () => 
{
  let counterClient: Client;
  let provider: Provider;
  before(async () => {
    provider = await ProviderRegistry.createProvider();
    counterClient = new Client("19uKvdWgJuYeeDqMx7QW8iihPChMqt8nN5.change_vote", "change_vote", provider);
  });
  it("should have a valid syntax", async () => {
    await counterClient.checkContract();
  });
});