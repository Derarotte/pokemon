# Pokemon Game

一个最小可运行的宝可梦网页游戏示例，使用开源 PokeAPI 数据。

## 快速开始

```bash
npm install
npm run fetch:data
npm run start
```

然后访问 `http://localhost:3000/public/`。

## 数据来源

- API: https://pokeapi.co/
- 文档: https://pokeapi.co/docs/v2

## 手动更新并推送数据（暂不使用 GitHub Actions）

方式 1（推荐，一条命令）：

```bash
npm run push:data
```

方式 2（分步）：

```bash
node scripts/fetch-pokemon-data.mjs
git add data/pokemon.json
git commit -m "chore(data): manual update pokemon dataset"
git push
```

说明：

- 当前已禁用自动工作流文件：`.github/workflows/update-pokemon-data.yml.disabled`
- 之后你想恢复自动化时，把文件改回 `.yml` 即可
