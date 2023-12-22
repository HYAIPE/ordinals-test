import { renderHtmlCanvas } from "@0xflick/assets";
import operations, { IAttributeMetadata } from "./generate.js";
import inscriptionMappings from "inscriptions/index.js";

declare global {
  interface Window {
    tokenId: number;
    revealedAt: number;
    genesis: boolean;
  }
}

const canvas = document.querySelector("canvas#main") as HTMLCanvasElement;

function findSrcForPath(path: string) {
  const result = inscriptionMappings[path] ?? path;
  return `/content/${result}`;
}
let currentMetadata: IAttributeMetadata | null = null;
async function renderLayers(seedBytes: Uint8Array) {
  const { layers, metadata } = await operations(seedBytes, (imagePath) => {
    const img = document.createElement("img");
    img.src = findSrcForPath(imagePath);
    img.crossOrigin = "anonymous";
    return new Promise((resolve) => {
      img.onload = () => resolve(img);
    });
  });
  currentMetadata = metadata;
  const renderableCanvas = document.createElement("canvas");
  renderableCanvas.width = 569;
  renderableCanvas.height = 569;
  await renderHtmlCanvas(renderableCanvas, layers);
  // copy the image contents to the canvas
  const ctx = canvas.getContext("2d");
  ctx.drawImage(renderableCanvas, 0, 0);
}

function randomUint8ArrayOfLength(length: number) {
  const arr = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    arr[i] = Math.floor(Math.random() * 256);
  }
  return arr;
}

async function getRevealedBlockHash(): Promise<ArrayBuffer | null> {
  let hash: string | null = null;
  if (!globalThis.window.genesis) {
    try {
      const response = await fetch(
        `/blockhash/${globalThis.window.revealedAt}`,
      );
      hash = await response.text();
    } catch (e) {
      // nothing
      return null;
    }
  }

  if (!hash) {
    try {
      const response = await fetch("/blockhash");
      if (response.status !== 200) {
        return randomUint8ArrayOfLength(32);
      }
      hash = await response.text();
    } catch (e) {
      return null;
    }
  }

  // use crypto to create a sha256 hash of the block hash + window.tokenId
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(hash + globalThis.window.tokenId),
  );
  return hashBuffer;
}

async function getCurrentBlockHeight(): Promise<number | null> {
  try {
    return Number(await fetch("/blockheight").then((r) => r.text()));
  } catch (e) {
    return null;
  }
}

async function checkAndRenderLayers() {
  let isRevealed = false;
  const blockheight = await getCurrentBlockHeight();
  if (!blockheight || blockheight < globalThis.window.revealedAt) {
    const remainingBlocks = blockheight
      ? globalThis.window.revealedAt - blockheight
      : 99999999;
    // Return prereveal text
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 569, 569);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Revealing in progress...",
      canvas.width / 2,
      canvas.height / 2 - 20,
    );
    if (blockheight) {
      ctx.fillText(
        `Blocks remaining: ${remainingBlocks}`,
        canvas.width / 2,
        canvas.height / 2 + 20,
      );
    }
    isRevealed = false;
  } else {
    const hashBuffer = await getRevealedBlockHash();
    let seedBytes: Uint8Array;
    if (hashBuffer) {
      const hashArray = new Uint8Array(hashBuffer);
      seedBytes = new Uint8Array(hashArray.slice(0, 32));
      isRevealed = true;
    } else {
      seedBytes = randomUint8ArrayOfLength(32);
    }
    await renderLayers(seedBytes);
  }

  if (!isRevealed) {
    setTimeout(checkAndRenderLayers, 5000);
  }
}
checkAndRenderLayers();

function resizeCanvas() {
  var scale = Math.min(window.innerWidth / 569, window.innerHeight / 569);
  canvas.style.width = 569 * scale + "px";
  canvas.style.height = 569 * scale + "px";
}

// Resize the canvas whenever the window size changes
window.addEventListener("resize", resizeCanvas, false);

// Initial canvas resize
resizeCanvas();

// on right click, save the image
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const data = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = data;
  a.download = `${globalThis.window.tokenId}.png`;
  a.click();
});

// on press 'm', download the metadata
window.addEventListener("keydown", (e) => {
  if (e.key === "m") {
    e.preventDefault();
    const data = JSON.stringify(
      {
        tokenId: globalThis.window.tokenId,
        ...currentMetadata,
      },
      null,
      2,
    );
    const a = document.createElement("a");
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(data);
    a.download = `${globalThis.window.tokenId}.json`;
    a.click();
  }
});
