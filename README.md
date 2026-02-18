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

## 定时更新

仓库包含 `.github/workflows/update-pokemon-data.yml`，每天自动更新 `data/pokemon.json` 并提交。
