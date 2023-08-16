import { EXCHANGE_ROW, TRANSACTION_ROW, STOCK_ROW } from './row-tests.mjs';

const STOCK_DEALS_ISIN_FIELD_NO = 15;
const STOCK_DEALS_EVENT_FIELD_NO = 5;
const STOCK_DEALS_DATE_FIELD_NO = 1;
const STOCK_DEALS_QUANTITY_FIELD_NO = 6;
const STOCK_DEALS_PRICE_FIELD_NO = 7;
const STOCK_DEALS_CURRENCY_FIELD_NO = 8;
const STOCK_DEALS_COMMISSION_1_FIELD_NO = 11;
const STOCK_DEALS_COMMISSION_1_CURRENCY_FIELD_NO = 12;
const STOCK_DEALS_COMMISSION_2_FIELD_NO = 13;
const STOCK_DEALS_COMMISSION_2_CURRENCY_FIELD_NO = 14;
const STOCK_DEALS_EXCHANGE_FIELD_NO = 17;
const STOCK_DEALS_NKD_FIELD_NO = 10;

const CURRENCY_CODE_FIELD_NO = 0;
const CURRENCY_DATE_FIELD_NO = 1;
const CURRENCY_EVENT_FIELD_NO = 4;
const CURRENCY_QUANTITY_FIELD_NO = 5;
const CURRENCY_PRICE_FIELD_NO = 8;
const CURRENCY_CURRENCY_FIELD_NO = 7;
const CURRENCY_COMMISSION_1_FIELD_NO = 9;
const CURRENCY_COMMISSION_1_CURRENCY_FIELD_NO = 10;
const CURRENCY_COMMISSION_2_FIELD_NO = 11;
const CURRENCY_COMMISSION_2_CURRENCY_FIELD_NO = 12;
const CURRENCY_EXCHANGE_FIELD_NO = 14;

const TRANSACTIONS_DATE_FIELD_NO = 1;
const TRANSACTIONS_EVENT_FIELD_NO = 4;
const TRANSACTIONS_PRICE_FIELD_NO = 3;
const TRANSACTIONS_CURRENCY_FIELD_NO = 2;

export function convertToSnowball(rows) {
  return rows.map((row) => {
    const [type, ...data] = row;
    switch (type) {
      case STOCK_ROW:
        return convertStocksToSnowball(data);
      case EXCHANGE_ROW:
        return convertExchangeToSnowball(data);
      case TRANSACTION_ROW:
        return convertTransactionsToSnowball(data);
      default:
        return null;
    }
  });
}

function convertStocksToSnowball(deal) {
  return {
    Event: getEvent(deal[STOCK_DEALS_EVENT_FIELD_NO]),
    Date: getDate(deal[STOCK_DEALS_DATE_FIELD_NO]),
    Symbol: deal[STOCK_DEALS_ISIN_FIELD_NO],
    Price: getPrice(deal[STOCK_DEALS_PRICE_FIELD_NO]),
    Quantity: deal[STOCK_DEALS_QUANTITY_FIELD_NO],
    Currency: fixCurrency(deal[STOCK_DEALS_CURRENCY_FIELD_NO]),
    FeeTax: getFeeTax(deal[STOCK_DEALS_COMMISSION_1_FIELD_NO], deal[STOCK_DEALS_COMMISSION_2_FIELD_NO]),
    Exchange: getExchange(deal[STOCK_DEALS_EXCHANGE_FIELD_NO]),
    NKD: deal[STOCK_DEALS_NKD_FIELD_NO],
    FeeCurrency: fixCurrency(deal[STOCK_DEALS_COMMISSION_1_CURRENCY_FIELD_NO] || deal[STOCK_DEALS_COMMISSION_2_CURRENCY_FIELD_NO]),
    DoNotAdjustCash: '',
    Note: '',
  }
}

