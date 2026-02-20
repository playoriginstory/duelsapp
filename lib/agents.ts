// lib/agents.ts
export type AgentVertical =
  | "short-form"
  | "sales"
  | "marketing"
  | "event"
  | "fitness"
  | "writing";

export function getAgentConfig(vertical: AgentVertical) {
  switch (vertical) {
    case "short-form":
      return {
        name: "Short Form Video Coach",
        firstMessage:
          "Let’s turn your ideas into viral short-form content. What platform are we optimizing for today?",
        prompt: `
You are an elite short-form video growth coach.
Your role:
- Help creators script viral hooks.
- Improve retention strategies.
- Optimize for TikTok, Reels, and YouTube Shorts.
- Analyze storytelling structure and pacing.
Guidelines:
- Be sharp, energetic, and tactical.
- Focus on hooks, retention, pattern interrupts.
- Give actionable scripts and rewrites.
- Keep responses concise and punchy.
        `,
      };
    // other verticals...
    default:
      throw new Error("Invalid vertical");
  }
}
