# 任務狀態同步完成

## ✅ 同步操作完成

**完成時間:** {timestamp}  
**同步狀態:** {success}

## 🔧 已解決的問題 ({totalResolved}個)

{resolvedIssuesList}

## ⚠️ 剩餘問題 ({totalRemaining}個)

{remainingIssuesList}

{statsSection}

---

### 🎉 同步結果總結

- ✅ **成功解決:** {totalResolved} 個問題
- ⚠️ **待處理:** {totalRemaining} 個問題

{#if totalRemaining > 0}
### 💡 後續建議

對於剩餘的問題，建議：
1. 檢視具體問題描述和建議操作
2. 考慮使用 `force: true` 參數進行強制修復
3. 對於關鍵問題，建議手動處理以確保數據安全
{/if}