function convertExchangeToSnowball(deal) {
  return {
    Event: 'Cash_Convert',
    Date: getDate(deal[CURRENCY_DATE_FIELD_NO]),
    Symbol: deal[CURRENCY_EVENT_FIELD_NO] === 'Покупка' ? getCashSymbol(deal[CURRENCY_CODE_FIELD_NO]) : 'RUB',
    Price: getPrice(deal[CURRENCY_EVENT_FIELD_NO] === 'Покупка' ? deal[CURRENCY_PRICE_FIELD_NO] : deal[CURRENCY_QUANTITY_FIELD_NO]),
    Quantity: deal[CURRENCY_EVENT_FIELD_NO] === 'Покупка' ? deal[CURRENCY_QUANTITY_FIELD_NO] : deal[CURRENCY_PRICE_FIELD_NO],
    Currency: fixCurrency(deal[CURRENCY_EVENT_FIELD_NO] === 'Покупка' ? 'RUB' : deal[CURRENCY_CURRENCY_FIELD_NO]),
    FeeTax: getFeeTax(deal[CURRENCY_COMMISSION_1_FIELD_NO], deal[CURRENCY_COMMISSION_2_FIELD_NO]),
    Exchange: getExchange(deal[CURRENCY_EXCHANGE_FIELD_NO]),
    NKD: 0,
    FeeCurrency: fixCurrency(deal[CURRENCY_COMMISSION_1_CURRENCY_FIELD_NO] || deal[CURRENCY_COMMISSION_2_CURRENCY_FIELD_NO]),
    DoNotAdjustCash: '',
    Note: '',
  }
}

function convertTransactionsToSnowball(deal) {
  const event = getTransactionType(deal[TRANSACTIONS_EVENT_FIELD_NO]);
  let symbol = deal[TRANSACTIONS_CURRENCY_FIELD_NO];
  let feeTax = 0;
  let price = getPrice(deal[TRANSACTIONS_PRICE_FIELD_NO]);

  if (event === 'Dividend') {
    const { isin, fee } = parseDividend(deal[TRANSACTIONS_EVENT_FIELD_NO]);
    symbol = isin;
    feeTax = getPrice(fee);
  }

  if (event === 'Fee') {
    feeTax = getPrice(deal[TRANSACTIONS_PRICE_FIELD_NO]);
    price = 0;
  }

  return {
    Event: event,
    Date: getDate(deal[TRANSACTIONS_DATE_FIELD_NO]),
    Symbol: symbol,
    Price: price, // для дивидендов считается неверно – должно быть на 1 акцию, сейчас общая сумма
    Quantity: Math.abs(deal[TRANSACTIONS_PRICE_FIELD_NO]),
    Currency: fixCurrency(deal[TRANSACTIONS_CURRENCY_FIELD_NO]),
    FeeTax: feeTax,
    Exchange: '',
    NKD: '',
    FeeCurrency: '',
    DoNotAdjustCash: '',
    Note: '',
  }
}

function getEvent(event) {
  switch (event) {
    case 'Покупка':
      return 'Buy';
    case 'Продажа':
      return 'Sell';
    default:
      return '';
  }
}

function getDate(date) {
  const [day, month, year] = date.split('.');
  return `${year}-${month}-${day}`;
}

function getFeeTax(tax1, tax2) {
  return (getPrice(tax1) * 1000 + getPrice(tax2) * 1000) / 1000;
}

function getExchange(field) {
  return field.split(',')[0].trim().replace('MOEX', 'MCX');
}

function getCashSymbol(field) {
  const [currency] = field.split('_');
  return currency.slice(0, 3);
}

function fixCurrency(currency) {
  if (currency === 'RUR' || currency === '000') {
    return 'RUB';
  }
  return currency;
}

function getPrice(price) {
  if (typeof price === 'string') {
    return Number(price.replace(',', '.').replace(/\s/g, '').replace('-', ''));
  }
  return Math.abs(price);
}

function getTransactionType(field) {
  switch (field) {
    case 'Зачисление средств на брокерский счет':
      return 'Cash_In';
    case 'Вывод ДС по требованию клиента':
      return 'Cash_Out';
    default:
      if (field.startsWith('Дивиденды')) {
        return 'Dividend';
      }
      if (field.includes('комиссия')) {
        return 'Fee';
      }
  }
}

function parseDividend(field) {
  const isin = field.match(/\((.+)\)/)[1];
  const fee = field.match(/налог-(\d+.\d+)/)[1];
  return { isin, fee };
}
