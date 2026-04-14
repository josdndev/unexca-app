import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { ShieldCheck, Mail, Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // DEMO MODE: Allow any credentials
    // In a real app, we would use Firebase Auth properly
    try {
      // For the demo, we just simulate a successful login
      // If the user wants real auth, they can use the actual Firebase Auth
      // but for "any credential is accessible", we just navigate
      toast.success('Acceso concedido (Modo Demo)');
      
      // We'll try to sign in with a default account if it exists, 
      // otherwise we just mock the redirection for the demo
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (e) {
        console.log("Mocking login for demo...");
      }
      
      navigate('/');
    } catch (error: any) {
      toast.error('Error en el acceso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="absolute top-8 left-8">
        <Link to="/">
          <Button variant="ghost" className="text-slate-500 hover:text-blue-700 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-blue-700 text-white flex items-center justify-center mb-4 shadow-xl shadow-blue-700/20">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">UNEXCA Central</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Panel de Profesores</p>
        </div>

        <Card className="border-slate-200 bg-white shadow-2xl shadow-blue-900/5">
          <CardHeader>
            <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para gestionar tus aulas (Modo Demo activo)
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="profesor@unexca.edu.ve"
                    className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold h-11" disabled={loading}>
                {loading ? 'Accediendo...' : 'Entrar al Panel'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <p className="text-center text-slate-400 text-xs mt-8">
          Sistema de Gestión de Aulas UNEXCA &copy; {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
