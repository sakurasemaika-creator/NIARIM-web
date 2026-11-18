import { DurableObject } from "cloudflare:workers";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const DAILY_LIMIT = 20;

/** One object per client IP. Reservations contain timestamps only. */
export class ContactRateLimiter extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS submissions (sent_at INTEGER PRIMARY KEY)",
    );
  }

  isLimited() {
    return this.#limitedAt(Date.now());
  }

  #limitedAt(now) {
    const { count, latest } = this.sql
      .exec(
        "SELECT COUNT(*) AS count, MAX(sent_at) AS latest FROM submissions WHERE sent_at > ?",
        now - DAY,
      )
      .one();
    return count >= DAILY_LIMIT || (latest !== null && now - latest < MINUTE);
  }

  async reserve() {
    const now = Date.now();
    const allowed = this.ctx.storage.transactionSync(() => {
      this.#prune(now);
      if (this.#limitedAt(now)) return false;
      this.sql.exec("INSERT INTO submissions (sent_at) VALUES (?)", now);
      return true;
    });
    if (allowed) await this.ctx.storage.setAlarm(now + DAY);
    return allowed;
  }

  #prune(now) {
    this.sql.exec("DELETE FROM submissions WHERE sent_at <= ?", now - DAY);
  }

  async alarm() {
    const now = Date.now();
    this.#prune(now);
    const { latest } = this.sql
      .exec("SELECT MAX(sent_at) AS latest FROM submissions")
      .one();
    if (latest !== null) await this.ctx.storage.setAlarm(latest + DAY);
  }
}
