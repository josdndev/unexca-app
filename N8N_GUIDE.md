# Guía de Integración n8n -> Firestore (ETL UNEXCA)

Esta guía detalla cómo configurar un flujo en n8n para procesar archivos Excel con la carga académica e inyectarlos en Firestore.

## 1. Nodo: Webhook (HTTP Listen)
- **Método:** POST
- **Path:** `unexca-etl`
- **Response Mode:** On Received
- **Binary Property:** `data` (donde se recibirá el archivo Excel)

## 2. Nodo: Read Binary File (Opcional)
Si el webhook recibe el archivo como binario, este nodo asegura que n8n lo identifique correctamente.

## 3. Nodo: Spreadsheet File (Excel to JSON)
- **Operation:** Read from File
- **Binary Property:** `data`
- **Options:** 
  - `Read All Sheets`: true (o especifica la hoja de "Aulas")

## 4. Nodo: Code (Transformación)
Usa este código para mapear las columnas del Excel a la estructura de Firestore:

```javascript
return items.map(item => {
  return {
    json: {
      name: item.json["Nombre Aula"],
      floor: parseInt(item.json["Piso"]),
      capacity: parseInt(item.json["Capacidad"]),
      features: item.json["Equipamiento"] ? item.json["Equipamiento"].split(',') : [],
      status: 'available'
    }
  };
});
```

## 5. Nodo: Google Firebase Cloud Firestore
- **Resource:** Document
- **Operation:** Create
- **Collection:** `classrooms`
- **Authentication:** Usa una Service Account de Firebase (JSON).

## Flujo Completo
`Webhook` -> `Spreadsheet File` -> `Code` -> `Firebase Firestore`

---
**Nota:** Asegúrate de que las cabeceras del Excel coincidan con los nombres usados en el nodo de transformación.
