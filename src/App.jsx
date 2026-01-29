import React, { useMemo, useState } from "react";

/* =========================
   CONSTANTS & DATA
========================= */

const BASE = 1000; // thousandths of an inch
const toUnits = inches => Math.round(inches * BASE);

// Steel tooling only (your exact sizes)
const STEEL_TOOLING = [
  3, 2, 1, 0.875, 0.75, 0.625, 0.5, 0.4, 0.375,
  0.3, 0.26, 0.257, 0.255, 0.253, 0.252, 0.251, 0.25,
  0.24, 0.2, 0.125, 0.1, 0.062, 0.05, 0.031
];

/* =========================
   SOLVER
========================= */

function findBestSteelSetup(targetInches) {
  const target = toUnits(targetInches);

  const steels = STEEL_TOOLING.map(size => ({
    size,
    units: toUnits(size)
  }));

  const dp = Array(target + 1).fill(null);
  dp[0] = [];

  for (let i = 0; i <= target; i++) {
    if (!dp[i]) continue;

    for (const tool of steels) {
      const next = i + tool.units;
      if (next > target) continue;

      const candidate = [...dp[i], tool];
      if (!dp[next] || candidate.length < dp[next].length) {
        dp[next] = candidate;
      }
    }
  }

  // exact match preferred, otherwise closest under
  for (let i = target; i >= 0; i--) {
    if (dp[i]) {
      return {
        width: i / BASE,
        stack: dp[i]
      };
    }
  }

  return null;
}

/* =========================
   HELPERS
========================= */

function summarizeAndSort(stack) {
  const map = stack.reduce((acc, t) => {
    acc[t.size] = (acc[t.size] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(map)
    .map(([size, count]) => ({
      size: parseFloat(size),
      count
    }))
    .sort((a, b) => b.size - a.size);
}

/* =========================
   COMPONENT
========================= */

export default function SteelToolingCalculator() {
  const [target, setTarget] = useState("");

  const result = useMemo(() => {
    const width = parseFloat(target);
    if (!width || width <= 0) return null;
    return findBestSteelSetup(width);
  }, [target]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Steel Tooling Calculator</h2>

      <input
        type="number"
        step="0.001"
        placeholder='Target width (")'
        value={target}
        onChange={e => setTarget(e.target.value)}
        style={styles.input}
      />

      {!result && (
        <p style={styles.helper}>
          Enter a width to calculate tooling
        </p>
      )}

      {result && (
        <>
          <p style={styles.resultHeader}>
            {result.width.toFixed(3)}" Setup
            {result.width < target && (
              <span style={styles.under}>
                {" "}(
                {(target - result.width).toFixed(3)}" under)
              </span>
            )}
          </p>

          <ul style={styles.list}>
            {summarizeAndSort(result.stack).map(item => (
              <li key={item.size} style={styles.listItem}>
                <span>{item.size.toFixed(3)}"</span>
                <span>× {item.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* =========================
   MOBILE-FIRST STYLES
========================= */

const styles = {
  container: {
    maxWidth: 360,
    margin: "0 auto",
    padding: "1rem",
    textAlign: "center",
    fontFamily: "system-ui, sans-serif"
  },
  title: {
    marginBottom: "0.75rem"
  },
  input: {
    width: "100%",
    fontSize: "1.1rem",
    padding: "0.6rem",
    textAlign: "center",
    marginBottom: "0.75rem"
  },
  helper: {
    opacity: 0.6
  },
  resultHeader: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginTop: "1rem"
  },
  under: {
    fontWeight: 400,
    opacity: 0.7
  },
  list: {
    listStyle: "none",
    padding: 0,
    marginTop: "0.75rem"
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0.25rem",
    borderBottom: "1px solid #ddd",
    fontSize: "1.05rem"
  }
};
