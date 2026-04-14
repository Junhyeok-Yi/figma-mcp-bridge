#!/usr/bin/env node
"use strict";

/**
 * Benchmark: 5가지 프레임 유형 × 3가지 읽기 모드 성능 측정
 *
 * 실행 방법:
 *   1. Figma에서 플러그인 연결
 *   2. node tests/benchmark-frames.js
 *
 * 측정 항목:
 *   - 응답 시간 (ms)
 *   - 응답 크기 (bytes)
 *   - 노드 수
 */

const BASE_URL = process.env.FIGMA_API || "http://localhost:3000";

async function api(method, urlPath, body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  opts.signal = AbortSignal.timeout(90000);
  const res = await fetch(`${BASE_URL}${urlPath}`, opts);
  const text = await res.text();
  return { status: res.status, bytes: Buffer.byteLength(text), data: JSON.parse(text) };
}

async function timed(label, fn) {
  const start = performance.now();
  try {
    const result = await fn();
    const elapsed = Math.round(performance.now() - start);
    return { label, elapsed, ...result, error: null };
  } catch (err) {
    const elapsed = Math.round(performance.now() - start);
    return { label, elapsed, bytes: 0, data: null, error: err.message };
  }
}

// 1단계: 테스트 프레임 5개 생성
async function createTestFrames() {
  console.log("\n📦 테스트 프레임 생성 중...\n");
  const frames = [];

  // Frame 1: 빈 프레임 (기준선)
  const f1 = await api("POST", "/api/create_node", {
    nodeType: "FRAME", properties: { name: "Bench-Empty", width: 200, height: 200 }
  });
  frames.push({ name: "Empty Frame", id: f1.data.nodeId });

  // Frame 2: 얕은 트리 (자식 10개, depth 1)
  const f2 = await api("POST", "/api/create_node", {
    nodeType: "FRAME", properties: { name: "Bench-Shallow", width: 400, height: 400, layoutMode: "VERTICAL", itemSpacing: 8 }
  });
  for (let i = 0; i < 10; i++) {
    await api("POST", "/api/create_node", {
      nodeType: "RECTANGLE",
      properties: { name: `Rect-${i}`, width: 380, height: 30 },
      parentId: f2.data.nodeId,
    });
  }
  frames.push({ name: "Shallow (10 children)", id: f2.data.nodeId });

  // Frame 3: 깊은 트리 (depth 5, 각 레벨 2자식)
  const f3 = await api("POST", "/api/create_node", {
    nodeType: "FRAME", properties: { name: "Bench-Deep", width: 400, height: 400, layoutMode: "VERTICAL" }
  });
  let parentId = f3.data.nodeId;
  for (let depth = 0; depth < 5; depth++) {
    const child = await api("POST", "/api/create_node", {
      nodeType: "FRAME",
      properties: { name: `Depth-${depth}`, width: 380 - depth * 20, height: 60, layoutMode: "HORIZONTAL", itemSpacing: 4 },
      parentId,
    });
    await api("POST", "/api/create_node", {
      nodeType: "RECTANGLE",
      properties: { name: `Sibling-${depth}`, width: 30, height: 30 },
      parentId,
    });
    parentId = child.data.nodeId;
  }
  frames.push({ name: "Deep (5 levels)", id: f3.data.nodeId });

  // Frame 4: 텍스트 혼합 (TEXT + FRAME 5개씩)
  const f4 = await api("POST", "/api/create_node", {
    nodeType: "FRAME", properties: { name: "Bench-Mixed", width: 400, height: 600, layoutMode: "VERTICAL", itemSpacing: 12 }
  });
  for (let i = 0; i < 5; i++) {
    await api("POST", "/api/create_node", {
      nodeType: "TEXT", textContent: `Sample text item ${i}`, parentId: f4.data.nodeId,
    });
    await api("POST", "/api/create_node", {
      nodeType: "FRAME",
      properties: { name: `Inner-${i}`, width: 380, height: 40 },
      parentId: f4.data.nodeId,
    });
  }
  frames.push({ name: "Mixed (TEXT+FRAME ×5)", id: f4.data.nodeId });

  // Frame 5: 넓은 트리 (자식 30개 — auto-truncation 트리거)
  const f5 = await api("POST", "/api/create_node", {
    nodeType: "FRAME", properties: { name: "Bench-Wide", width: 800, height: 800, layoutMode: "VERTICAL", itemSpacing: 4 }
  });
  for (let i = 0; i < 30; i++) {
    await api("POST", "/api/create_node", {
      nodeType: "RECTANGLE",
      properties: { name: `Wide-${i}`, width: 780, height: 20 },
      parentId: f5.data.nodeId,
    });
  }
  frames.push({ name: "Wide (30 children)", id: f5.data.nodeId });

  return frames;
}

