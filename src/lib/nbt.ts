/**
 * Client-side Minecraft NBT Parser
 * Supports Gzip decompression using DecompressionStream and big-endian NBT parsing.
 */

export interface NBTTag {
  type: number;
  name: string | null;
  value: any;
}

export class NBTReader {
  private view: DataView;
  private offset: number;
  private bytes: Uint8Array;

  constructor(arrayBuffer: ArrayBuffer) {
    this.view = new DataView(arrayBuffer);
    this.bytes = new Uint8Array(arrayBuffer);
    this.offset = 0;
  }

  static async decompress(file: File): Promise<ArrayBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Gzip magic headers: 1f 8b
    if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
      try {
        const ds = new DecompressionStream("gzip");
        const writer = ds.writable.getWriter();
        writer.write(arrayBuffer);
        writer.close();
        
        const response = new Response(ds.readable);
        return await response.arrayBuffer();
      } catch (e) {
        console.error("Native DecompressionStream failed, attempting to read as raw", e);
      }
    }
    return arrayBuffer;
  }

  readByte(): number {
    const val = this.view.getUint8(this.offset);
    this.offset += 1;
    return val;
  }

  readShort(): number {
    const val = this.view.getInt16(this.offset, false); // big-endian
    this.offset += 2;
    return val;
  }

  readInt(): number {
    const val = this.view.getInt32(this.offset, false); // big-endian
    this.offset += 4;
    return val;
  }

  readLong(): bigint {
    const val = this.view.getBigInt64(this.offset, false); // big-endian
    this.offset += 8;
    return val;
  }

  readFloat(): number {
    const val = this.view.getFloat32(this.offset, false); // big-endian
    this.offset += 4;
    return val;
  }

  readDouble(): number {
    const val = this.view.getFloat64(this.offset, false); // big-endian
    this.offset += 8;
    return val;
  }

  readString(): string {
    const len = this.readShort();
    if (len <= 0) return "";
    const slice = this.bytes.slice(this.offset, this.offset + len);
    this.offset += len;
    return new TextDecoder("utf-8").decode(slice);
  }

  readTag(type: number, name: string | null): any {
    switch (type) {
      case 0: // TAG_End
        return null;
      case 1: // TAG_Byte
        return this.readByte();
      case 2: // TAG_Short
        return this.readShort();
      case 3: // TAG_Int
        return this.readInt();
      case 4: // TAG_Long
        return this.readLong();
      case 5: // TAG_Float
        return this.readFloat();
      case 6: // TAG_Double
        return this.readDouble();
      case 7: { // TAG_Byte_Array
        const len = this.readInt();
        const arr = this.bytes.slice(this.offset, this.offset + len);
        this.offset += len;
        return arr;
      }
      case 8: // TAG_String
        return this.readString();
      case 9: { // TAG_List
        const subType = this.readByte();
        const len = this.readInt();
        const list = [];
        for (let i = 0; i < len; i++) {
          list.push(this.readTag(subType, null));
        }
        return { type: subType, value: list };
      }
      case 10: { // TAG_Compound
        const compound: Record<string, any> = {};
        while (true) {
          const innerType = this.readByte();
          if (innerType === 0) break; // TAG_End
          const innerName = this.readString();
          compound[innerName] = {
            type: innerType,
            value: this.readTag(innerType, innerName)
          };
        }
        return compound;
      }
      case 11: { // TAG_Int_Array
        const len = this.readInt();
        const arr = new Int32Array(len);
        for (let i = 0; i < len; i++) {
          arr[i] = this.readInt();
        }
        return arr;
      }
      case 12: { // TAG_Long_Array
        const len = this.readInt();
        const arr = new BigInt64Array(len);
        for (let i = 0; i < len; i++) {
          arr[i] = this.readLong();
        }
        return arr;
      }
      default:
        throw new Error(`Unknown NBT Tag Type: ${type} at offset ${this.offset}`);
    }
  }

  parse(): Record<string, any> {
    const rootType = this.readByte();
    if (rootType !== 10) {
      throw new Error(`NBT file must start with TAG_Compound (10), got ${rootType}`);
    }
    const rootName = this.readString();
    return this.readTag(10, rootName);
  }
}

/**
 * Normalizes NBT compounds to extract a simple 3D grid structure.
 * Handles vanilla .nbt structures.
 */
export interface SchematicBlock {
  x: number;
  y: number;
  z: number;
  blockName: string;
}

export function parseStructureNBT(nbtData: Record<string, any>): {
  width: number;
  height: number;
  length: number;
  blocks: SchematicBlock[];
} {
  try {
    // Extract dimensions from size list tag
    const sizeTag = nbtData.size;
    if (!sizeTag || !sizeTag.value || sizeTag.value.type !== 3) {
      throw new Error("Missing or invalid 'size' list in NBT structure file.");
    }
    const [width, height, length] = sizeTag.value.value;

    // Extract block states palette
    const paletteTag = nbtData.palette;
    if (!paletteTag || !paletteTag.value || paletteTag.value.type !== 10) {
      throw new Error("Missing or invalid 'palette' in NBT structure file.");
    }
    const palette: string[] = paletteTag.value.value.map((comp: any) => {
      const name = comp.Name?.value || "minecraft:air";
      return name.replace("minecraft:", "");
    });

    // Extract blocks list
    const blocksTag = nbtData.blocks;
    if (!blocksTag || !blocksTag.value || blocksTag.value.type !== 10) {
      throw new Error("Missing or invalid 'blocks' in NBT structure file.");
    }
    
    const blocks: SchematicBlock[] = blocksTag.value.value.map((comp: any) => {
      const posTag = comp.pos?.value?.value;
      const stateIndex = comp.state?.value ?? 0;
      if (!posTag || posTag.length !== 3) return null;
      return {
        x: posTag[0],
        y: posTag[1],
        z: posTag[2],
        blockName: palette[stateIndex] || "air"
      };
    }).filter((b: any) => b !== null && b.blockName !== "air");

    return { width, height, length, blocks };
  } catch (err) {
    console.error("Error parsing structure NBT:", err);
    throw err;
  }
}
