import { base } from "viem/chains";
import { createPublicClient, http } from "viem";

const client = createPublicClient({
  chain: base,
  transport: http(
    process.env.RPC_URL ||
    process.env.NEXT_PUBLIC_RPC_URL ||
    "https://mainnet.base.org"
  ),
});

const ORIGIN = "0x45737f6950f5c9e9475e9e045c7a89b565fa3648";
const DUELS = "0xDFAC0671843E7294330C6859701729Cad3AdBdC7";

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// 100 tokens (18 decimals)
const MIN_REQUIRED = BigInt("100000000000000000000");

export async function checkEligibility(address: `0x${string}`) {
  const [originBalance, dualBalance] = await Promise.all([
    client.readContract({
      address: ORIGIN,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address],
    }),
    client.readContract({
      address: DUELS,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address],
    }),
  ]);

  return (
    (originBalance as bigint) >= MIN_REQUIRED ||
    (dualBalance as bigint) >= MIN_REQUIRED
  );
}