import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

interface GameItem {
  id: number;
  color: string;
  shape: string;
  matched: boolean;
}

const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
const shapes = ["circle", "square", "triangle", "diamond", "star", "heart"];

const App: React.FC = () => {
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [gameMode, setGameMode] = useState<"color" | "shape">("color");
  const [level, setLevel] = useState(1);

  // ゲームアイテムを生成（必ずペアが存在するように）
  const generateGameItems = useCallback(() => {
    let baseItemCount = Math.min(4 + level, 8); // レベルに応じてアイテム数を増加

    // 常に偶数個になるように調整
    if (baseItemCount % 2 === 1) {
      baseItemCount = baseItemCount + 1;
    }

    const pairCount = baseItemCount / 2; // ペア数
    const items: GameItem[] = [];

    // ペアを作成
    for (let i = 0; i < pairCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      // 同じ色・形のペアを2つ作成
      items.push({
        id: i * 2,
        color: color,
        shape: shape,
        matched: false,
      });

      items.push({
        id: i * 2 + 1,
        color: color,
        shape: shape,
        matched: false,
      });
    }

    // アイテムをシャッフル
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    // IDを再割り当て
    items.forEach((item, index) => {
      item.id = index;
    });

    setGameItems(items);
    setSelectedItems([]);
  }, [level]);

  // ゲーム開始時とレベルアップ時にアイテムを生成
  useEffect(() => {
    generateGameItems();
  }, [level, generateGameItems]);

  // アイテムクリック処理
  const handleItemClick = (id: number) => {
    if (selectedItems.includes(id) || gameItems[id].matched) return;

    const newSelected = [...selectedItems, id];
    setSelectedItems(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      const firstItem = gameItems[first];
      const secondItem = gameItems[second];

      const isMatch =
        gameMode === "color"
          ? firstItem.color === secondItem.color
          : firstItem.shape === secondItem.shape;

      if (isMatch) {
        // マッチした場合
        setTimeout(() => {
          setGameItems((prev) =>
            prev.map((item) =>
              item.id === first || item.id === second
                ? { ...item, matched: true }
                : item
            )
          );
          setScore((prev) => prev + 10);
          setSelectedItems([]);

          // 全てマッチしたかチェック
          const updatedItems = gameItems.map((item) =>
            item.id === first || item.id === second
              ? { ...item, matched: true }
              : item
          );

          if (updatedItems.every((item) => item.matched)) {
            setTimeout(() => {
              setLevel((prev) => prev + 1);
            }, 1000);
          }
        }, 500);
      } else {
        // マッチしなかった場合
        setTimeout(() => {
          setSelectedItems([]);
        }, 1000);
      }
    }
  };

  // ゲームリセット
  const resetGame = () => {
    setScore(0);
    setLevel(1);
    generateGameItems();
  };

  return (
    <div className="App">
      <header className="game-header">
        <h1>色合わせ・形合わせゲーム</h1>
        <div className="game-info">
          <div className="score">スコア: {score}</div>
          <div className="level">レベル: {level}</div>
        </div>
        <div className="game-controls">
          <button
            className={`mode-btn ${gameMode === "color" ? "active" : ""}`}
            onClick={() => setGameMode("color")}
          >
            色合わせ
          </button>
          <button
            className={`mode-btn ${gameMode === "shape" ? "active" : ""}`}
            onClick={() => setGameMode("shape")}
          >
            形合わせ
          </button>
          <button className="reset-btn" onClick={resetGame}>
            リセット
          </button>
        </div>
      </header>

      <main className="game-board">
        <div className="items-grid">
          {gameItems.map((item) => (
            <div
              key={item.id}
              className={`game-item ${item.shape} ${
                selectedItems.includes(item.id) ? "selected" : ""
              } ${item.matched ? "matched" : ""}`}
              style={{ backgroundColor: item.color }}
              onClick={() => handleItemClick(item.id)}
            >
              <div className="item-content">
                {item.shape === "triangle" && "▲"}
                {item.shape === "diamond" && "◆"}
                {item.shape === "star" && "★"}
                {item.shape === "heart" && "♥"}
              </div>
            </div>
          ))}
        </div>

        <div className="game-instructions">
          <p>
            {gameMode === "color" ? "同じ色" : "同じ形"}
            のアイテムを2つ選んでマッチさせよう！
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
