import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Classroom, Assignment, UserProfile, Announcement } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Users, 
  MapPin, 
  Megaphone,
  PlusCircle
} from 'lucide-react';
import { findOptimalClassroom } from '../lib/classroom-algorithm';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardProps {
  user: UserProfile;
}

export default function Dashboard({ user }: DashboardProps) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  
  const [studentCount, setStudentCount] = useState<number>(0);
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    const unsubClassrooms = onSnapshot(collection(db, 'classrooms'), (snapshot) => {
      setClassrooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Classroom)));
    });
    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)));
    });
    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
    });
    return () => {
      unsubClassrooms();
      unsubAssignments();
      unsubAnnouncements();
    };
  }, []);

  const handleAutoAssign = async () => {
    if (!subject || studentCount <= 0) {
      toast.error('Completa los datos de la clase');
      return;
    }

    const optimal = findOptimalClassroom(
      studentCount,
      selectedFloor,
      date,
      startTime,
      endTime,
      classrooms,
      assignments
    );

    if (optimal) {
      try {
        await addDoc(collection(db, 'assignments'), {
          classroomId: optimal.id,
          professorId: user.uid,
          subject,
          studentCount,
          date,
          startTime,
          endTime,
          createdAt: serverTimestamp()
        });
        toast.success(`Aula ${optimal.name} reservada`);
        setSubject('');
        setStudentCount(0);
      } catch (error) {
        toast.error('Error en la reserva');
      }
    } else {
      toast.error('No hay aulas disponibles para esta capacidad');
    }
  };

  const floors = Array.from(new Set(classrooms.map(c => c.floor))).sort((a: number, b: number) => a - b);
  const filteredClassrooms = classrooms.filter(c => c.floor === selectedFloor);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Panel de Gestión</h2>
          <p className="text-slate-500 text-sm">Bienvenido, Prof. {user.name || user.email.split('@')[0]}</p>
        </div>
        <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          {floors.map(floor => (
            <Button
              key={floor}
              variant={selectedFloor === floor ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFloor(floor)}
              className={cn(
                "h-8 px-4",
                selectedFloor === floor ? "bg-blue-700 text-white hover:bg-blue-800" : "text-slate-600"
              )}
            >
              Piso {floor}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filteredClassrooms.map((classroom) => (
              <Card key={classroom.id} className={cn(
                "border-slate-200 transition-all",
                classroom.status === 'occupied' ? "bg-blue-50/50 border-blue-200" : "bg-white"
              )}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-lg font-bold text-slate-900">{classroom.name}</span>
                    <Badge variant={classroom.status === 'available' ? 'outline' : 'default'} className={cn(
                      "text-[10px] font-bold uppercase",
                      classroom.status === 'available' ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "bg-blue-700 text-white"
                    )}>
                      {classroom.status === 'available' ? 'Libre' : 'Ocupada'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>Cap: {classroom.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>Piso {classroom.floor}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-lg shadow-blue-900/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-blue-700" />
                Reservar Aula
              </CardTitle>
              <CardDescription>Asignación automática por capacidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Materia</Label>
                <Input 
                  placeholder="Nombre de la materia" 
                  className="border-slate-200"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Estudiantes</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="border-slate-200"
                  value={studentCount}
                  onChange={(e) => setStudentCount(parseInt(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Inicio</Label>
                  <Input 
                    type="time" 
                    className="border-slate-200"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fin</Label>
                  <Input 
                    type="time" 
                    className="border-slate-200"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold" onClick={handleAutoAssign}>
                Confirmar Reserva
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900">Anuncios Recientes</CardTitle>
              <Megaphone className="h-4 w-4 text-blue-700" />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="border-l-2 border-blue-300 pl-3 py-1">
                      <p className="text-xs font-bold text-slate-900">{ann.title}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
