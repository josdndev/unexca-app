import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { MarketplaceItem, UserProfile } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ShoppingBag, Plus, Search, Tag, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface MarketplaceProps {
  user: UserProfile;
}

export default function Marketplace({ user }: MarketplaceProps) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New item form
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Libros');

  useEffect(() => {
    const q = query(collection(db, 'marketplace'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketplaceItem)));
    });
    return () => unsubscribe();
  }, []);

  const handleAddItem = async () => {
    if (!newTitle || !newPrice) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    try {
      await addDoc(collection(db, 'marketplace'), {
        title: newTitle,
        price: parseFloat(newPrice),
        description: newDesc,
        category: newCategory,
        sellerId: user.uid,
        imageUrl: `https://picsum.photos/seed/${newTitle}/400/300`,
        createdAt: new Date().toISOString()
      });
      toast.success('Producto publicado exitosamente');
      setIsDialogOpen(false);
      setNewTitle('');
      setNewPrice('');
      setNewDesc('');
    } catch (error) {
      toast.error('Error al publicar el producto');
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input 
            placeholder="Buscar libros, guías, dispositivos..." 
            className="pl-10 bg-zinc-900 border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold gap-2">
              <Plus className="h-4 w-4" />
              Vender algo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <DialogHeader>
              <DialogTitle>Publicar en el Marketplace</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título del producto</Label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="bg-zinc-950 border-zinc-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Precio ($)</Label>
                  <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="bg-zinc-950 border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="bg-zinc-950 border-zinc-800" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="bg-zinc-950 border-zinc-800" />
              </div>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold" onClick={handleAddItem}>
                Publicar Ahora
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
          >
            <Card className="overflow-hidden border-zinc-800 bg-zinc-900/50 group">
              <div className="aspect-video overflow-hidden relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-zinc-950/80 backdrop-blur-md border-zinc-700 text-orange-500">
                    ${item.price}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                  <Tag className="h-3 w-3" />
                  {item.category}
                </div>
                <CardTitle className="text-base line-clamp-1">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-zinc-400 line-clamp-2 min-h-[2rem]">
                  {item.description || 'Sin descripción disponible.'}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 border-t border-zinc-800/50 mt-2">
                <Button variant="ghost" className="w-full text-xs text-orange-500 hover:bg-orange-500/10 hover:text-orange-400">
                  Contactar Vendedor
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
          <p>No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}
