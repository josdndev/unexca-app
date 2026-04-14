import { db } from '../firebase';
import { collection, addDoc, getDocs, query, limit, writeBatch, doc } from 'firebase/firestore';

const careers = [
  'Administración',
  'Contaduría Pública',
  'Informática',
  'Turismo',
  'Distribución y Logística',
  'Comercio Exterior'
];

const professors = [
  'Dr. Arnaldo Pérez',
  'MSc. Beatriz García',
  'Ing. Carlos Ruiz',
  'Dra. Diana López',
  'Lic. Elena Martínez',
  'Prof. Fernando Gómez'
];

const subjects = [
  'Cálculo I',
  'Programación II',
  'Contabilidad Básica',
  'Marketing Digital',
  'Redes de Datos',
  'Ética Profesional'
];

export async function seedDatabase() {
  const q = query(collection(db, 'classrooms'), limit(1));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log('Seeding massive classroom data...');
    
    // Create 7 floors with 16 classrooms each
    for (let floor = 1; floor <= 7; floor++) {
      for (let roomNum = 1; roomNum <= 16; roomNum++) {
        const roomName = `Aula ${floor}${roomNum.toString().padStart(2, '0')}`;
        const isOccupied = Math.random() > 0.6;
        
        const classroomRef = await addDoc(collection(db, 'classrooms'), {
          name: roomName,
          floor: floor,
          capacity: Math.floor(Math.random() * 20) + 20,
          status: isOccupied ? 'occupied' : 'available',
          features: []
        });

        if (isOccupied) {
          // Add current assignment
          await addDoc(collection(db, 'assignments'), {
            classroomId: classroomRef.id,
            professorId: 'demo-prof',
            professorName: professors[Math.floor(Math.random() * professors.length)],
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            studentCount: 25,
            date: new Date().toISOString().split('T')[0],
            startTime: '08:00',
            endTime: '10:00',
            nextClass: {
              professor: professors[Math.floor(Math.random() * professors.length)],
              subject: subjects[Math.floor(Math.random() * subjects.length)],
              time: '10:00 - 12:00'
            }
          });
        }
      }
    }
    
    // Add career-specific announcements and academic offers
    for (const career of careers) {
      // Academic Offer
      await addDoc(collection(db, 'announcements'), {
        title: `Oferta Académica: ${career} - 2024-II`,
        content: `Plan de estudios actualizado para el trayecto inicial y avanzado. Modalidad: Presencial/Híbrida. Cupos disponibles para nuevos ingresos.`,
        authorId: 'system',
        createdAt: new Date().toISOString(),
        priority: 'high',
        category: career,
        type: 'oferta'
      });

      // General Announcement
      await addDoc(collection(db, 'announcements'), {
        title: `Evento: Jornada de ${career}`,
        content: `Invitamos a todos los estudiantes a la charla magistral sobre tendencias actuales en el área de ${career} este viernes en el auditorio.`,
        authorId: 'system',
        createdAt: new Date().toISOString(),
        priority: 'medium',
        category: career,
        type: 'anuncio'
      });
    }
  }
}
