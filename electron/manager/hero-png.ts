import { inflateSync } from 'zlib';
import { Rgb } from './contrast';

/** 解码 1×1 PNG（nativeImage.resize 缩略图）得到整图平均 RGB。
    仅支持非隔行、8bit 的 RGB/RGBA/灰度编码；解码失败返回 null。 */
export function decodePngAverageRgb(png: Buffer): Rgb | null {
  if (png.length < 16 || png.readUInt32BE(0) !== 0x89504e47) return null;
  let offset = 8;
  let colorType = -1;
  const idatChunks: Buffer[] = [];
  while (offset + 12 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      const width = data.readUInt32BE(0);
      const height = data.readUInt32BE(4);
      const bitDepth = data[8];
      const interlace = data[12];
      if (width !== 1 || height !== 1 || bitDepth !== 8 || interlace !== 0) return null;
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }
  if (colorType < 0 || idatChunks.length === 0) return null;
  let raw: Buffer;
  try {
    raw = inflateSync(Buffer.concat(idatChunks));
  } catch {
    return null;
  }
  // 单行单像素：所有 PNG 过滤器在没有左/上邻居时都等价于原始字节
  if (raw.length < 2 || raw[0] > 4) return null;
  switch (colorType) {
    case 6: return raw.length >= 5 ? [raw[1], raw[2], raw[3]] : null; // RGBA
    case 2: return raw.length >= 4 ? [raw[1], raw[2], raw[3]] : null; // RGB
    case 4: return raw.length >= 3 ? [raw[1], raw[1], raw[1]] : null; // 灰度 + alpha
    case 0: return raw.length >= 2 ? [raw[1], raw[1], raw[1]] : null; // 灰度
    default: return null;
  }
}
