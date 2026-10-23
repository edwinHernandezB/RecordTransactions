---
name: pr-commit-description
description: "Use when preparing, publishing, or updating a GitHub pull request description or commit message. Fill the repository PR template with verified changes, validation, and recommended tests; publish it to GitHub when explicitly requested."
argument-hint: "Prepare or publish the PR description and commit message"
---

# Preparar descripciones de PR y commit

Prepara y, cuando el usuario lo pida, publica descripciones precisas y verificables de pull requests (PR). El PR y el commit son textos distintos: nunca reemplaces la descripción detallada del PR por el asunto o el cuerpo breve del commit.

## Requisito de presentación en la conversación

- **Siempre muestra en la respuesta de la conversación el contenido completo y detallado del PR**, en Markdown y listo para pegar en el campo de descripción de GitHub. No lo sustituyas por un resumen breve, una lista de temas, una explicación de lo que habría que incluir ni una referencia a otro archivo o mensaje.
- Presenta por separado el título del PR, el cuerpo íntegro del PR y el mensaje propuesto para el commit. El cuerpo del PR no es el mensaje del commit: debe explicar los cambios y su estado con suficiente contexto para que alguien pueda revisar el PR desde la pestaña «Conversation».
- Cuando el usuario pida publicar, subir, crear o actualizar la descripción del PR, realiza la operación directamente en GitHub si existe una herramienta autenticada con permisos de escritura. Usa el mismo cuerpo detallado mostrado en la conversación y verifica después el título y el cuerpo publicados.
- Si el usuario solo pide preparar texto, no publiques ni modifiques el PR. Invocar la skill no autoriza por sí solo cambios remotos: la petición debe pedir publicación, creación o actualización.
- No recortes secciones para abreviar la respuesta. Si no hay contenido para una categoría —por ejemplo, cambios revertidos—, indícalo explícitamente en el cuerpo.
- Si no hay herramientas autenticadas de escritura disponibles, dilo claramente, no simules la publicación y muestra el cuerpo completo en la conversación. No cambies el cuerpo a un comentario como sustituto, a menos que el usuario lo pida.

## Plantilla de GitHub

- Usa [`../../PULL_REQUEST_TEMPLATE.md`](../../PULL_REQUEST_TEMPLATE.md) como esquema canónico de la descripción. GitHub la precarga al abrir un PR nuevo; para un PR existente, usa el mismo formato al actualizar su descripción.
- Rellena todas las secciones con información concreta; si una sección no aplica, escribe «Ninguno» o «No ejecutada» según corresponda, en lugar de dejar instrucciones o marcadores vacíos.
- No publiques el texto de ejemplo ni los marcadores de la plantilla sin sustituirlos.

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
   - Redacta el cuerpo completo de la descripción del PR con estas secciones visibles:
     1. **Resumen funcional:** qué puede hacer ahora el usuario y qué comportamiento observable cambió.
     2. **Cambios implementados:** lista concreta de funcionalidades incluidas.
     3. **Cambios revertidos o retirados:** qué se eliminó o deshizo y por qué; distingue una retirada intencional de una reversión confirmada. Indica «Ninguno» si corresponde.
     4. **Validación ejecutada:** comandos o pruebas realmente ejecutados y sus resultados. Indica «No ejecutada» cuando corresponda.
     5. **Pruebas recomendadas:** escenarios concretos que el revisor debe probar, incluyendo límites relevantes.
     6. **Pendiente de validación o riesgos:** lo que sigue sin comprobar, limitaciones conocidas e incertidumbres. Indica «Ninguno conocido» si corresponde.
   - En la respuesta de conversación, presenta primero el título y luego el **cuerpo íntegro del PR** en un bloque independiente, conservando todos los encabezados y listas anteriores; debe poder copiarse y pegarse directamente en GitHub sin reconstruirlo.
   - Presenta aparte un asunto de commit conciso y, si aporta claridad, un cuerpo que describa el propósito y el efecto funcional. El mensaje debe representar solo el alcance previsto del commit, no todo el worktree por defecto. No intentes condensar en el commit el detalle que pertenece al cuerpo del PR.
   - Escribe en el idioma solicitado por el usuario; si no especifica idioma, usa el idioma de la conversación.
   - Usa Markdown simple y evita afirmaciones promocionales, detalles especulativos o información sensible.

5. **Publicar cuando se solicite expresamente**
   - Resuelve el repositorio, la rama fuente y la rama base desde el contexto GitHub y el estado Git. Busca un PR abierto cuya rama fuente coincida exactamente; no actualices un PR elegido solo por tener título parecido.
   - Si hay un PR coincidente, actualiza su título y descripción con el contenido preparado. Si hay varios candidatos o la rama base/PR no es inequívoca, pregunta antes de escribir.
   - Si no hay PR coincidente, créalo solo si el usuario pidió crear/publicar el PR y se conocen repositorio, rama base y rama fuente. Si falta un dato necesario, pregunta.
   - Usa una herramienta GitHub autenticada con permisos de escritura si está disponible. Si no hay una herramienta MCP de escritura, comprueba si GitHub CLI autenticado o una sesión de navegador autenticada permiten la operación. Evita colocar tokens en argumentos, archivos versionados, logs o respuestas.
   - Tras publicar, vuelve a leer el PR y comprueba que el título y el cuerpo coinciden con el contenido preparado. Informa el enlace y si se creó o actualizó.
   - La autorización para publicar el PR no autoriza crear commits, hacer push, modificar archivos, ni fusionar el PR. Esas acciones requieren petición expresa aparte.

6. **Informar del estado final**
   - Después de mostrar el texto completo del PR y el mensaje de commit, lista los archivos modificados relevantes y, cuando sea posible, indica si están staged, unstaged o sin seguimiento.
   - Resume lo que queda pendiente de validación y cualquier incertidumbre sobre la base, el alcance o las reversiones, aunque ya esté detallado dentro del cuerpo del PR.
   - Indica explícitamente si se creó el PR, el commit o se hizo push; nunca presentes una acción pendiente como completada.

## Límites de actuación

- No ejecutes `git commit`, `git push`, `git reset`, ni alteres el staging como parte de la preparación.
- No crees ni edites un PR en GitHub por iniciativa propia. Si el usuario solicita expresamente publicar o actualizar un PR, limita la acción a título y cuerpo del PR; no hagas merge.
- Crear un commit o hacer push requiere una petición explícita del usuario para esa acción. Una solicitud de redactar o preparar un mensaje no es autorización para ejecutarla.
- No inventes pruebas, resultados, cambios funcionales, reversiones, archivos incluidos en el commit o estado de revisión.