// 2단계: 각 프레임 × 3모드 읽기 벤치마크
async function benchmarkReads(frames) {
  console.log("📊 읽기 벤치마크 실행 중...\n");
  const modes = [
    { name: "skeleton", qs: "?skeleton=1" },
    { name: "compact",  qs: "" },
    { name: "verbose",  qs: "?verbose=1" },
  ];

  const results = [];

  for (const frame of frames) {
    for (const mode of modes) {
      const result = await timed(
        `${frame.name} [${mode.name}]`,
        () => api("GET", `/api/node/${frame.id}${mode.qs}`)
      );
      results.push(result);
    }
  }

  return results;
}

// 3단계: children 페이지네이션 벤치마크
async function benchmarkPagination(wideFrameId) {
  console.log("📄 페이지네이션 벤치마크 실행 중...\n");
  const results = [];

  // 전체 한번에
  results.push(await timed("Full read (30 children)", () =>
    api("GET", `/api/node/${wideFrameId}?depth=1`)
  ));

  // 페이지네이션 (10씩 3번)
  for (let offset = 0; offset < 30; offset += 10) {
    results.push(await timed(`Page offset=${offset} limit=10`, () =>
      api("GET", `/api/node/${wideFrameId}/children?offset=${offset}&limit=10&depth=1`)
    ));
  }

  return results;
}

// 4단계: 정리 (생성한 프레임 삭제)
async function cleanup(frames) {
  const ids = frames.map(f => f.id);
  await api("POST", "/api/delete_nodes", { nodeIds: ids });
  console.log(`\n🧹 테스트 프레임 ${ids.length}개 삭제 완료\n`);
}

// 결과 출력
function printResults(label, results) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  ${label}`);
  console.log(`${"=".repeat(70)}`);
  console.log(
    "  " +
    "Test".padEnd(36) +
    "Time(ms)".padStart(10) +
    "Size(B)".padStart(10) +
    "  Status"
  );
  console.log(`  ${"-".repeat(66)}`);

  for (const r of results) {
    const status = r.error ? `❌ ${r.error.slice(0, 30)}` : "✅";
    console.log(
      "  " +
      r.label.padEnd(36) +
      String(r.elapsed).padStart(10) +
      String(r.bytes).padStart(10) +
      `  ${status}`
    );
  }
}

// Main
async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  Figma MCP Bridge — Benchmark Suite                    ║");
  console.log("╚══════════════════════════════════════════════════════════╝");

  // 연결 확인
  try {
    const status = await api("GET", "/api/status");
    if (!status.data.connected) {
      console.error("❌ Figma 플러그인이 연결되어 있지 않습니다.");
      process.exit(1);
    }
    console.log("✅ Figma 연결 확인됨");
  } catch (err) {
    console.error(`❌ 서버 연결 실패: ${err.message}`);
    process.exit(1);
  }

  const frames = await createTestFrames();
  console.log(`✅ 테스트 프레임 ${frames.length}개 생성 완료`);

  const readResults = await benchmarkReads(frames);
  printResults("읽기 벤치마크 (5 Frames × 3 Modes)", readResults);

  const wideFrame = frames.find(f => f.name.includes("Wide"));
  const pageResults = await benchmarkPagination(wideFrame.id);
  printResults("페이지네이션 벤치마크 (Wide Frame)", pageResults);

  // 요약
  const compactResults = readResults.filter(r => r.label.includes("[compact]"));
  const skeletonResults = readResults.filter(r => r.label.includes("[skeleton]"));
  const verboseResults = readResults.filter(r => r.label.includes("[verbose]"));

  const avg = (arr, key) => Math.round(arr.reduce((s, r) => s + r[key], 0) / arr.length);

  console.log("\n📈 모드별 평균:");
  console.log(`  skeleton : ${avg(skeletonResults, "elapsed")}ms, ${avg(skeletonResults, "bytes")}B`);
  console.log(`  compact  : ${avg(compactResults, "elapsed")}ms, ${avg(compactResults, "bytes")}B`);
  console.log(`  verbose  : ${avg(verboseResults, "elapsed")}ms, ${avg(verboseResults, "bytes")}B`);

  if (avg(compactResults, "bytes") > 0 && avg(verboseResults, "bytes") > 0) {
    const reduction = Math.round((1 - avg(compactResults, "bytes") / avg(verboseResults, "bytes")) * 100);
    console.log(`  compact 절감률: ${reduction}% (vs verbose)`);
  }

  await cleanup(frames);
  console.log("✅ 벤치마크 완료");
}

main().catch(err => {
  console.error(`❌ 벤치마크 실패: ${err.message}`);
  process.exit(1);
});
