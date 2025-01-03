import { LRUCache } from "lru-cache";

class Cache {
  private cache: LRUCache<string, any>;

  constructor() {
    this.cache = new LRUCache({
      max: 100, // Jumlah maksimal item yang bisa disimpan di cache
      ttl: 31560000, // TTL default dalam milidetik (60 detik)
    });
  }

  // Set cache dengan TTL opsional (dalam milidetik)
  set(key: string, data: any, ttl?: number) {
    this.cache.set(key, data, { ttl });
  }

  // Ambil cache berdasarkan key
  get(key: string): any | null {
    return this.cache.get(key) ?? null;
  }

  // Hapus cache berdasarkan key
  delete(key: string) {
    this.cache.delete(key);
  }

  // Bersihkan seluruh cache
  clear() {
    this.cache.clear();
  }

  // Fungsi ini akan mengonversi Map menjadi objek biasa untuk memudahkan serialisasi ke JSON
  getAll(): Record<string, any> {
    const allItems: Record<string, any> = {};
    this.cache.forEach((value, key) => {
      allItems[key] = value;
    });
    return allItems;
  }
}

// Singleton Cache instance
const cacheInstance = new Cache();

export default cacheInstance;

// import { PrismaClient } from "@prisma/client";
//
// class Cache {
// 	private prisma: PrismaClient;
//
// 	constructor() {
// 		this.prisma = new PrismaClient();
// 	}
//
// 	private isEmptyData(data: any): boolean {
// 		if (data === null || data === undefined) return true;
// 		if (Array.isArray(data) && data.length === 0) return true;
// 		if (typeof data === "object" && Object.keys(data).length === 0) return true;
// 		return false;
// 	}
//
// 	// Set cache dengan TTL (dalam milidetik)
// 	// async set(key: string, data: any, ttl: new Date(Date.now() + ttl)) {
// 	async set(key: string, data: any, ttl: number = 60000) {
// 		// Validasi data sebelum set
// 		if (this.isEmptyData(data)) {
// 			console.log(`Data tidak valid, tidak akan disimpan untuk key: ${key}`);
// 			return;
// 		}
//
// 		const expiry = new Date(Date.now() + ttl); // ini ttl
// 		const value = JSON.stringify(data);
//
// 		await this.prisma.cache.upsert({
// 			where: { key },
// 			update: { value, ttl: expiry },
// 			create: { key, value, ttl: expiry },
// 		});
// 	}
//
// 	// Ambil cache berdasarkan key
// 	async get(key: string): Promise<any | null> {
// 		const cache = await this.prisma.cache.findUnique({ where: { key } });
//
// 		if (cache && new Date() < cache.ttl) {
// 			return JSON.parse(cache.value);
// 		}
//
// 		// Hapus cache jika sudah expired
// 		if (cache) {
// 			await this.delete(key);
// 		}
//
// 		return null;
// 	}
//
// 	// Hapus cache berdasarkan key
// 	async delete(key: string) {
// 		await this.prisma.cache.delete({ where: { key } }).catch(() => {});
// 	}
//
// 	// Bersihkan seluruh cache
// 	async clear() {
// 		await this.prisma.cache.deleteMany({});
// 	}
//
// 	// Ambil semua cache
// 	async getAll(): Promise<{ key: string; value: any }[]> {
// 		const allCache = await this.prisma.cache.findMany();
// 		return allCache.map((cache) => ({
// 			key: cache.key,
// 			value: JSON.parse(cache.value),
// 		}));
// 	}
// }
//
// // Singleton Cache instance
// const cacheInstance = new Cache();
//
// export default cacheInstance;
// class Cache {
// 	private cache: Map<string, any>;
// 	private ttlMap: Map<string, NodeJS.Timeout>;
//
// 	constructor() {
// 		this.cache = new Map();
// 		this.ttlMap = new Map();
// 	}
//
// 	// Set cache dengan TTL (dalam milidetik)
// 	set(key: string, data: any, ttl: number = 60000) {
// 		this.cache.set(key, data);
//
// 		// Jika ada TTL, set timeout untuk menghapus cache
// 		if (ttl > 0) {
// 			if (this.ttlMap.has(key)) {
// 				clearTimeout(this.ttlMap.get(key)!);
// 			}
// 			const timeout = setTimeout(() => {
// 				this.delete(key);
// 			}, ttl);
// 			this.ttlMap.set(key, timeout);
// 		}
// 	}
//
// 	// Ambil cache berdasarkan key
// 	get(key: string): any | null {
// 		return this.cache.has(key) ? this.cache.get(key) : null;
// 	}
//
// 	// Hapus cache berdasarkan key
// 	delete(key: string) {
// 		this.cache.delete(key);
// 		if (this.ttlMap.has(key)) {
// 			clearTimeout(this.ttlMap.get(key)!);
// 			this.ttlMap.delete(key);
// 		}
// 	}
//
// 	// Bersihkan seluruh cache
// 	clear() {
// 		this.cache.clear();
// 		this.ttlMap.forEach((timeout) => clearTimeout(timeout));
// 		this.ttlMap.clear();
// 	}
//
// 	// Tambahkan metode untuk melihat semua cache
// 	getAll(): Map<string, any> {
// 		return this.cache;
// 	}
// }
//
// // Singleton Cache instance
// const cacheInstance = new Cache();
//
// export default cacheInstance;
