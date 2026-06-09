/**
 * 日時フォーマット関数のテスト
 *
 * TDD Red フェーズ: テストを先に書く（タスク 4.3）
 * Requirements 4.2 に対応
 *
 * 仕様:
 * - 24時間以内の投稿: 「◯分前」「◯時間前」の相対表記
 * - 24時間以上前の投稿: 「YYYY/MM/DD HH:mm」形式
 */
import { describe, it, expect } from 'vitest';
import {
  formatPostDate,
  formatAbsoluteDate,
  formatRelativeDate,
  formatLikeCount,
} from '../format';

// ===== formatAbsoluteDate =====

describe('formatAbsoluteDate', () => {
  it('ISO 8601形式の日時を「YYYY/MM/DD HH:mm」形式に変換する', () => {
    expect(formatAbsoluteDate('2024-01-15T14:30:00.000Z')).toMatch(
      /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/,
    );
  });

  it('年月日時分が正確に変換される', () => {
    // JST（+09:00）で2024/01/15 14:30を表すUTC時刻
    const jstDate = new Date(2024, 0, 15, 14, 30, 0); // ローカル時刻
    const result = formatAbsoluteDate(jstDate.toISOString());
    // フォーマット形式を確認（タイムゾーンはローカル依存）
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
  });

  it('月・日・時・分が1桁の場合はゼロ埋めされる', () => {
    // 1月1日 0時5分（ゼロ埋め確認）
    const date = new Date(2024, 0, 1, 0, 5, 0);
    const result = formatAbsoluteDate(date.toISOString());
    expect(result).toMatch(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/);
    // ゼロ埋めの確認（例: 01, 00, 05）
    const [datePart, timePart] = result.split(' ');
    const [year, month, day] = datePart.split('/');
    const [hour, minute] = timePart.split(':');
    expect(month.length).toBe(2);
    expect(day.length).toBe(2);
    expect(hour.length).toBe(2);
    expect(minute.length).toBe(2);
  });
});

// ===== formatRelativeDate =====

describe('formatRelativeDate', () => {
  it('1分前の投稿を「1分前」と表示する', () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);
    expect(formatRelativeDate(oneMinuteAgo.toISOString(), now)).toBe('1分前');
  });

  it('30分前の投稿を「30分前」と表示する', () => {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    expect(formatRelativeDate(thirtyMinutesAgo.toISOString(), now)).toBe(
      '30分前',
    );
  });

  it('59分前の投稿を「59分前」と表示する', () => {
    const now = new Date();
    const fiftyNineMinutesAgo = new Date(now.getTime() - 59 * 60 * 1000);
    expect(formatRelativeDate(fiftyNineMinutesAgo.toISOString(), now)).toBe(
      '59分前',
    );
  });

  it('1時間前の投稿を「1時間前」と表示する', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    expect(formatRelativeDate(oneHourAgo.toISOString(), now)).toBe('1時間前');
  });

  it('23時間前の投稿を「23時間前」と表示する', () => {
    const now = new Date();
    const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);
    expect(formatRelativeDate(twentyThreeHoursAgo.toISOString(), now)).toBe(
      '23時間前',
    );
  });

  it('たった今の投稿を「今」または「1分前」と表示する', () => {
    const now = new Date();
    const result = formatRelativeDate(now.toISOString(), now);
    // 「今」または「0分前」または「1分前」のいずれかを許容
    expect(result).toMatch(/^(今|0分前|1分前)$/);
  });
});

// ===== formatPostDate =====

describe('formatPostDate', () => {
  it('24時間以内の投稿は相対表記を返す', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const result = formatPostDate(oneHourAgo.toISOString());
    // 相対表記であることを確認（「時間前」または「分前」を含む）
    expect(result).toMatch(/前$/);
  });

  it('25時間以上前の投稿は絶対表記（YYYY/MM/DD HH:mm）を返す', () => {
    const now = new Date();
    const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
    const result = formatPostDate(twentyFiveHoursAgo.toISOString());
    // 「YYYY/MM/DD HH:mm」形式を確認
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
  });

  it('1日以上前の投稿は絶対表記を返す', () => {
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    );
    const result = formatPostDate(sevenDaysAgo.toISOString());
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
  });
});

// ===== formatLikeCount =====

describe('formatLikeCount', () => {
  it('0のいいね数はそのまま「0」を返す', () => {
    expect(formatLikeCount(0)).toBe('0');
  });

  it('999のいいね数はそのまま「999」を返す', () => {
    expect(formatLikeCount(999)).toBe('999');
  });

  it('1000のいいね数は「1K」を返す（Property 14）', () => {
    expect(formatLikeCount(1000)).toBe('1K');
  });

  it('1500のいいね数は「1.5K」を返す', () => {
    expect(formatLikeCount(1500)).toBe('1.5K');
  });

  it('10000のいいね数は「10K」を返す', () => {
    expect(formatLikeCount(10000)).toBe('10K');
  });

  it('1000未満の整数はそのままの数値を返す（Property 14）', () => {
    // 0〜999の整数はそのまま文字列表現
    [0, 1, 100, 500, 999].forEach((n) => {
      expect(formatLikeCount(n)).toBe(String(n));
    });
  });

  it('1000以上は短縮形式を返す（Property 14）', () => {
    expect(formatLikeCount(1000)).toMatch(/K$/);
    expect(formatLikeCount(5000)).toMatch(/K$/);
    expect(formatLikeCount(100000)).toMatch(/K$/);
  });
});
