import { ZodSchema, z } from "zod";

export const validateForm = async <T>(
	request: Request,
	schema: ZodSchema<T>,
): Promise<z.SafeParseReturnType<T, T>> => {
	const formData = await request.formData();

	// Parsing formData menjadi payload
	const payload = Array.from(formData.keys()).reduce(
		(acc, key) => {
			const values = formData.getAll(key);

			if (values.length === 0) {
				acc[key] = null;
			} else {
				acc[key] = values.length > 1 ? values : values[0]; // Simpan array jika banyak, atau satu nilai
			}

			return acc;
		},
		{} as Record<string, any>,
	);

	return schema.safeParse(payload);
};

export const validateQuery = async <T>(
	request: Request,
	schema: ZodSchema<T>,
): Promise<z.SafeParseReturnType<T, T>> => {
	let { searchParams } = new URL(request.url);

	// Parsing searchParams menjadi payload
	const payload = Array.from(searchParams.keys()).reduce(
		(acc, key) => {
			const values = searchParams.getAll(key);

			if (values.length === 0) {
				acc[key] = null;
			} else {
				acc[key] = values.length > 1 ? values : values[0]; // Simpan array jika banyak, atau satu nilai
			}

			return acc;
		},
		{} as Record<string, any>,
	);

	return schema.safeParse(payload);
};
