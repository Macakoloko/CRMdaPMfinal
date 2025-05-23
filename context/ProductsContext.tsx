"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSupabase } from './SupabaseContext';

interface Product {
  id: string;
  nome: string;
  descricao?: string;
  preco: string;
  custo: string;
  estoque: string;
  estoqueMinimo: string;
  categoria: string;
  fornecedor?: string;
  codigoBarras?: string;
  dataAtualizacao: Date;
  vendas: number;
}

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (options?: { category?: string; lowStock?: boolean }) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'dataAtualizacao' | 'vendas'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateStock: (id: string, quantity: number) => Promise<Product>;
  getProductById: (id: string) => Promise<Product | null>;
  lowStockProducts: Product[];
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();

  // Fetch all products on initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products with optional filters
  async function fetchProducts(options?: { category?: string; lowStock?: boolean }) {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options?.category) {
        params.append('category', options.category);
      }
      if (options?.lowStock) {
        params.append('lowStock', 'true');
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 500 && data.error && data.error.includes("relation") && data.error.includes("does not exist")) {
          // This is a specific error for when the products table doesn't exist yet
          // We'll handle it gracefully
          console.log("Products table doesn't exist yet. It will be created when you add your first product.");
          setProducts([]);
          setLowStockProducts([]);
          return [];
        }
        throw new Error(data.error || 'Erro ao buscar produtos');
      }

      // Format dates
      const formattedProducts = data.map((product: any) => ({
        ...product,
        dataAtualizacao: new Date(product.dataAtualizacao)
      }));

      setProducts(formattedProducts);
      
      // Update low stock products
      const lowStock = formattedProducts.filter(
        (product: Product) => parseInt(product.estoque) < parseInt(product.estoqueMinimo)
      );
      setLowStockProducts(lowStock);
      
      return formattedProducts;
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos');
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  // Add a new product
  async function addProduct(product: Omit<Product, 'id' | 'dataAtualizacao' | 'vendas'>) {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao adicionar produto');
      }

      // Format date
      const newProduct = {
        ...data,
        dataAtualizacao: new Date(data.dataAtualizacao)
      };

      setProducts((prev) => [...prev, newProduct]);
      
      // Update low stock products if needed
      if (parseInt(newProduct.estoque) < parseInt(newProduct.estoqueMinimo)) {
        setLowStockProducts((prev) => [...prev, newProduct]);
      }

      toast.success('Produto adicionado com sucesso!');
      return newProduct;
    } catch (error: any) {
      setError(error.message);
      console.error('Error adding product:', error);
      toast.error('Erro ao adicionar produto');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // Update an existing product
  async function updateProduct(id: string, product: Partial<Product>) {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar produto');
      }

      // Format date
      const updatedProduct = {
        ...data,
        dataAtualizacao: new Date(data.dataAtualizacao)
      };

      // Update products list
      setProducts((prev) => 
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );
      
      // Update low stock products
      const updatedLowStock = products.filter(
        (product) => parseInt(product.estoque) < parseInt(product.estoqueMinimo)
      );
      setLowStockProducts(updatedLowStock);

      toast.success('Produto atualizado com sucesso!');
      return updatedProduct;
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating product:', error);
      toast.error('Erro ao atualizar produto');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // Delete a product
  async function deleteProduct(id: string) {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir produto');
      }

      // Remove from products list
      setProducts((prev) => prev.filter((p) => p.id !== id));
      
      // Remove from low stock products if present
      setLowStockProducts((prev) => prev.filter((p) => p.id !== id));

      toast.success('Produto excluído com sucesso!');
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  // Update product stock
  async function updateStock(id: string, quantity: number) {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/products/stock', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar estoque');
      }

      // Format date
      const updatedProduct = {
        ...data,
        dataAtualizacao: new Date(data.dataAtualizacao)
      };

      // Update products list
      setProducts((prev) => 
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );
      
      // Update low stock products
      const updatedLowStock = products.map(p => 
        p.id === id ? updatedProduct : p
      ).filter(
        (product) => parseInt(product.estoque) < parseInt(product.estoqueMinimo)
      );
      setLowStockProducts(updatedLowStock);

      toast.success('Estoque atualizado com sucesso!');
      return updatedProduct;
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating stock:', error);
      toast.error('Erro ao atualizar estoque');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // Get a product by ID
  async function getProductById(id: string) {
    try {
      setIsLoading(true);
      setError(null);

      // First check if we already have it in state
      const existingProduct = products.find(p => p.id === id);
      if (existingProduct) {
        return existingProduct;
      }

      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar produto');
      }

      // Format date
      const product = {
        ...data,
        dataAtualizacao: new Date(data.dataAtualizacao)
      };

      return product;
    } catch (error: any) {
      setError(error.message);
      console.error('Error getting product:', error);
      toast.error('Erro ao buscar produto');
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        error,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        getProductById,
        lowStockProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
} 