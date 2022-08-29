export default interface Json {
  description?: string | null | undefined;
  vin: string | null | undefined;
  price: string | null | undefined;
  odometer: string | null | undefined;
  stock_number: string | null | undefined;
  interior_color: string | null | undefined;
  exterior_color: string | null | undefined;
  transmission: string | null | undefined;
  passenger?: string | null | undefined;
  bodyStyle?: string | null | undefined;
  trim?: string | null | undefined;
  engine?: string | null | undefined;
  cylinder?: string | null | undefined;
  fuel?: string | null | undefined;
  drivetrain?: string | null | undefined;
  imgs: (string | null)[];
}
