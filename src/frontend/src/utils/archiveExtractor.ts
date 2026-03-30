import { gunzipSync, unzipSync } from "fflate";

function baseName(filePath: string): string {
  return filePath.split("/").pop() ?? filePath;
}

function stripExtension(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

function decodeUtf8(bytes: Uint8Array): string | null {
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    // Skip binary: null bytes are a strong signal
    if (text.includes("\0")) return null;
    return text;
  } catch {
    return null;
  }
}

function parseTar(buffer: Uint8Array): { name: string; content: Uint8Array }[] {
  const files: { name: string; content: Uint8Array }[] = [];
  let offset = 0;
  while (offset + 512 <= buffer.length) {
    const header = buffer.slice(offset, offset + 512);
    // Name: bytes 0-99
    let name = "";
    for (let i = 0; i < 100; i++) {
      if (header[i] === 0) break;
      name += String.fromCharCode(header[i]);
    }
    if (!name) break;

    // Size: bytes 124-135 (octal string)
    let sizeStr = "";
    for (let i = 124; i < 136; i++) {
      if (header[i] === 0 || header[i] === 32) break;
      sizeStr += String.fromCharCode(header[i]);
    }
    const size = Number.parseInt(sizeStr.trim(), 8) || 0;

    // Type flag: byte 156 (0 or '0' = regular file)
    const typeFlag = header[156];
    const isRegular = typeFlag === 0 || typeFlag === 48; // 48 = '0'

    offset += 512;
    if (isRegular && size > 0 && name && !name.endsWith("/")) {
      files.push({ name, content: buffer.slice(offset, offset + size) });
    }
    // Advance to next 512-byte block boundary
    offset += Math.ceil(size / 512) * 512;
  }
  return files;
}

export async function extractArchive(
  file: File,
): Promise<{ title: string; content: string }[]> {
  const lower = file.name.toLowerCase();
  const results: { title: string; content: string }[] = [];

  if (lower.endsWith(".zip")) {
    const buf = await file.arrayBuffer();
    let entries: Record<string, Uint8Array>;
    try {
      entries = unzipSync(new Uint8Array(buf));
    } catch {
      return [];
    }
    for (const [path, data] of Object.entries(entries)) {
      if (path.endsWith("/")) continue; // directory
      const text = decodeUtf8(data);
      if (text === null) continue;
      const title = stripExtension(baseName(path));
      if (!title) continue;
      results.push({ title, content: text });
    }
  } else if (
    lower.endsWith(".tar.gz") ||
    lower.endsWith(".tgz") ||
    lower.endsWith(".tar")
  ) {
    const buf = await file.arrayBuffer();
    let tarBytes: Uint8Array;
    if (lower.endsWith(".tar")) {
      tarBytes = new Uint8Array(buf);
    } else {
      try {
        tarBytes = gunzipSync(new Uint8Array(buf));
      } catch {
        return [];
      }
    }
    const files = parseTar(tarBytes);
    for (const { name, content: data } of files) {
      const text = decodeUtf8(data);
      if (text === null) continue;
      const title = stripExtension(baseName(name));
      if (!title) continue;
      results.push({ title, content: text });
    }
  } else if (lower.endsWith(".rar")) {
    // RAR is not natively supported in browsers without heavy WASM.
    // Signal the caller to show an appropriate message.
    throw new Error("RAR_NOT_SUPPORTED");
  }

  return results;
}
