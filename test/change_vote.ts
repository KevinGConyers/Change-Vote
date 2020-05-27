import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity";
import { assert } from "chai";
import { isMainThread } from "worker_threads";
import { exec } from "child_process";

describe("change-vote test suite", () => 
{
  let voteClient: Client;
  let provider: Provider;

  const getByteBuffer = async (instring: string) => {
    let byteBuffer = Buffer.from(instring, 'utf-8');
    return byteBuffer;
  };

  before(async () => {
    provider = await ProviderRegistry.createProvider();
    voteClient = new Client("ST31RC8QB0S4YNQRK39VE4PKBT6W756QB5W68JGH8.change_vote", "change_vote", provider);
  });
  it("Should have a valid syntax", async () => {
    await voteClient.checkContract();
  });

  describe("Deploying an instance of the contract", () => 
  {
    before(async () => 
    {
      await voteClient.deployContract();
    });

    const getChangeValue = async () => 
    {
      const query = voteClient.createQuery(
        {
        method: { name: "GetChangeValue", args: [] }
        });
      const receipt = await voteClient.submitQuery(query);
      const result = Result.unwrapString(receipt);
      return result;
    }

    const getOriginalValue = async () => 
    {
      const query = voteClient.createQuery(
        {
        method: { name: "GetOriginalValue", args: [] }
        });
      const receipt = await voteClient.submitQuery(query);
      const result = Result.unwrapString(receipt);
      return result;
    }

    const getVotes = async () => 
    {
      const query = voteClient.createQuery(
        {
        method: { name: "GetVotes", args: [] }
        });
      const receipt = await voteClient.submitQuery(query);
      const result = Result.unwrapInt(receipt);
      return result;
    }

    const getRemainingVotes = async () => 
    {
      const query = voteClient.createQuery(
        {
        method: { name: "GetRemainingVotes", args: [] }
        });
      const receipt = await voteClient.submitQuery(query);
      const result = Result.unwrapInt(receipt);
      return result;
    }

    const getVoteStatus = async () => 
    {
      const query = voteClient.createQuery(
        {
        method: { name: "GetVoteStatus", args: [] }
        });
      const receipt = await voteClient.submitQuery(query);
      const result = Result.unwrap(receipt);
      return result;
    }

    const resolveVote = async() => {
      const query = voteClient.createQuery(
        {
        method: { name: "ResolveVoting", args: [] }
        });
      const receipt = await voteClient.submitQuery(query);
      const result = Result.unwrap(receipt);
      return result;
    }

    const execMethod = async (method: string, in_arguments: string[]) => 
    {
      const tx = voteClient.createTransaction(
      {
        method: 
        {
          name: method,
          args: in_arguments,
        }
      });
      await tx.sign("ST31RC8QB0S4YNQRK39VE4PKBT6W756QB5W68JGH8");
      const receipt = await voteClient.submitTransaction(tx);
      return receipt;
    }

    //Change Value Tests
    it("Should return change value", async () => {
      const answer = await getChangeValue();
      assert.equal(answer, "test change")
    });

    it("Should take a change value and return the updated value", async () => 
    {
      const in_string = "changestring";
      const query = voteClient.createQuery({ method: { name: "SetChangeValue", args: [`\"${in_string}\"`] } });
      const receipt = await voteClient.submitQuery(query);
      const result = Result.unwrapString(receipt);
      assert.equal(result, in_string);
    });

    it("Should update the change value", async () => 
    {
      const in_string = "newchangestring";
      await execMethod("SetChangeValue", [`\"${in_string}\"`]);
      const result = await getChangeValue();
      assert.equal(result, in_string);
    });

    //Original Value Tests
    it("Should return original value", async () => 
    {
      const answer = await getOriginalValue();
      assert.equal(answer, "test original")
    });

    it("Should take in an original value and return the updated value", async () => {
      const in_string = "original string";
      const query = voteClient.createQuery({ method: { name: "SetOriginalValue", args: [`\"${in_string}\"`] } });
      const receipt = await voteClient.submitQuery(query);
      const result = Result.unwrapString(receipt);
      assert.equal(result, in_string);
    });

    it("should update the original value", async () => {
      const in_string = "neworiginalstring";
      await execMethod("SetOriginalValue", [`\"${in_string}\"`]);
      const result = await getOriginalValue();
      assert.equal(result, in_string);
    });

    //Voting tests
    it("Should start votes at zero", async () => {
      const result = await getVotes();
      assert.equal(result, 0);
    });

    it("Should start with voting off", async() => {
      const result = await getVoteStatus();
      assert.equal(result, "(ok false)");
    });

    it("Should start remaining votes at 3", async() => {
        const result = await getRemainingVotes();
        assert.equal(result, 3);
    });

    it("Should NOT allow voting when voting is closed", async() => {
      await execMethod("VoteToApprove", []);
      const voteresult = await getVotes();
      assert.equal(voteresult, 0);
      const remresult = await getRemainingVotes();
      assert.equal(remresult, 3);
    });

    it("Should allow voting when enabled", async() => {
      await execMethod("AllowVoting", []);
      await execMethod("VoteToApprove", []);
      const voteresult = await getVotes();
      const remresult = await getRemainingVotes();
      assert.equal(voteresult, 1);
      assert.equal(remresult, 2);
    });

    it("Should disable voting", async() => {
      await execMethod("DisallowVoting", []);
      await execMethod("VoteToApprove", []);
      const voteresult = await getVotes();
      const remresult = await getRemainingVotes();
      assert.equal(voteresult, 1);
      assert.equal(remresult, 2);
    });

    it("Should return false when votes are less the needed votes", async() => {
      const voteresult = await resolveVote();
      assert.equal(voteresult, "(ok false)");
    });

    it("Should return true when votes are equal to the needed votes", async() => {
      await execMethod("AllowVoting", []);
      await execMethod("VoteToApprove", []);
      await execMethod("VoteToApprove", []);
      const voteresult = await resolveVote();
      assert.equal(voteresult, "(ok true)");
    });

    it("Should return true when votes are greater than the needed votes", async() => {
      await execMethod("VoteToApprove", []);
      const voteresult = await resolveVote();
      assert.equal(voteresult, "(ok true)");
    });

    it("Should reset the vote", async() => {
      const in_change = "New Test Change";
      const in_orig = "New Test Original";
      await execMethod("InitializeNewVote", [`\"${in_change}\"`, `\"${in_orig}\"`] );
      const change = await getChangeValue();
      const orig = await getOriginalValue();
      const votes = await getVotes();
      const rem = await getRemainingVotes();
      assert.equal(change, in_change);
      assert.equal(orig, in_orig);
      assert.equal(votes, 0);
      assert.equal(rem, 3);
    });

  after(async () => {
    await provider.close();
  });
});
});