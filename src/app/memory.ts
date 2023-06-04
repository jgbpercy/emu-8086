export const total8086MemorySizeInBytes = 2 ** 20;
const chunkSizePower = 14; // TODO this size is just cheating temporarily to make the chunk size what we need for the CE image example
const chunkSizeInBytes = 2 ** chunkSizePower;
const chunkMask = (total8086MemorySizeInBytes / chunkSizeInBytes - 1) << chunkSizePower;
const addressInChunkMask = 2 ** chunkSizePower - 1;

export interface ReadonlyMemory {
  readByte(address: number): number;
  readWord(address: number): number;
}

export class Memory implements ReadonlyMemory {
  private readonly chunks = new Map<number, Uint8Array>();

  readByte(address: number): number {
    const chunk = this.chunks.get(Memory.getChunk(address));

    if (chunk === undefined) {
      return 0;
    }

    return chunk[address & addressInChunkMask];
  }

  readWord(address: number): number {
    let leastSignificantByte: number;
    let mostSignificantByte: number;

    if ((address & addressInChunkMask) === addressInChunkMask) {
      leastSignificantByte = this.readByte(address);
      mostSignificantByte = this.readByte(address + 1);
    } else {
      const chunk = this.chunks.get(Memory.getChunk(address));

      if (chunk === undefined) {
        return 0;
      }

      const addressInChunk = address & addressInChunkMask;

      leastSignificantByte = chunk[addressInChunk];
      mostSignificantByte = chunk[addressInChunk + 1];
    }

    return leastSignificantByte + (mostSignificantByte << 8);
  }

  writeByte(address: number, value: number): void {
    if (value >= 2 ** 8 || value < 0) {
      throw Error(`Memory Write Error - ${value} is out of range`);
    }

    const chunkNumber = Memory.getChunk(address);

    let chunk = this.chunks.get(chunkNumber);

    if (chunk === undefined) {
      chunk = new Uint8Array(chunkSizeInBytes).fill(0);
      this.chunks.set(chunkNumber, chunk);
    }

    chunk[address & addressInChunkMask] = value;
  }

  getRawChunkForAddress(address: number): Uint8Array | undefined {
    return this.chunks.get(Memory.getChunk(address));
  }

  private static getChunk(address: number): number {
    if (address >= total8086MemorySizeInBytes || address < 0) {
      throw Error(`Memory Access Error - ${address} is out of range`);
    }

    return address & chunkMask;
  }
}
