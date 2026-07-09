/**
 * Fórmulas centrais dos indicadores. Sempre que um valor financeiro muda,
 * estes cálculos são reaplicados e o resultado persistido + emitido via WebSocket.
 *
 * Parâmetros de entrada: registros, FTD, depósitos, volume, Net P&L, GGR,
 * CPA, RevShare, fixo, outros custos e investimento em tráfego.
 * Indicadores calculados automaticamente: Comissão, Investimento total,
 * Lucro, ROI, CAC, CPA efetivo e Margem sobre GGR.
 */
export interface FinancialInputs {
  registrations: number;
  ftd: number;
  deposits: number;
  volume: number;
  netPl: number;
  ggr: number;
  cpa: number;
  revShare: number;
  fixedCost: number;
  otherCosts: number;
  trafficInvestment: number;
}

export interface FinancialIndicators {
  commission: number;
  investmentTotal: number;
  profit: number;
  roi: number;
  cac: number;
  cpaEffective: number;
  ggrMargin: number;
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

export function computeIndicators(f: FinancialInputs): FinancialIndicators {
  // RevShare incide sobre o GGR quando informado; caso contrário sobre o Net P&L.
  const revShareBase = f.ggr > 0 ? f.ggr : Math.max(f.netPl, 0);
  // Comissão = CPA por FTD + RevShare sobre a base + fixo
  const commission = f.cpa * f.ftd + (f.revShare / 100) * revShareBase + f.fixedCost;
  const investmentTotal = f.trafficInvestment + f.otherCosts + commission;
  // Resultado bruto: GGR quando informado, senão Net P&L
  const grossResult = f.ggr > 0 ? f.ggr : f.netPl;
  // Lucro = resultado bruto - custos totais (tráfego + outros custos + comissão)
  const profit = grossResult - investmentTotal;
  const roi = investmentTotal > 0 ? profit / investmentTotal : 0;
  const cac = f.registrations > 0 ? investmentTotal / f.registrations : 0;
  const cpaEffective = f.ftd > 0 ? investmentTotal / f.ftd : 0;
  // Margem sobre GGR: quanto do GGR sobra como lucro
  const ggrMargin = f.ggr > 0 ? profit / f.ggr : 0;
  return {
    commission: round(commission),
    investmentTotal: round(investmentTotal),
    profit: round(profit),
    roi: round(roi, 4),
    cac: round(cac),
    cpaEffective: round(cpaEffective),
    ggrMargin: round(ggrMargin, 4),
  };
}

export function computeTrafficIndicators(t: {
  investment: number;
  registrations: number;
  ftd: number;
  revenue: number;
}) {
  const cpa = t.ftd > 0 ? t.investment / t.ftd : 0;
  const cac = t.registrations > 0 ? t.investment / t.registrations : 0;
  const profit = t.revenue - t.investment;
  const roi = t.investment > 0 ? profit / t.investment : 0;
  return {
    cpa: round(cpa),
    cac: round(cac),
    profit: round(profit),
    roi: round(roi, 4),
  };
}
