export const STOCK_ROW = 'stock';
export const EXCHANGE_ROW = 'exchange';
export const TRANSACTION_ROW = 'transaction';

export function mapRecordTypes(row) {
  if (isStockDeal(row)) {
    return [STOCK_ROW, ...row];
  }

  if (isExchangeDeal(row)) {
    return [EXCHANGE_ROW, ...row];
  }

  if (isTransactionDeal(row)) {
    return [TRANSACTION_ROW, ...row];
  }

  return undefined;
}

export function isStockDeal(row) {
  return /\d{2}\.\d{2}\.\d{4}/.test(row[1]) &&
    /\d{2}\.\d{2}\.\d{4}/.test(row[2]) &&
    /\d{2}\.\d{2}\.\d{4}/.test(row[3]) &&
    /\d{2}\:\d{2}\:\d{2}/.test(row[4]) &&
    ['Покупка', 'Продажа'].includes(row[5]);
}

export function isExchangeDeal(row) {
  return /\d{2}\.\d{2}\.\d{4}/.test(row[1]) &&
    /\d{2}\.\d{2}\.\d{4}/.test(row[2]) &&
    /\d{2}\:\d{2}\:\d{2}/.test(row[3]) &&
    ['Покупка', 'Продажа'].includes(row[4]);
}

export function isTransactionDeal(row) {
  return /\d{2}\.\d{2}\.\d{4}/.test(row[1]) &&
    /[A-Z]{3}/.test(row[2]);
}
