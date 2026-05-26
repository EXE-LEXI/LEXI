export class CategoryResponseDto {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
