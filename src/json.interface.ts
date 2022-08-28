export default interface Json {
  vin: string;
  price: string;
  odometer: string;
  stock_number: string;
  interior_color:  (string | null | undefined);
  exterior_color: (string | null | undefined);
  transmission: string;
  passenger: string;
  drivetrain: string;
  imgs: (string | null)[];
}
