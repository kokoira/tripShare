/**
 * 投稿バリデーション関数のテスト（プロパティテスト含む）
 *
 * TDD Red フェーズ: テストを先に書く（タスク 4.3）
 * Requirements 3.1, 3.2, 3.3 に対応
 *
 * Property 5: 投稿本文バリデーション
 * - 1文字以上280文字以内かつ空白文字のみでない場合はバリデーション通過
 * - それ以外（空文字、空白のみ、281文字以上）は拒否される
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validatePostBody,
  countPostBodyLength,
  getRemainingChars,
} from '../post-validation';

// ===== validatePostBody =====

describe('validatePostBody', () => {
  // ---- 通常テスト ----

  describe('有効な投稿本文', () => {
    it('1文字の投稿本文は有効（Requirement 3.1）', () => {
      const result = validatePostBody('あ');
      expect(result.valid).toBe(true);
    });

    it('280文字の投稿本文は有効（最大文字数）', () => {
      const result = validatePostBody('あ'.repeat(280));
      expect(result.valid).toBe(true);
    });

    it('通常の投稿本文は有効', () => {
      const result = validatePostBody('京都に旅行に行きました。素晴らしい旅でした！');
      expect(result.valid).toBe(true);
    });

    it('英数字の投稿本文は有効', () => {
      const result = validatePostBody('Trip to Kyoto was amazing!');
      expect(result.valid).toBe(true);
    });

    it('改行を含む投稿本文は有効（本文に改行がある場合）', () => {
      const result = validatePostBody('1日目: 京都観光\n2日目: 大阪グルメ');
      expect(result.valid).toBe(true);
    });
  });

  describe('無効な投稿本文', () => {
    it('空文字は無効（Requirement 3.2）', () => {
      const result = validatePostBody('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('スペースのみは無効（Requirement 3.2）', () => {
      const result = validatePostBody('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('タブのみは無効（Requirement 3.2）', () => {
      const result = validatePostBody('\t\t\t');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('改行のみは無効（Requirement 3.2）', () => {
      const result = validatePostBody('\n\n\n');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('281文字の投稿本文は無効（Requirement 3.3）', () => {
      const result = validatePostBody('あ'.repeat(281));
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('500文字の投稿本文は無効', () => {
      const result = validatePostBody('あ'.repeat(500));
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('エラーメッセージの検証', () => {
    it('空文字の場合は適切なエラーメッセージが返る', () => {
      const result = validatePostBody('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('入力');
    });

    it('文字数超過の場合は適切なエラーメッセージが返る', () => {
      const result = validatePostBody('あ'.repeat(281));
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      // 280または文字数に関するメッセージを含む
      expect(result.error!.length).toBeGreaterThan(0);
    });
  });

  // ---- プロパティテスト（Property 5） ----

  it('[Property 5] 1〜280文字の非空白文字列はすべて有効', () => {
    fc.assert(
      fc.property(
        // 1〜280文字で、最初の文字が非空白の文字列
        fc
          .string({ minLength: 1, maxLength: 280 })
          .filter((s) => s.trim().length > 0),
        (validBody) => {
          const result = validatePostBody(validBody);
          return result.valid === true;
        },
      ),
    );
  });

  it('[Property 5] 空白文字のみの文字列はすべて無効', () => {
    fc.assert(
      fc.property(
        // 空白文字（スペース・タブ・改行）のみで構成される文字列
        fc.stringMatching(/^[\s]+$/),
        (whitespaceBody) => {
          const result = validatePostBody(whitespaceBody);
          return result.valid === false;
        },
      ),
    );
  });

  it('[Property 5] 281文字以上の文字列はすべて無効', () => {
    fc.assert(
      fc.property(
        // 281〜500文字の文字列
        fc.string({ minLength: 281, maxLength: 500 }),
        (longBody) => {
          const result = validatePostBody(longBody);
          return result.valid === false;
        },
      ),
    );
  });

  it('[Property 5] 無効な入力には必ずerrorメッセージが付与される', () => {
    fc.assert(
      fc.property(
        // 空文字または281文字以上
        fc.oneof(
          fc.constant(''),
          fc.string({ minLength: 281, maxLength: 500 }),
          fc.stringMatching(/^[\s]+$/),
        ),
        (invalidBody) => {
          const result = validatePostBody(invalidBody);
          if (!result.valid) {
            return typeof result.error === 'string' && result.error.length > 0;
          }
          return true;
        },
      ),
    );
  });
});

// ===== countPostBodyLength =====

describe('countPostBodyLength', () => {
  it('空文字の文字数は0', () => {
    expect(countPostBodyLength('')).toBe(0);
  });

  it('「あ」1文字の文字数は1', () => {
    expect(countPostBodyLength('あ')).toBe(1);
  });

  it('280文字の文字数は280', () => {
    expect(countPostBodyLength('あ'.repeat(280))).toBe(280);
  });

  it('マルチバイト文字は1文字としてカウントされる', () => {
    // 日本語、絵文字等のマルチバイト文字
    expect(countPostBodyLength('🗾')).toBe(1);
    expect(countPostBodyLength('日本🗾')).toBe(3);
  });
});

// ===== getRemainingChars =====

describe('getRemainingChars', () => {
  it('空文字の残り文字数は280', () => {
    expect(getRemainingChars('')).toBe(280);
  });

  it('100文字の投稿の残り文字数は180', () => {
    expect(getRemainingChars('あ'.repeat(100))).toBe(180);
  });

  it('280文字の投稿の残り文字数は0', () => {
    expect(getRemainingChars('あ'.repeat(280))).toBe(0);
  });

  it('281文字の投稿の残り文字数は-1（マイナスになる）', () => {
    expect(getRemainingChars('あ'.repeat(281))).toBe(-1);
  });

  it('カスタム最大文字数を指定できる', () => {
    expect(getRemainingChars('あ'.repeat(10), 200)).toBe(190);
  });
});
