import { Classroom, Assignment } from '../types';

/**
 * Algoritmo de asignación dinámica de aulas.
 * Busca el aula óptima basada en capacidad, piso y disponibilidad.
 */
export function findOptimalClassroom(
  studentCount: number,
  floorPreference: number | null,
  date: string,
  startTime: string,
  endTime: string,
  classrooms: Classroom[],
  existingAssignments: Assignment[]
): Classroom | null {
  // 1. Filtrar por capacidad (mínimo necesario)
  let candidates = classrooms.filter(c => c.capacity >= studentCount);

  // 2. Filtrar por disponibilidad en el horario solicitado
  candidates = candidates.filter(classroom => {
    const isOccupied = existingAssignments.some(assignment => {
      if (assignment.classroomId !== classroom.id || assignment.date !== date) return false;
      
      // Lógica de solapamiento de tiempo
      return (
        (startTime >= assignment.startTime && startTime < assignment.endTime) ||
        (endTime > assignment.startTime && endTime <= assignment.endTime) ||
        (startTime <= assignment.startTime && endTime >= assignment.endTime)
      );
    });
    return !isOccupied;
  });

  if (candidates.length === 0) return null;

  // 3. Ordenar por eficiencia (menor desperdicio de espacio)
  candidates.sort((a, b) => a.capacity - b.capacity);

  // 4. Priorizar por piso si hay preferencia
  if (floorPreference !== null) {
    const sameFloor = candidates.filter(c => c.floor === floorPreference);
    if (sameFloor.length > 0) return sameFloor[0];
  }

  // Si no hay en el mismo piso o no hay preferencia, devolver el más eficiente en capacidad
  return candidates[0];
}
