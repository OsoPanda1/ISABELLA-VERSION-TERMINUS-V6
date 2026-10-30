/**
 * Profit Guard — garantiza margen positivo en toda monetización.
 * Ningún precio puede ser inferior al costo + margen mínimo configurado.
 */
export interface ProfitContext {
  readonly cost: number;
  readonly marginBps: number; // basis points, e.g. 2500 = 25%
  readonly demandFactor?: number;
  readonly loadFactor?: number;
  readonly valueFactor?: number;
}

export function minimumProfitablePrice(cost: number, marginBps: number): number {
  if (!Number.isFinite(cost) || cost < 0) throw new RangeError('PROFIT: cost must be >= 0');
  if (!Number.isFinite(marginBps) || marginBps < 0)
    throw new RangeError('PROFIT: marginBps must be >= 0');
  return Math.round(cost * (1 + marginBps / 10_000) * 100) / 100;
}

export function profitablePrice(ctx: ProfitContext): number {
  const min = minimumProfitablePrice(ctx.cost, ctx.marginBps);
  const dynamic =
    ctx.cost * (ctx.demandFactor ?? 1) * (ctx.loadFactor ?? 1) * (ctx.valueFactor ?? 1);
  const candidate = Math.max(min, dynamic);
  // Fail-closed: nunca por debajo del mínimo.
  return Math.max(min, Math.round(candidate * 100) / 100);
}

export class ProfitGuard {
  private revenue = 0;
  private cost = 0;

  record(revenue: number, cost: number): void {
    this.revenue += revenue;
    this.cost += cost;
  }

  snapshot(): { revenue: number; cost: number; profit: number; margin: number } {
    const profit = this.revenue - this.cost;
    const margin = this.revenue > 0 ? profit / this.revenue : 0;
    return { revenue: this.revenue, cost: this.cost, profit, margin };
  }
}

export const profitGuard = new ProfitGuard();
