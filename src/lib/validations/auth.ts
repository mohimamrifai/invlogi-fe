import { z } from "zod";

export const createLoginSchema = (t: (key: string) => string) => {
  return z.object({
    email: z
      .string()
      .min(1, { message: t("emailRequired") })
      .email({ message: t("emailInvalid") }),
    password: z
      .string()
      .min(1, { message: t("passwordRequired") })
      .min(8, { message: t("passwordMin") }),
  });
};

export const createRegisterSchema = (t: (key: string) => string) => {
  return z
    .object({
      accountType: z.enum(["personal", "company"], {
        message: t("accountTypeRequired"),
      }),
      // Company fields (optional initially, refined later)
      companyName: z.string().optional(),
      companyEmail: z.string().email({ message: t("emailInvalid") }).optional().or(z.literal("")),
      companyPhone: z.string().optional(),
      
      // PIC fields
      picName: z.string().min(1, { message: t("fullNameRequired") }),
      picEmail: z
        .string()
        .min(1, { message: t("emailRequired") })
        .email({ message: t("emailInvalid") }),
      picPhone: z.string().min(1, { message: t("phoneRequired") }),
      password: z
        .string()
        .min(1, { message: t("passwordRequired") })
        .min(8, { message: t("passwordMin") }),
      confirmPassword: z
        .string()
        .min(1, { message: t("confirmPasswordRequired") }),
      terms: z.boolean().refine((val) => val === true, {
        message: t("termsRequired"),
      }),
    })
    .superRefine((data, ctx) => {
      // Validate company fields if account type is company
      if (data.accountType === "company") {
        if (!data.companyName || data.companyName.length < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("companyNameRequired"),
            path: ["companyName"],
          });
        }
        if (!data.companyEmail || !z.string().email().safeParse(data.companyEmail).success) {
           ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("emailInvalid"),
            path: ["companyEmail"],
          });
        }
        if (!data.companyPhone || data.companyPhone.length < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("phoneRequired"),
            path: ["companyPhone"],
          });
        }
      }

      // Validate password match
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("passwordMismatch"),
          path: ["confirmPassword"],
        });
      }
    });
};

export type LoginSchema = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterSchema = z.infer<ReturnType<typeof createRegisterSchema>>;
