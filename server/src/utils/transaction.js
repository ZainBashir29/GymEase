import mongoose from "mongoose";

/**
 * Runs `fn(session)` inside a MongoDB transaction with automatic retry on
 * transient transaction errors, and guarantees `session.endSession()` runs.
 */
export const runInTransaction = async (fn) => {
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

export default runInTransaction;
