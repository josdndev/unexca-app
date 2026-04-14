import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Invitation } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  UserPlus, 
  Link as LinkIcon, 
  Copy, 
  Trash2, 
  Mail,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function Admin() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'professor' | 'student'>('student');

  useEffect(() => {
    const q = query(collection(db, 'invitations'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvitations(snapshot.docs.map(doc => ({ ...doc.data() } as Invitation)));
    });
    return () => unsubscribe();
  }, []);

  const generateInvitation = async () => {
    if (!email) {
      toast.error('El correo es obligatorio');
      return;
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    try {
      await addDoc(collection(db, 'invitations'), {
        token,
        email,
        phone,
        role,
        used: false,
        expiresAt: expiresAt.toISOString(),
        createdAt: serverTimestamp()
      });
      toast.success('Invitación generada correctamente');
      setEmail('');
      setPhone('');
    } catch (error) {
      toast.error('Error al generar la invitación');
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/login?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Enlace copiado al portapapeles');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Generator Form */}
        <Card className="lg:col-span-1 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-orange-500" />
              Nueva Invitación
            </CardTitle>
            <CardDescription>Genera un link único de registro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Correo Institucional</Label>
              <Input 
                type="email" 
                placeholder="usuario@unexca.edu.ve" 
                className="bg-zinc-950 border-zinc-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono (SMS Validación)</Label>
              <Input 
                placeholder="+58 412..." 
                className="bg-zinc-950 border-zinc-800"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Rol asignado</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="professor">Profesor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold" onClick={generateInvitation}>
              Generar Link Único
            </Button>
          </CardContent>
        </Card>

        {/* Active Invitations List */}
        <Card className="lg:col-span-2 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Invitaciones Activas</CardTitle>
            <CardDescription>Links pendientes de registro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((inv) => (
                <div key={inv.token} className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800 group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center text-orange-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{inv.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] uppercase border-zinc-700 text-zinc-400">
                          {inv.role}
                        </Badge>
                        {inv.phone && (
                          <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <Smartphone className="h-3 w-3" />
                            {inv.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-orange-500" onClick={() => copyLink(inv.token)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {invitations.length === 0 && (
                <div className="text-center py-12 text-zinc-500">
                  <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  <p>No hay invitaciones activas</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
