import type z from 'zod'

export interface ZSchemaInterface<
  T extends z.ZodRawShape,
  TObject = z.ZodObject<T>,
> {
  new (data: z.infer<z.ZodObject<T>>): z.infer<z.ZodObject<T>>

  schema: TObject

  parse: <TFinal extends new (data: z.infer<z.ZodObject<T>>) => InstanceType<TFinal>>(
    this: TFinal,
    value: z.infer<z.ZodObject<T>>
  ) => InstanceType<TFinal>
}

export function ZClass<
  T extends z.ZodRawShape,
  Type = ZSchemaInterface<T> & z.infer<z.ZodObject<T>>,
>(
  schema: z.ZodObject<T>,
): Type {
  const res = class {
    static schema = schema
    constructor(value: z.infer<z.ZodObject<T>>) {
      Object.assign(this, schema.parse(value))
    }

    static parse<T extends typeof res>(this: T, value: unknown): any {
      const parsed = new this(schema.parse(value)) as any
      return parsed
    }
  }
  return res as typeof res & any
}

export function useZodError<T extends z.ZodSchema>(schema: T, state: Ref<z.infer<T>>) {
    type Form = z.infer<typeof schema>

    const result = computed(() => schema.safeParse(state.value))
    const errors = computed(() => {
      if (result.value.success) {
        return []
      }
      return (result.value.error as z.ZodError<Form>).issues ?? []
    })

    return errors
}

export function readErrors(path: string, errors: z.ZodIssue[]): z.ZodIssue[] {
  return errors?.filter(e => e.path.includes(path)) ?? []
}
