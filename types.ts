
export interface Product {
  id: string;
  name: string;
  categoryId: string;
  subCategoryId: string;
  description: string;
  price?: number;
  priceLabel?: string;
  tag: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
