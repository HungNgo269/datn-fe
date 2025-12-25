import { z } from "zod";

const Step1BaseSchema = z.object({
    title: z.string().min(1, "Điền tên sách"),
    slug: z.string().min(1, "Điền slug"),
});

export const Step1CreateSchema = Step1BaseSchema.extend({
    file: z.instanceof(File, {
        message: "Vui lòng chọn file sách (.epub, .pdf)",
    }),
    cover: z.instanceof(File, { message: "Vui lòng chọn ảnh bìa" }),
});

export const Step1EditSchema = Step1BaseSchema.extend({
    file: z.union([z.instanceof(File), z.string()]).optional(),
    cover: z.union([z.instanceof(File), z.string()]).optional(),
});

export const Step2Schema = z.object({
    authorIds: z.array(z.number().positive()).min(1, "Chọn/thêm tác giả"),
    categoryIds: z
        .array(z.number().positive())
        .min(1, "Phải chọn ít nhất một thể loại"),
    description: z.string().optional(),
    price: z.number().min(0),
    freeChapters: z.number().min(0),
});

export type Step1FormData = z.infer<typeof Step1EditSchema>;
export type Step2FormData = z.infer<typeof Step2Schema>;

export type BookFormState = Step1FormData &
    Step2FormData & {
        currentSourceKey?: string;
        currentCoverKey?: string;
        id?: number;
    };
