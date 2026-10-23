---
name: pr-commit-description
description: "Use when preparing or improving a GitHub pull request description or commit message. Summarize verified functional changes, distinguish implemented, reverted, and unvalidated work, recommend behavior-focused tests, and report changed files and remaining validation."
argument-hint: "Describe the changes or ask to prepare PR and commit text"
---

# Preparar descripciones de PR y commit

Ayuda a redactar información precisa y verificable para un pull request (PR) y un commit. El resultado predeterminado son borradores; no publiques ni guardes cambios en GitHub o Git salvo petición explícita.

## Procedimiento

1. **Delimitar el cambio**
   - Inspecciona la rama actual, `git status`, los cambios staged y unstaged, y los archivos nuevos relevantes.
   - Compara con la base adecuada del PR si se conoce; de lo contrario, pregunta o indica qué comparación utilizaste.
   - Lee el código y las pruebas pertinentes. Separa los cambios relacionados con la tarea de los cambios preexistentes o ajenos; no los atribuyas al usuario ni los descartes.
   - Determina el alcance del commit a partir de los cambios staged. Si no hay cambios staged o no está claro qué se incluirá, prepara el mensaje como propuesta y señala la incertidumbre; no presupongas que todo el worktree pertenece al commit.

2. **Verificar los hechos funcionales**
   - Describe el comportamiento observable que cambia para el usuario o para otros componentes, no solo nombres de archivos o detalles internos.
   - Clasifica los cambios con precisión:
     - **Implementados:** presentes en el código actual.
     - **Revertidos:** retirados respecto a la base o cambio anterior, con evidencia en el diff o historial disponible. No llames «revertido» a algo simplemente ausente.
     - **Pendientes de validación:** implementados pero sin una comprobación suficiente, o comportamientos que aún requieren validación manual. No presentes una tarea pendiente como completada.
   - Si no hay cambios en una categoría, indícalo. Si no se puede confirmar el historial de una reversión, decláralo en vez de inferirlo.

3. **Revisar la validación**
   - Enumera únicamente pruebas, linters, builds y comprobaciones que se hayan ejecutado realmente, con su resultado.
   - Propón pruebas adicionales concretas basadas en los comportamientos afectados, incluidos escenarios límite relevantes. Distingue claramente las pruebas recomendadas de las ejecutadas.
   - Si no se ejecutaron pruebas, dilo sin sugerir que el cambio está validado.

4. **Preparar los textos**
   - Entrega un título de PR breve y un cuerpo listo para pegar, con secciones de resumen funcional, estado de cambios, validación ejecutada, pruebas recomendadas y pendientes.
   - Entrega un asunto de commit conciso y, si aporta claridad, un cuerpo que describa el propósito y el efecto funcional. El mensaje debe representar solo el alcance previsto del commit, no todo el worktree por defecto.
   - Escribe en el idioma solicitado por el usuario; si no especifica idioma, usa el idioma de la conversación.
   - Usa Markdown simple y evita afirmaciones promocionales, detalles especulativos o información sensible.

5. **Informar del estado final**
   - Lista los archivos modificados relevantes y, cuando sea posible, indica si están staged, unstaged o sin seguimiento.
   - Resume lo que queda pendiente de validación y cualquier incertidumbre sobre la base, el alcance o las reversiones.
   - Indica explícitamente que no se creó ningún commit ni se hizo push.

## Límites de actuación

- No ejecutes `git commit`, `git push`, `git reset`, ni alteres el staging como parte de la preparación.
- No crees ni edites un PR en GitHub por iniciativa propia. Si el usuario solicita expresamente publicar o actualizar el PR, limita esa acción a lo pedido y conserva el borrador generado como base para informar del resultado.
- Crear un commit o hacer push requiere una petición explícita del usuario para esa acción. Una solicitud de redactar o preparar un mensaje no es autorización para ejecutarla.
- No inventes pruebas, resultados, cambios funcionales, reversiones, archivos incluidos en el commit o estado de revisión.
