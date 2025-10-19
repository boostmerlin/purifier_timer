export type FilterLetter =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'
  | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T'
  | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

export type FilterModel = {
  letter: FilterLetter;       // 唯一标识（A-Z）
  startedAt: number;          // 未使用起始时间（ms 时间戳）
  lifespanDays: number;       // 寿命（天）
  label?: string;             // 可选名称
};
