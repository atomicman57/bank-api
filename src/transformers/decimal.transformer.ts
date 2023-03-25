export class DecimalTransformer {
  to(data: number): string {
    return data?.toFixed(2)
  }

  from(data: string): number {
    return parseFloat(data)
  }
}
