export interface promptDto {
  type: string;
  name: string;
  message: string;
  choices: [{ name: string; value: string }];
}
