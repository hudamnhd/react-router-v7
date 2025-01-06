import localforage from "localforage";

const app_store = localforage.createInstance({
  name: "epic-app",
});

export const construct_key = (request: Request) => {
  const url = new URL(request.url);
  return url.pathname + url.search + url.hash;
};
// Fungsi untuk menyimpan data ke cache dengan waktu kedaluwarsa (default 3 menit)
export const set_cache = async (
  key: string,
  value: any,
  ttl: number = 31560000,
) => {
  try {
    const expiresAt = Date.now() + ttl;
    const cacheData = { value, expiresAt };
    await app_store.setItem(key, cacheData);
  } catch (error) {
    console.error("Failed to set cache:", error);
  }
};

// Fungsi untuk mengambil data dari cache dan memvalidasi waktu kedaluwarsa
export const get_cache = async (key: string) => {
  try {
    const cacheData: { value: any; expiresAt: number } | null =
      await app_store.getItem(key);
    if (cacheData) {
      const { value, expiresAt } = cacheData;
      if (Date.now() < expiresAt) {
        return value;
      } else {
        // Hapus cache jika sudah kedaluwarsa
        await delete_cache(key);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to get cache:", error);
    return null;
  }
};

// Fungsi untuk menghapus data dari cache
export const delete_cache = async (key: string) => {
  try {
    await app_store.removeItem(key);
  } catch (error) {
    console.error("Failed to delete cache:", error);
  }
};

export const delete_multiple_caches = async (keys: string[]) => {
  try {
    const deletePromises = keys.map((key) => app_store.removeItem(key));
    await Promise.all(deletePromises);
    console.log("Selected caches deleted successfully.");
  } catch (error) {
    console.error("Failed to delete multiple caches:", error);
  }
};

// Fungsi untuk menghapus semua data dari cache
export const delete_all_cache = async () => {
  try {
    await app_store.clear();
  } catch (error) {
    console.error("Failed to delete all cache:", error);
  }
};

// Fungsi untuk menghapus cache berdasarkan kategori (prefix tertentu)
export const delete_cache_by_category = async (categoryPrefix: string) => {
  try {
    await app_store.iterate((value, key) => {
      if (key.startsWith(categoryPrefix)) {
        app_store.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Failed to delete cache by category:", error);
  }
};

// Fungsi untuk mengubah data di cache (mutasi)
export const mutateCache = async (
  key: string,
  mutator: (value: any) => any,
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const currentValue = await get_cache(key);

    // Jika data tidak ada di cache, kembalikan status gagal
    if (!currentValue) {
      return { success: false, error: "Data not found in cache" };
    }

    // Gunakan mutator untuk memperbarui data
    const newValue = mutator(currentValue);

    // Simpan nilai baru ke cache
    await set_cache(key, newValue);

    // Kembalikan status berhasil
    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to mutate cache:", error);
    return { success: false, error: "Failed to mutate cache" };
  }
};

// Fungsi untuk mencari data dari cache berdasarkan kondisi
export const findInCache = async (
  predicate: (value: any, key: string) => boolean,
) => {
  try {
    const keys = await app_store.keys();
    for (const key of keys) {
      const value = await get_cache(key);
      if (predicate(value, key)) {
        return { key, value };
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to find in cache:", error);
    return null;
  }
};
