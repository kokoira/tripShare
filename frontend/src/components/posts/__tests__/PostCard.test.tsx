/**
 * PostCardコンポーネントのテスト
 *
 * TDD Red フェーズ: テストを先に書く（タスク 4.3）
 * Requirements 3, 4 に対応
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PostCard from '../PostCard';
import type { Post, User } from '@/types';

// テスト用モックデータ
const mockUser: Pick<User, 'id' | 'username' | 'avatar_key'> = {
  id: 1,
  username: 'testuser',
  avatar_key: null,
};

const mockCurrentUser: Pick<User, 'id' | 'username'> = {
  id: 1,
  username: 'testuser',
};

const mockOtherUser: Pick<User, 'id' | 'username'> = {
  id: 2,
  username: 'otheruser',
};

const mockPost: Post = {
  id: 1,
  user: mockUser,
  body: '京都に旅行に行きました。とても良い旅でした！',
  comments_count: 5,
  likes_count: 10,
  liked_by_current_user: false,
  images: [],
  created_at: new Date().toISOString(),
};

describe('PostCard', () => {
  // ---- 表示内容のテスト ----

  describe('投稿情報の表示（Requirement 4.2）', () => {
    it('投稿本文が表示される', () => {
      render(
        <PostCard post={mockPost} currentUser={mockCurrentUser} />,
      );
      expect(screen.getByText(mockPost.body)).toBeInTheDocument();
    });

    it('投稿者のユーザー名が表示される', () => {
      render(
        <PostCard post={mockPost} currentUser={mockCurrentUser} />,
      );
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    });

    it('コメント数が表示される', () => {
      render(
        <PostCard post={mockPost} currentUser={mockCurrentUser} />,
      );
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it('いいね数が表示される', () => {
      render(
        <PostCard post={mockPost} currentUser={mockCurrentUser} />,
      );
      expect(screen.getByText(/10/)).toBeInTheDocument();
    });

    it('投稿日時が表示される', () => {
      render(
        <PostCard post={mockPost} currentUser={mockCurrentUser} />,
      );
      // 日時が何らかの形で表示されること（相対表記または絶対表記）
      // 「前」を含む相対表記か、YYYY/MM/DD形式の絶対表記が表示される
      const timeElement = screen.getByRole('time');
      expect(timeElement).toBeInTheDocument();
    });
  });

  describe('投稿本文の省略表示（Requirement 4.2）', () => {
    it('200文字以下の本文はそのまま表示される', () => {
      const shortPost = { ...mockPost, body: 'あ'.repeat(200) };
      render(
        <PostCard post={shortPost} currentUser={mockCurrentUser} />,
      );
      expect(screen.getByText('あ'.repeat(200))).toBeInTheDocument();
    });

    it('200文字を超える本文は省略して「...」で表示される', () => {
      const longPost = { ...mockPost, body: 'あ'.repeat(201) };
      render(
        <PostCard post={longPost} currentUser={mockCurrentUser} />,
      );
      // 省略記号を含む表示
      const bodyText = screen.getByTestId('post-body');
      expect(bodyText.textContent).toContain('...');
      // 200文字を超えて表示されないこと
      const displayedText = bodyText.textContent ?? '';
      expect(displayedText.replace('...', '').length).toBeLessThanOrEqual(200);
    });
  });

  describe('削除ボタンの表示制御（Requirements 3.5）', () => {
    it('自分の投稿には削除ボタンが表示される', () => {
      render(
        <PostCard post={mockPost} currentUser={mockCurrentUser} />,
      );
      expect(screen.getByRole('button', { name: /削除/ })).toBeInTheDocument();
    });

    it('他ユーザーの投稿には削除ボタンが表示されない', () => {
      render(
        <PostCard post={mockPost} currentUser={mockOtherUser} />,
      );
      expect(
        screen.queryByRole('button', { name: /削除/ }),
      ).not.toBeInTheDocument();
    });

    it('未ログイン状態では削除ボタンが表示されない', () => {
      render(
        <PostCard post={mockPost} currentUser={null} />,
      );
      expect(
        screen.queryByRole('button', { name: /削除/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe('削除確認ダイアログ（Requirement 3.6）', () => {
    it('削除ボタンをクリックするとonDeleteが呼ばれる', () => {
      const mockOnDelete = vi.fn();
      render(
        <PostCard
          post={mockPost}
          currentUser={mockCurrentUser}
          onDelete={mockOnDelete}
        />,
      );
      const deleteButton = screen.getByRole('button', { name: /削除/ });
      fireEvent.click(deleteButton);
      // 確認ダイアログを経てonDeleteが呼ばれることを確認
      // ダイアログの確認ボタンが表示される
      const confirmButton = screen.getByRole('button', { name: /確認|はい|削除する/ });
      fireEvent.click(confirmButton);
      expect(mockOnDelete).toHaveBeenCalledWith(mockPost.id);
    });

    it('削除ボタンをクリックして取り消すとonDeleteは呼ばれない', () => {
      const mockOnDelete = vi.fn();
      render(
        <PostCard
          post={mockPost}
          currentUser={mockCurrentUser}
          onDelete={mockOnDelete}
        />,
      );
      const deleteButton = screen.getByRole('button', { name: /削除/ });
      fireEvent.click(deleteButton);
      // キャンセルボタン
      const cancelButton = screen.getByRole('button', { name: /キャンセル|いいえ/ });
      fireEvent.click(cancelButton);
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe('いいねボタン（Requirements 6.1, 6.4）', () => {
    it('いいね済みでない場合、いいねボタンが非アクティブ状態で表示される', () => {
      const post = { ...mockPost, liked_by_current_user: false };
      render(
        <PostCard post={post} currentUser={mockCurrentUser} />,
      );
      const likeButton = screen.getByRole('button', { name: /いいね/ });
      expect(likeButton).not.toHaveClass('active');
      // またはaria-pressedなどで判断
    });

    it('いいね済みの場合、いいねボタンがアクティブ状態で表示される', () => {
      const post = { ...mockPost, liked_by_current_user: true };
      render(
        <PostCard post={post} currentUser={mockCurrentUser} />,
      );
      const likeButton = screen.getByRole('button', { name: /いいね/ });
      // aria-pressed="true" またはactiveクラスが付与されていること
      expect(likeButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('いいねボタンをクリックするとonLikeToggleが呼ばれる', () => {
      const mockOnLikeToggle = vi.fn();
      render(
        <PostCard
          post={mockPost}
          currentUser={mockCurrentUser}
          onLikeToggle={mockOnLikeToggle}
        />,
      );
      const likeButton = screen.getByRole('button', { name: /いいね/ });
      fireEvent.click(likeButton);
      expect(mockOnLikeToggle).toHaveBeenCalledWith(mockPost.id);
    });
  });

  describe('アクセシビリティ', () => {
    it('投稿要素がarticleロールを持つ', () => {
      render(
        <PostCard post={mockPost} currentUser={mockCurrentUser} />,
      );
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });
});
