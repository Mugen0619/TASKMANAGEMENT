---
name: dev-server-port-conflict
description: バックエンド(8080)・フロントエンド(5173)のサーバー起動時にポートが競合した場合に、別ポートへ逃げず、使用中プロセスを確認・停止してから指定ポートで起動し直す手順。「ポートが使用中」「port already in use」「EADDRINUSE」「address already in use」などのエラーが出たとき、または `npm run dev` / Spring Bootの起動に失敗したときに使う。
---

# 開発サーバーのポート競合対処

このプロジェクトでは、バックエンドは **8080番**、フロントエンドは **5173番** で常に起動する運用にしている(詳細な方針は `CLAUDE.md` を参照)。ポートが競合してもフレームワークが自動選択する別ポートで起動させてはならない。必ず以下の手順で、使用中のプロセスを止めてから指定ポートで起動し直す。

対象ポート:
- バックエンド(Spring Boot): `8080`
- フロントエンド(Vite): `5173`

## 手順

### 1. ポートが使用中か確認する(Windows)

PowerShellの場合:
```powershell
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
```
何か行が出力されれば使用中。`OwningProcess` 列がプロセスID(PID)。

コマンドプロンプト/Git Bashの場合:
```
netstat -ano | findstr :8080
```
出力の最後の列がPID。何も出力されなければそのポートは空いている。

フロントエンドを確認する場合は `8080` を `5173` に置き換える。

### 2. 使用中プロセスの詳細を確認する(任意)

誤って無関係のプロセスを停止しないよう、停止前にプロセス名を確認する。

PowerShell:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess
```

コマンドプロンプト/Git Bash:
```
tasklist /FI "PID eq <確認したPID>"
```

### 3. プロセスを停止する

PowerShell:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force
```

コマンドプロンプト/Git Bash:
```
taskkill /PID <確認したPID> /F
```

### 4. 指定ポートで起動し直す

- バックエンド: `backend` ディレクトリでSpring Bootを起動する(`server.port=8080` が `application.properties` に設定済みのため8080番で起動する)
- フロントエンド: `frontend` ディレクトリで `npm run dev` を実行する(`vite.config.ts` の `strictPort: true` により、5173番が空いていない場合はエラーで停止する仕様。エラーになった場合は手順1〜3を再実行する)

### 5. 再確認

手順1と同じコマンドで、目的のプロセス(起動したいアプリ自身)がそのポートを掴んでいることを確認する。
