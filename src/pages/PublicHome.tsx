import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Classroom, Announcement, Assignment } from '../types';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Search, 
  LogIn, 
  Building2, 
  Users, 
  Clock, 
  BookOpen,
  ChevronRight,
  Info,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

export default function PublicHome() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);

  useEffect(() => {
    const unsubClassrooms = onSnapshot(collection(db, 'classrooms'), (snapshot) => {
      setClassrooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Classroom)));
    });
    const unsubAnnouncements = onSnapshot(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
    });
    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)));
    });
    return () => {
      unsubClassrooms();
      unsubAnnouncements();
      unsubAssignments();
    };
  }, []);

  const careers = Array.from(new Set(announcements.map(a => a.category).filter(Boolean)));
  
  const filteredOffers = announcements.filter(a => a.type === 'oferta' && (!selectedCareer || a.category === selectedCareer));
  const filteredAnnouncements = announcements.filter(a => a.type === 'anuncio' && (!selectedCareer || a.category === selectedCareer));

  const getRoomAssignment = (roomId: string) => {
    return assignments.find(a => a.classroomId === roomId);
  };

  const isMatch = (room: Classroom) => {
    if (!searchQuery) return false;
    const assignment = getRoomAssignment(room.id);
    const q = searchQuery.toLowerCase();
    return (
      room.name.toLowerCase().includes(q) ||
      (assignment?.professorName?.toLowerCase().includes(q)) ||
      (assignment?.subject?.toLowerCase().includes(q))
    );
  };

  const floors = [7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Carreras y Oferta */}
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 font-black text-blue-700 mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-700/20">U</div>
            <span className="text-2xl tracking-tighter">UNEXCA</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Buscar profesor o código..." 
              className="pl-10 border-slate-200 bg-slate-50 focus:bg-white transition-all rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-8">
            {/* Carreras Selector */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Filtrar por Carrera</h3>
              <div className="flex flex-wrap gap-2 px-2">
                <Link to="/">
                  <Badge 
                    variant={!selectedCareer ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1 rounded-full"
                  >
                    Todas
                  </Badge>
                </Link>
                {['General', 'Informatica', 'Administracion', 'Contaduria', 'Turismo'].map(career => (
                  <Link key={career} to={`/category/${career}`}>
                    <Badge 
                      variant={selectedCareer === career ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer px-3 py-1 rounded-full transition-all",
                        selectedCareer === career ? "bg-blue-700" : "hover:bg-blue-50"
                      )}
                    >
                      {career}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {/* Oferta Académica */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 px-2 flex items-center gap-2">
                <BookOpen className="h-3 w-3" /> Oferta Académica
              </h3>
              <div className="space-y-3">
                {filteredOffers.map(offer => (
                  <Card key={offer.id} className="border-blue-100 bg-blue-50/30 shadow-none hover:bg-blue-50 transition-colors">
                    <CardContent className="p-3">
                      <p className="text-xs font-bold text-blue-900 mb-1">{offer.title}</p>
                      <p className="text-[10px] text-blue-700/70 leading-relaxed">{offer.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Anuncios por Categoría */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">Anuncios por Categoría</h3>
              {['General', 'Informatica', 'Administracion', 'Contaduria', 'Turismo'].map(cat => {
                const catAnnouncements = announcements.filter(a => a.type === 'anuncio' && (cat === 'General' ? !a.category || a.category === 'General' : a.category === cat));
                if (catAnnouncements.length === 0) return null;
                return (
                  <div key={cat} className="space-y-2">
                    <h4 className="text-[10px] font-bold text-blue-600 px-2">{cat}</h4>
                    <div className="space-y-2">
                      {catAnnouncements.map(ann => (
                        <Card key={ann.id} className="border-slate-100 shadow-none bg-slate-50/50">
                          <CardContent className="p-3">
                            <p className="text-xs font-bold text-slate-900 mb-1">{ann.title}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{ann.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-100">
          <Link to="/login">
            <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold gap-2 shadow-lg shadow-blue-700/20 rounded-full">
              <LogIn className="h-4 w-4" />
              Acceso Profesores
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main - Building Simulation */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Building2 className="h-5 w-5 text-blue-700" />
            <h2 className="font-bold text-slate-900">Edificio Central UNEXCA</h2>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-700" />
              <span className="text-slate-500">En Clase</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-200" />
              <span className="text-slate-500">Vacío</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-600">Coincidencia</span>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 p-8 bg-slate-100/50">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <TooltipProvider delay={0}>
                {floors.map(floor => {
                  const floorRooms = Array.from({ length: 16 }).map((_, i) => {
                    const roomName = `Aula ${floor}${ (i + 1).toString().padStart(2, '0') }`;
                    return classrooms.find(c => c.name === roomName);
                  });
                  
                  const occupiedCount = floorRooms.filter(r => r?.status === 'occupied').length;
                  const hasMatch = floorRooms.some(r => r && isMatch(r));

                  return (
                    <div key={floor}>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className={cn(
                              "relative group bg-white p-6 rounded-2xl border-2 transition-all text-left shadow-sm w-full cursor-pointer",
                              hasMatch 
                                ? "border-emerald-500 ring-4 ring-emerald-500/10" 
                                : "border-slate-100 hover:border-blue-200 hover:shadow-xl"
                            )}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                                hasMatch ? "bg-emerald-100 text-emerald-600" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                              )}>
                                <Layers className="h-6 w-6" />
                              </div>
                              <Badge variant="outline" className="rounded-full text-[10px] font-black">
                                PISO {floor}
                              </Badge>
                            </div>
                            
                            <h3 className="text-lg font-black text-slate-900 mb-1">Nivel {floor}</h3>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                              <span className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-blue-600" />
                                {occupiedCount} Ocupadas
                              </span>
                              <span className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-slate-200" />
                                {16 - occupiedCount} Libres
                              </span>
                            </div>

                            {hasMatch && (
                              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-bounce shadow-lg">
                                COINCIDENCIA
                              </div>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[340px] p-4 bg-white border-2 border-slate-100 shadow-2xl rounded-2xl">
                          <div className="mb-4 flex justify-between items-center">
                            <h4 className="font-black text-slate-900">Aulas del Piso {floor}</h4>
                            <span className="text-[10px] font-bold text-slate-400">3 FILAS • 16 SALONES</span>
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {floorRooms.map((room, i) => {
                              const roomName = `Aula ${floor}${ (i + 1).toString().padStart(2, '0') }`;
                              const assignment = room ? getRoomAssignment(room.id) : null;
                              const matched = room ? isMatch(room) : false;

                              return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                    key={`${floor}-${i}`}
                                    className={cn(
                                      "p-2 rounded-lg border-2 text-[9px] leading-tight transition-all cursor-help",
                                      matched 
                                        ? "bg-emerald-100 border-emerald-500 text-emerald-900" 
                                        : room?.status === 'occupied'
                                          ? "bg-blue-50 border-blue-200 text-blue-900"
                                          : "bg-slate-50 border-slate-100 text-slate-500"
                                    )}
                                  >
                                    <p className="font-black mb-1">{roomName}</p>
                                    {assignment ? (
                                      <div className="space-y-0.5">
                                        <p className="font-bold truncate">{assignment.subject}</p>
                                        <p className="truncate">{assignment.professorName}</p>
                                        <p className="font-mono">{assignment.startTime}-{assignment.endTime}</p>
                                      </div>
                                    ) : (
                                      <p className="text-slate-400 italic">Libre</p>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="p-4 w-64 shadow-2xl bg-white border border-slate-100">
                                  {assignment ? (
                                    <div className="space-y-3">
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clase Actual</p>
                                        <p className="text-sm font-bold text-slate-900">{assignment.subject}</p>
                                        <p className="text-xs text-slate-600 flex items-center gap-1">
                                          <Users className="h-3 w-3" /> {assignment.professorName}
                                        </p>
                                        <p className="text-xs text-slate-600 flex items-center gap-1">
                                          <Clock className="h-3 w-3" /> {assignment.startTime} - {assignment.endTime}
                                        </p>
                                      </div>
                                      {assignment.nextClass && (
                                        <div className="pt-2 border-t border-slate-100 space-y-1">
                                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Siguiente Clase</p>
                                          <p className="text-xs font-bold text-slate-700">{assignment.nextClass.subject}</p>
                                          <p className="text-[10px] text-slate-500">{assignment.nextClass.time}</p>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-400">Sin clases programadas.</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  );
                })}
              </TooltipProvider>
            </div>
            
            <div className="pt-12 text-center space-y-2">
              <div className="h-1 w-32 bg-slate-200 mx-auto rounded-full" />
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Entrada Principal Edificio Central</p>
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
