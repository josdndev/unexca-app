import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Layers,
  Info,
  MessageSquare,
  Heart,
  Share2
} from 'lucide-react';
import { motion } from 'motion/react';
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

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [view, setView] = useState<'classrooms' | 'announcements'>('announcements');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Mock data for development
    const mockClassrooms: Classroom[] = Array.from({ length: 112 }).map((_, i) => ({
      id: `room-${i}`,
      name: `Aula ${Math.floor(i / 16) + 1}${(i % 16 + 1).toString().padStart(2, '0')}`,
      floor: Math.floor(i / 16) + 1,
      capacity: 30,
      features: ['proyector', 'aire'],
      status: Math.random() > 0.7 ? 'occupied' : 'available'
    }));
    const mockAssignments: Assignment[] = mockClassrooms
      .filter(r => r.status === 'occupied')
      .map(r => ({
        id: `assign-${r.id}`,
        classroomId: r.id,
        professorId: 'prof-1',
        professorName: 'Prof. Juan Pérez',
        subject: 'Informática Básica',
        studentCount: 25,
        startTime: '08:00',
        endTime: '10:00',
        date: '2026-04-13'
      }));
    const mockAnnouncements: Announcement[] = [
      { id: '1', title: 'Inicio de clases', content: 'Bienvenidos al nuevo semestre.', authorId: 'admin', createdAt: new Date().toISOString(), priority: 'high', category: 'General', type: 'anuncio' },
      { id: '2', title: 'Taller de React', content: 'Taller práctico de React este viernes.', authorId: 'admin', createdAt: new Date().toISOString(), priority: 'medium', category: 'Informatica', type: 'anuncio' }
    ];

    setClassrooms(mockClassrooms);
    setAssignments(mockAssignments);
    setAnnouncements(mockAnnouncements);
  }, []);

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
  const catAnnouncements = announcements.filter(a => a.type === 'anuncio' && (category === 'General' ? !a.category || a.category === 'General' : a.category === category));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 font-black text-blue-700 mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-700/20">U</div>
            <span className="text-2xl tracking-tighter">UNEXCA</span>
          </Link>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Buscar..." 
              className="pl-10 border-slate-200 bg-slate-50 focus:bg-white transition-all rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            <Button variant={view === 'classrooms' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setView('classrooms')}>
              <Building2 className="mr-2 h-4 w-4" /> Aulas
            </Button>
            <Button variant={view === 'announcements' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setView('announcements')}>
              <MessageSquare className="mr-2 h-4 w-4" /> Anuncios
            </Button>
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-auto border-b border-slate-200 bg-white px-8 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-lg">{view === 'classrooms' ? 'Aulas' : `Anuncios - ${category}`}</h2>
            {view === 'classrooms' && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-10 border-slate-200 bg-slate-50 focus:bg-white transition-all rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['General', 'Informatica', 'Administracion', 'Contaduria', 'Turismo'].map(cat => (
              <Link key={cat} to={`/category/${cat}`}>
                <Button variant={category === cat ? 'default' : 'outline'} size="sm" className="rounded-full text-xs">
                  {cat}
                </Button>
              </Link>
            ))}
          </div>
        </header>

        <ScrollArea className="flex-1 p-8 bg-slate-100/50">
          {view === 'classrooms' ? (
            <div className="max-w-2xl mx-auto space-y-4">
              <TooltipProvider delay={0}>
                {floors.map(floor => (
                  <div key={floor}>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full bg-white p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all text-left flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                              <Layers className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-slate-900">Nivel {floor}</h3>
                              <p className="text-xs font-bold text-slate-500">16 Aulas totales</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="rounded-full">PISO {floor}</Badge>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[340px] p-4 bg-white border-2 border-slate-100 shadow-2xl rounded-2xl">
                        <div className="grid grid-cols-5 gap-2">
                          {Array.from({ length: 16 }).map((_, i) => {
                            const roomName = `Aula ${floor}${ (i + 1).toString().padStart(2, '0') }`;
                            const room = classrooms.find(c => c.name === roomName);
                            const assignment = room ? getRoomAssignment(room.id) : null;
                            return (
                              <div key={`${floor}-${i}`}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className={cn("p-2 rounded-lg border-2 text-[9px] leading-tight transition-all cursor-help", room?.status === 'occupied' ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-100")}>
                                      <p className="font-black">{roomName}</p>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {assignment ? <p>{assignment.subject} - {assignment.professorName}</p> : <p>Libre</p>}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
              </TooltipProvider>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {catAnnouncements.map(ann => (
                <Card key={ann.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">U</div>
                      <div>
                        <p className="font-bold text-sm">UNEXCA Oficial</p>
                        <p className="text-[10px] text-slate-400">{new Date(ann.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="font-bold text-lg">{ann.title}</p>
                    <p className="text-sm text-slate-600">{ann.content}</p>
                    <div className="flex gap-4 pt-2 border-t border-slate-100">
                      <Button variant="ghost" size="sm" className="text-slate-500"><MessageSquare className="h-4 w-4 mr-2" /> Comentar</Button>
                      <Button variant="ghost" size="sm" className="text-slate-500"><Heart className="h-4 w-4 mr-2" /> Me gusta</Button>
                      <Button variant="ghost" size="sm" className="text-slate-500"><Share2 className="h-4 w-4 mr-2" /> Compartir</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
  );
}
