// Starter template — handler source for the wasm host (zero-toolchain single file).
// Compiled to dist/handlers.wasm by the host on load; do NOT commit the bundle.
//
// A handler is async (input, ctx): it returns its result value directly (the
// value described by the manifest's outputSchema) or throws to fail. The host
// wraps the return into the { result } / { error } envelope — never write it.
// Every dispatch runs in a fresh instance: nothing in this file survives
// between dispatches. Durable state lives in the graph, through the gateway.
//
// Available: ctx.gateway.*, ctx.log, plain JavaScript, JSON.
// Absent: Node (require, process, fs), npm packages, sockets, filesystem,
// environment variables, any credential or scope key.

export async function ping(input, ctx) {
  return "pong";
}

// A realistic shape — an activity digest over the realm's own event source:
//
// export async function digest(input, ctx) {
//   const limit = Number(input && input.limit) > 0 ? Number(input.limit) : 5;
//   const messages = await ctx.gateway.signals.recent({
//     type: "example.message",
//     hours: 24 * 7,
//     limit: 200,
//   });
//   ctx.log("digest over " + messages.length + " message(s)");
//   return {
//     totalMessages: messages.length,
//     recent: messages.slice(0, limit).map((m) => ({
//       subject: m.subject,
//       at: m.occurredAt,
//     })),
//   };
// }
