"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Product } from "@/types/product";
import { Template } from "@/types/template";
import { SendingGroup } from "@/types/sendingGroup";
import { mockProducts } from "@/data/mockData/products";

interface ProductSelectionProps {
  onSelect: (product: Product) => void;
  selectedProduct?: Product;
  template?: Template;
  sendingGroup?: SendingGroup;
}

export function ProductSelection({
  onSelect,
  selectedProduct,
  template,
  sendingGroup
}: ProductSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);

  useEffect(() => {
    filterProducts();
  }, [searchTerm]);

  const filterProducts = () => {
    if (!searchTerm) {
      setFilteredProducts(mockProducts);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = mockProducts.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(term);
      const descriptionMatch = product.description?.toLowerCase().includes(term) ?? false;
      const benefitMatch = product.benefits.some(benefit => benefit.toLowerCase().includes(term));
      const solutionMatch = product.solutions.some(solution => solution.toLowerCase().includes(term));
      
      return nameMatch || descriptionMatch || benefitMatch || solutionMatch;
    });
    setFilteredProducts(filtered);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>サービスの選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="サービス名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                    selectedProduct?.id === product.id ? 'border-primary' : ''
                  }`}
                  onClick={() => onSelect(product)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">主なメリット</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {product.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">ソリューション</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {product.solutions.map((solution, index) => (
                        <li key={index}>{solution}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium">価格帯</p>
                    <p className="text-sm text-muted-foreground">{product.price_range}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
} 