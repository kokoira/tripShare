# k6 パフォーマンステスト

タスク 17.1 で実装予定のパフォーマンステストスクリプト置き場。

## 実行方法

```bash
# タイムライン負荷テスト
docker compose --profile test run --rm k6 run /scripts/timeline-load.js

# 投稿作成負荷テスト
docker compose --profile test run --rm k6 run /scripts/post-create-load.js

# 複合シナリオテスト
docker compose --profile test run --rm k6 run /scripts/complex-scenario.js
```
