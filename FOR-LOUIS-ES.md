# Easy OEE — En Dónde Estamos

Un recorrido completo para Louis. Qué es la app, qué hace, qué hemos
construido, cómo se usa y hacia dónde va.

**App en vivo:** https://easy-oee.vercel.app
**Última actualización:** Abril 2026

---

## Tabla de contenidos

1. [El pitch en 60 segundos](#el-pitch-en-60-segundos)
2. [Qué es Easy OEE en realidad](#qué-es-easy-oee-en-realidad)
3. [Quién la usa y cómo](#quién-la-usa-y-cómo)
4. [Precios](#precios)
5. [Cómo probar la app ahora mismo](#cómo-probar-la-app-ahora-mismo)
6. [La experiencia del operador, paso a paso](#la-experiencia-del-operador-paso-a-paso)
7. [La experiencia del gerente, paso a paso](#la-experiencia-del-gerente-paso-a-paso)
8. [El nuevo modo TV Board](#el-nuevo-modo-tv-board)
9. [Idiomas](#idiomas)
10. [Todo lo que hemos construido hasta ahora](#todo-lo-que-hemos-construido-hasta-ahora)
11. [Qué sigue](#qué-sigue)
12. [Preguntas frecuentes](#preguntas-frecuentes)

---

## El pitch en 60 segundos

La mayoría de las fábricas están adivinando qué tan bien funcionan
sus máquinas. Creen que están al 90% de eficiencia. En realidad están
al 55%. Pierden dinero todos los días y no lo saben.

**Easy OEE** es una aplicación web que le da al operador de planta
una tablet en el piso de producción donde toca botones grandes para
registrar su turno, los paros y las piezas producidas. La app hace
las matemáticas automáticamente y le da al gerente de planta **un
solo número del 0 al 100** que le dice exactamente cómo está
funcionando su fábrica, en tiempo real.

- No requiere hardware (todavía — eso lo construiremos en la Fase 4)
- Sin hojas de cálculo, sin papel
- Funcionando en un solo turno
- Construido para fabricantes pequeños y medianos de Canadá y EE.UU.
- $49 a $129 USD por mes

Eso es todo el producto.

---

## Qué es Easy OEE en realidad

OEE significa **Overall Equipment Effectiveness** (Efectividad
General del Equipo). Es la métrica estándar de oro para medir la
productividad en manufactura, usada en todas partes desde Toyota
hasta Tesla. Es un solo porcentaje del 0 al 100 que combina tres
cosas:

| Componente        | Lo que mide                                                  |
|-------------------|--------------------------------------------------------------|
| **Disponibilidad**| ¿La máquina estaba funcionando cuando debía?                 |
| **Desempeño**     | ¿Funcionaba a la velocidad correcta cuando estaba encendida? |
| **Calidad**       | De las piezas producidas, ¿cuántas salieron buenas?          |

**OEE = Disponibilidad × Desempeño × Calidad**

Una puntuación del **85% o más** se considera de clase mundial. La
mayoría de las plantas que nunca lo han medido se sorprenden al
descubrir que están al 50-60%. En el momento en que empiezan a
medirlo, empiezan a mejorarlo — y eso solo ya vale el precio del
software.

Easy OEE maneja todas las matemáticas automáticamente. El operador
solo toca botones. El gerente solo lee los números.

---

## Quién la usa y cómo

Hay **dos tipos de usuarios completamente distintos** en Easy OEE:

### 1. El Gerente (el comprador)
- Paga la suscripción con tarjeta de crédito
- Inicia sesión con **correo electrónico + contraseña** desde una
  laptop en su oficina
- Ve un panel en vivo de cada máquina, cada turno, cada puntuación
- Agrega líneas de producción, invita operadores, descarga reportes
- Probablemente nunca pisa el piso de producción
- **Este es nuestro cliente**

### 2. El Operador (el trabajador)
- **No tiene correo electrónico ni contraseña**
- Camina hasta una tablet compartida atornillada a la máquina
- Escribe un **PIN de 4 dígitos** como en un cajero automático
- Aparece su nombre, elige la máquina, inicia su turno
- Toca botones grandes durante todo el turno para registrar paros
  y piezas
- Al final, toca "Terminar Turno" → ve su puntuación → se va
- Este es **el usuario del producto que el gerente compró**

**¿Por qué dos sistemas?** Porque un trabajador de fábrica con
guantes de hule a las 6 AM no va a teclear un correo y una
contraseña. Va a teclear cuatro dígitos. Cualquier cosa más
complicada que eso y dejará de registrar datos — lo que hace que
todo el producto sea inútil. El sistema de PIN no es un atajo. Es
el único diseño que sobrevive al contacto con un piso de producción
real.

---

## Precios

Todos los precios están en **USD por mes**, facturados mensual o
anualmente (anual tiene descuento). Las conversiones aproximadas a
dólares canadienses se muestran como referencia, pero a los clientes
se les cobra en USD.

| Plan             | Precio              | Líneas de producción | Operadores       | Historial   |
|------------------|---------------------|----------------------|------------------|-------------|
| **Starter**      | **$49** USD/mes     | 1 línea              | Hasta 3                       | 30 días     |
| **Professional** | **$129** USD/mes    | Hasta 5 líneas       | Hasta 3 por línea (15)        | 90 días     |
| **Enterprise**   | Personalizado       | Ilimitado            | Ilimitado                     | Para siempre |

**Pagas por máquina, no por trabajador.** Este es el modelo correcto
porque el valor de medir el OEE escala con el número de máquinas
que se miden, no con el número de personas. Una planta con 100
trabajadores y 2 máquinas paga lo mismo que una planta con 10
trabajadores y 2 máquinas — ambas obtienen la misma información.

**Prueba gratis de 7 días, sin tarjeta de crédito.**

Precios planos por nivel — quien necesite más de 5 líneas pasa a
Enterprise, donde cotizamos según el tamaño de la planta, número de
líneas y necesidades de integración.

### Qué incluye cada plan

**Starter ($49/mes) incluye:**
- 1 línea de producción
- Hasta 3 cuentas de operador
- Las 10 categorías de razones de paro
- Panel de OEE en tiempo real
- Seguimiento de turno en vivo con cronómetros
- Árbol de pérdidas en el resumen del turno
- Reportes de resumen de turno
- Exportación a CSV
- Exportación a PDF / impresión
- Historial de 30 días

**Professional ($129/mes) incluye todo lo de Starter, más:**
- Hasta 5 líneas de producción
- Hasta 3 operadores por línea (15 en total)
- Panel multi-línea con comparación de turnos
- Gráfica de Pareto de razones de paro de los últimos 7 días
- Vista de calendario de turnos recientes
- Flujo de edición de turno con registro de auditoría
- Modo TV Board público para pantallas en piso de producción
- Resúmenes de turno por correo
- Resumen diario por correo (cuando se conecte Resend)
- Historial de 90 días

**Enterprise (precio personalizado) incluye todo lo de Professional, más:**
- Líneas y operadores ilimitados
- Categorías personalizadas de razones de paro
- Consolidación multi-planta
- Onboarding dedicado
- SLA + soporte prioritario
- Historial ilimitado
- Futuro: integración con hardware (lectura de PLC)
- Futuro: acceso a API para integración con ERP

---

## Cómo probar la app ahora mismo

Puedes probar toda la app tú mismo en cinco minutos:

### Como gerente

1. Ve a **https://easy-oee.vercel.app/sign-in**
2. **Correo:** lo que sea (literalmente cualquier dirección — el login
   temporal no valida)
3. **Contraseña:** `EasyOEE2026Admin`
4. Llegarás al **Panel del Gerente** con datos de demostración cargados
5. Haz clic por todos lados: Dashboard, Líneas, Operadores, Turnos en
   la barra lateral

### Como operador

1. Ve a **https://easy-oee.vercel.app/pin**
2. Elige **Pierre Lavoie** de la lista
3. **PIN:** `1234`
4. Ya iniciaste sesión como operador
5. Verás el formulario de **Iniciar Turno** — elige una línea, tipo
   de turno, producto
6. Toca **Iniciar Turno**
7. Ahora estás en la **pantalla de Turno en Vivo**

### Qué probar en la pantalla de turno en vivo

- **Toca una razón de paro** (ej., "Falla Mecánica") — el botón se
  pone amarillo, aparece una tarjeta roja grande con un cronómetro
  contando, la estimación de OEE empieza a bajar
- **Espera unos segundos, toca el mismo botón otra vez** para
  reanudar — la tarjeta desaparece, el cronómetro de tiempo
  transcurrido sigue corriendo
- **Toca +1 o +10 en Piezas Buenas** — el contador sube, la
  estimación de OEE en vivo se actualiza
- **Mira la fila de cronómetros** — tiempo transcurrido del turno,
  hora prevista de fin, minutos totales de paro
- **Mira la tarjeta de OEE en Vivo** — codificada por color contra
  el objetivo, con un delta que muestra qué tan arriba o abajo estás
- **Detén una parada larga (10+ minutos)** — al reanudar, recibirás
  un aviso pidiendo una nota rápida sobre lo que pasó (esto
  construye memoria institucional de qué se descompone realmente)
- **Toca Cambio de Turno** — elige otro operador, escribe su PIN, el
  turno continúa bajo su nombre sin reiniciar nada
- **Toca Terminar Turno** — el servidor ejecuta el cálculo de OEE y
  llegas a la página de **Resumen del Turno**

### Qué probar en el resumen del turno

- **Número grande de OEE** arriba, codificado por color
- **Tres tarjetas de componentes** para Disponibilidad / Desempeño /
  Calidad
- **El Árbol de Pérdidas** — una barra horizontal apilada que muestra
  exactamente a dónde se fue cada minuto planeado (Producción Buena
  / Pérdida de Calidad / Pérdida de Velocidad / Tiempo de Paro).
  Esta es una de las gráficas más útiles en OEE y la mayoría de los
  competidores no la muestran.
- **Tabla de detalle de producción** con todos los números
- **Tabla de eventos de paro** con cada parada, hora, duración y notas
- **Tres botones de exportación:**
  - **Descargar CSV** — CSV completo por turno
  - **Imprimir o guardar PDF** — usa el diálogo de impresión del
    navegador con una hoja de estilos personalizada que oculta el
    chrome y cambia a negro sobre blanco
  - **Enviar por correo** — envía el resumen a cualquier dirección
- **Iniciar Nuevo Turno** y **Dashboard** botones arriba para
  navegación con un solo toque

---

## La experiencia del operador, paso a paso

Un día real de un operador llamado John, trabajando el turno
matutino en la Línea de Embotellado 1:

**6:55 AM** — John camina hasta la tablet atornillada a la Línea 1.
Toca la pantalla. La página de PIN muestra una lista de nombres.
Toca **John Smith**. Escribe **4729**. La app dice "Hola John."

**6:56 AM** — Está en el formulario de configuración de turno.
Elige la Línea 1 de los botones de radio, elige "Turno Matutino",
escribe "botellas de agua de 16oz" en el campo de producto. Los
minutos planeados por defecto son 480 (8 horas). La cadencia ideal
por defecto se toma de la configuración de la línea (120
botellas/min). Toca **Iniciar Turno**.

**7:00 AM** — Ahora está en la pantalla de Turno en Vivo. Una
píldora grande de "EN MARCHA" en la esquina superior derecha. El
cronómetro de tiempo transcurrido empieza a contar. La estimación
de OEE muestra N/A porque todavía no hay datos.

**7:00 AM – 9:00 AM** — La línea está corriendo. John toca **+10
Piezas Buenas** aproximadamente cada minuto. La tarjeta de OEE en
Vivo sube lentamente al verde.

**9:14 AM** — Una botella se atora. John toca **Falla Mecánica**.
El botón se pone amarillo. La tarjeta roja grande aparece con un
cronómetro contando. La píldora de arriba cambia a "DETENIDO". La
estimación de OEE empieza a bajar en tiempo real.

**9:23 AM** — Atasco resuelto. John toca el mismo botón otra vez.
La tarjeta desaparece. **Como la parada duró 9 minutos, todavía no
se dispara el aviso de nota.** El turno se reanuda.

**12:00 PM** — Hora del almuerzo. John toca **Descanso Programado**.
La tarjeta aparece otra vez con un cronómetro fresco.

**12:30 PM** — De regreso del almuerzo. John toca **Descanso
Programado** para reanudar. **30 minutos está sobre el umbral de
10 minutos**, así que aparece un aviso de nota: "Esa parada duró 30
minutos por Descanso Programado. Deja una nota para que el equipo
sepa qué pasó." John escribe "almuerzo" y toca Guardar Nota. La
nota ahora está adjunta a ese registro de parada para siempre.

**3:00 PM** — Fin del turno. John toca **Terminar Turno**. Una
confirmación pregunta "¿Terminar este turno? El OEE final será
calculado y guardado." Toca OK.

**3:00:01 PM** — El servidor ejecuta el cálculo de OEE:
- Minutos planeados: 480
- Minutos de paro: 67 (suma de todas las paradas)
- Tiempo de marcha: 413 minutos
- **Disponibilidad = 413/480 = 86%**
- Piezas buenas: 47,840 / Piezas malas: 380
- Piezas totales: 48,220
- **Desempeño = 48,220 / (120 × 413) = 97%**
- **Calidad = 47,840 / 48,220 = 99%**
- **OEE = 86 × 97 × 99 = 82.6%**

**3:00:02 PM** — John llega al Resumen del Turno. "82.6%" grande en
el centro, codificado en color verdoso (un poco abajo de la marca de
clase mundial del 85%). Puede ver el árbol de pérdidas mostrando
exactamente a dónde se fue el tiempo, la lista de todas sus paradas
con notas, y los botones de exportación. Toca **Iniciar Nuevo
Turno** si otro trabajador toma su lugar, o simplemente se va.

Ese es el ciclo del operador. **Está diseñado para ser usable con
una sola mano, con guantes, por alguien que nunca ha visto la app
antes, sin entrenamiento.**

---

## La experiencia del gerente, paso a paso

Sarah es la gerente de producción. Trabaja en una oficina un piso
arriba del piso de producción. Tiene una laptop. Tiene correo. Tiene
una tarjeta de crédito. Es nuestro cliente.

**Lunes, 7:30 AM** — Sarah se sirve su primer café, abre su laptop,
va a easy-oee.com/sign-in, escribe su correo y contraseña. Llega al
Panel del Gerente.

**Arriba del panel** — un número gigante de "OEE de Hoy" para toda
la planta. Está actualmente en 73% porque Pierre en la Línea 2 tuvo
un mal arranque de turno.

**Debajo de eso** — tres tarjetas lado a lado comparando los
promedios de **Mañana vs Tarde vs Noche** durante los últimos 7
días. Su turno de noche está al 64% vs su turno de mañana al 81%.
Sarah toma nota mental de hablar con el supervisor de noche.

**Tabla de Turnos en Vivo** — muestra cada turno actualmente
corriendo en toda la planta. Puede ver que Pierre está en la Línea
2 con 1,200 piezas producidas hasta ahora, comenzó a las 7:00 AM.

**Tabla de Turnos Recientes** — los últimos 10 turnos completados
con su desglose completo de A/D/C y OEE final, codificados por color.

**Top de Razones de Paro (Pareto)** — una gráfica de barras
horizontales de los últimos 7 días de tiempo de paro, ordenada por
minutos totales perdidos. "Falla Mecánica" es la más grande con 142
minutos, "Sin Material" sigue con 67 minutos. Sabe exactamente qué
arreglar primero.

**Hace clic en "Líneas" en la barra lateral** — ve todas sus líneas
de producción, sus cadencias ideales, sus objetivos de OEE, y
**sus enlaces de TV Board**. Hace clic en **Generar** en la Línea
1, obtiene una URL pública, y se la envía por mensaje al técnico de
mantenimiento que tiene una TV en su oficina. Ahora él puede ver el
OEE de la Línea 1 en la pared todo el día.

**Hace clic en "Turnos" en la barra lateral** — ve una cuadrícula
de calendario de los últimos 14 días, 3 filas (mañana/tarde/noche)
× 14 columnas. Cada celda está coloreada por el bucket de OEE.
Inmediatamente nota que la noche del miércoles fue un desastre —
rojo brillante. Hace clic en el número de OEE de ese turno y llega
a su resumen.

**Nota que el operador escribió mal el nombre del producto** —
"botellas de 168oz" en lugar de "16oz". Hace clic en **Editar**,
arregla el error, escribe "error de tecleo del operador" en el
campo de razón de auditoría, presiona Guardar. Listo.

**Se va a una junta** — pero antes de irse, recibirá un **resumen
por correo** mañana a las 6 AM resumiendo el desempeño del día
anterior por línea, las 3 razones principales de paro, y un párrafo
narrativo escrito por Claude AI explicando a qué prestar atención
primero. (Esto está conectado — necesita cuenta de Resend para
enviar realmente los correos.)

**A la hora de la comida recibe un SMS** — espera, todavía no.
Las alertas SMS no están construidas aún. Están en cola para la
siguiente fase.

Ese es el ciclo del gerente. **Nunca tiene que pensar en cómo
funciona el OEE ni hacer matemáticas. La app lo hace. Ella solo
lee los números y toma decisiones.**

---

## El nuevo modo TV Board

Esta es una de las funciones más diferenciadas del producto y nadie
más piensa en construirla.

El gerente genera un **token público de tablero** para cada línea
desde la página de administración de Líneas. Eso le da una URL como
`https://easy-oee.vercel.app/board/aB3cD4eF5gH6...` Abren esa URL
en una TV de 55 pulgadas atornillada arriba de la línea de
producción. **Sin login. Sin chrome del navegador. Solo números.**

Lo que aparece en la TV:

- **El nombre de la línea** en tipografía Bebas Neue gigante en la
  parte superior izquierda
- **Una píldora de EN MARCHA / DETENIDO** en la parte superior
  derecha (roja cuando está detenida)
- **El número actual de OEE** en el centro, ocupando la mayor parte
  de la pantalla, codificado en verde/amarillo/rojo
- **Etiqueta "OEE EN VIVO · OBJETIVO 85%"** debajo
- **Cuando está detenida: una razón de paro y cronómetro rojos
  parpadeando**
- **Un panel lateral** con:
  - Piezas buenas (y piezas malas en rojo)
  - Tiempo transcurrido del turno
  - Las 3 razones principales de paro de los últimos 7 días
- **Un pie** con el logo de Easy OEE y la hora actual

La página **se actualiza cada 10 segundos automáticamente** para que
los números estén al día. Los cronómetros corren suavemente entre
actualizaciones.

**Por qué esto importa:** Convierte a Easy OEE de "software que
compró el jefe" a "el marcador del equipo." Cuando los trabajadores
pueden ver su propia puntuación en vivo arriba de la línea, se
desempeñan mejor. Es la misma psicología que un rastreador de
fitness. Y cada vez que alguien pasa frente a la TV, ve tu producto.
**Se propaga dentro de la planta.**

El gerente puede rotar el token en cualquier momento si quiere
revocar el acceso público.

---

## Idiomas

Toda la app — **cada página, cada botón, cada etiqueta, cada
mensaje de error** — está completamente traducida a:

- 🇨🇦🇺🇸 **Inglés**
- 🇲🇽🇪🇸 **Español**
- 🇨🇦🇫🇷 **Francés (canadiense)**

Eso es aproximadamente **200 claves de traducción × 3 idiomas =
600 strings** completamente localizados. El selector de idioma
siempre está visible en la barra de navegación superior (escritorio
y móvil), en la barra lateral del panel, en la página de inicio
de sesión, y en las páginas del operador.

La elección **se guarda en una cookie** para que la próxima vez que
el usuario visite, llegue automáticamente en su idioma. Las páginas
renderizadas en el servidor leen la cookie y renderizan en el
idioma correcto en el primer pintado — sin parpadeo de inglés.

Esto es enorme para el mercado canadiense porque **Quebec tiene
requisitos legales laborales de solo francés** para software de
trabajo, y es enorme para el mercado de EE.UU. porque el español
es el idioma dominante del piso de producción en muchos estados.

---

## Todo lo que hemos construido hasta ahora

Esta es la lista completa de lo que realmente está en el producto
ahora mismo, organizada por área.

### Sitio de marketing (easy-oee.com)

- **Página de inicio** con hero, barra de estadísticas, sección de
  problema, píldoras de solución, cómo funciona, cuadrícula de
  funciones, prueba social, teaser de precios, CTA
- **Página de precios** con deslizador de número de líneas, tres
  niveles (Starter / Professional / Enterprise), USD primario +
  CAD de referencia, tabla de comparación, acordeón de FAQ
- **Página de Cómo Funciona** explicativa
- **Calculadora de ROI** — widget interactivo que muestra cuánto
  dinero está dejando el cliente sobre la mesa
- **Página de Contacto** con formulario de solicitud de demo (guarda
  en base de datos, listo para conectar Resend)
- **Política de Privacidad** + páginas de **Términos del Servicio**
- **Flujo de Registro** para la prueba de Stripe (actualmente un
  stub esperando credenciales de Stripe)
- **Manómetro animado del hero** — SVG puro, la aguja sube de 0 al
  máximo, rebota dos veces, se reinicia. Respeta la configuración
  de accesibilidad de "reducir movimiento"
- **Menú hamburguesa móvil** con superposición de pantalla completa
- **Favicon e imagen de Open Graph con marca** para vistas previas
  de enlaces en Slack, iMessage, Twitter, LinkedIn
- **Marca "Hecho en Canadá"** en todo el sitio

### Superficie del operador

- **Login con PIN** en `/pin` — elige nombre de la lista, escribe
  PIN de 4 dígitos, verificado con bcrypt, sesión con cookie
  HTTP-only firmada, TTL de 12 horas
- **Configuración de turno** en `/operator` — elige línea, tipo de
  turno, producto, minutos planeados, cadencia ideal (predeterminados
  desde la línea)
- **Pantalla de turno en vivo** en `/shift/[id]` — la página más
  importante de la app. Incluye:
  - **Cronómetros grandes** de tiempo transcurrido / fin previsto /
    tiempo total de paro en dígitos mono
  - **Barra de progreso** que se vuelve roja cuando se pasa
  - **Estimación de OEE en vivo** actualizada cada segundo con
    desglose de A/D/C y delta del objetivo, codificado por color
  - **Tarjeta roja pulsante de tiempo de paro** con el cronómetro
    en vivo de la parada actual, aparece en el instante en que se
    toca un botón de parada
  - **Aviso de nota de parada larga** que se dispara automáticamente
    cuando una parada dura 10+ minutos
  - **Botón de cambio de turno** para que el siguiente operador
    pueda tomar el control a mitad de turno con su PIN
  - **Contadores +1 / +10** de piezas buenas y malas
  - **10 botones de razones de paro** en una cuadrícula de 2
    columnas amigable para guantes
  - **Botón de Terminar Turno** con confirmación
- **Resumen del Turno** en `/shift/[id]/summary` — reporte final
  que incluye:
  - **Botones de acción arriba** (Iniciar Nuevo Turno, Dashboard)
    para navegación con un solo toque
  - **Número grande de OEE** codificado por color
  - **Tres tarjetas de componentes** para Disponibilidad /
    Desempeño / Calidad
  - **Árbol de Pérdidas** — barra horizontal apilada mostrando a
    dónde se fue cada minuto (Producción Buena / Pérdida de
    Calidad / Pérdida de Velocidad / Tiempo de Paro) con leyenda
    de totales en minutos
  - **Tabla de detalle de producción**
  - **Tabla de eventos de paro** con notas
  - **Descarga CSV** del turno completo
  - **Imprimir o guardar PDF** vía diálogo de impresión del
    navegador con hoja de estilos personalizada
  - **Acción de Enviar por correo** que envía el resumen a cualquier
    dirección
- **Manifest de PWA** para que los operadores puedan "Agregar a la
  Pantalla de Inicio" en una tablet y la app se lance en pantalla
  completa sin chrome del navegador

### Panel del gerente

- **Inicio de sesión del gerente** en `/sign-in` (actualmente una
  contraseña de admin temporal, será Clerk pronto)
- **Dashboard** en `/dashboard`:
  - **OEE de Hoy** número grande (promedio de turnos completados hoy)
  - **Tarjetas de Comparación de Turno** — promedios de 7 días de
    Mañana / Tarde / Noche, codificados por color
  - **Tabla de Turnos en Vivo** — cada turno actualmente en progreso
  - **Tabla de Turnos Recientes** — últimos 10 turnos completados
    con desglose completo de A/D/C/OEE
  - **Gráfica de Pareto** — top de razones de paro de los últimos
    7 días, ordenadas por minutos totales perdidos, con barras
    horizontales
- **Administración de líneas** en `/dashboard/lines`:
  - Formulario de **Agregar línea** (nombre, cadencia ideal,
    objetivo de OEE)
  - **Lista de líneas** con edición en línea
  - **Panel de TV Board** por línea con Generar / Rotar Token + Abrir
- **Administración de operadores** en `/dashboard/operators`:
  - Formulario de **Agregar operador** (nombre + PIN de 4 dígitos)
  - **Lista de operadores** con edición en línea, restablecer PIN,
    desactivar
- **Historial de turnos** en `/dashboard/shifts`:
  - **Cuadrícula de calendario** de los últimos 14 días × 3 tipos
    de turno, codificada por color
  - **Tabla completa de turnos** — últimos 100 turnos con enlaces
    de Editar
  - **Página de Editar Turno** en `/dashboard/shifts/[id]/edit` —
    arreglar errores tipográficos, corregir conteos de piezas, con
    campo obligatorio de razón de auditoría. El OEE se recalcula
    automáticamente si el turno ya está completo

### Modo TV Board (el diferenciador)

- **Ruta pública** en `/board/[token]` — sin login requerido
- **Diseñado para pantallas de 55"** con dimensionamiento responsivo
  basado en `clamp()` que escala desde una vista previa de laptop
  hasta 4K
- **Se actualiza automáticamente cada 10 segundos** para una
  instantánea fresca del servidor
- **Los cronómetros en vivo corren suavemente** entre actualizaciones
  vía reloj del cliente
- **Muestra OEE en vivo, estado EN MARCHA/DETENIDO, operador,
  producto, piezas, tiempo transcurrido, top de paros**, con un
  estado inactivo cuando no hay turno corriendo

### Insights y automatización

- **Matemáticas del árbol de pérdidas** — particiona cada minuto
  planeado en Bueno / Calidad / Velocidad / Tiempo de paro
- **Cron de resumen diario** — corre a las 6 AM hora del este vía
  Vercel Cron, construye consolidado por compañía del día anterior
  con mejores/peores líneas y top de paros. Resumen narrativo
  opcional con Claude AI si `ANTHROPIC_API_KEY` está configurado.
  Hoy registra en logs, enviará por correo vía Resend una vez que
  esté conectado
- **Cron de escaneo semanal de anomalías** — corre los lunes a las
  8 AM hora del este, marca cualquier línea cuyo promedio de OEE
  de 7 días bajó más de 5 puntos porcentuales comparado con la
  línea base de las 4 semanas anteriores

### Fundación que no ves pero que importa

- **Multi-tenancy aplicada en todas partes** — cada consulta a la
  base de datos está delimitada por `company_id`. Los clientes
  nunca pueden ver los datos de otros, ni siquiera por accidente,
  ni siquiera si un programador comete un error. Esto se aplica al
  nivel más bajo del código.
- **Capa de datos a prueba de bugs** — los cuatro bugs del prototipo
  original de Bubble ahora son **estructuralmente imposibles**:
  cada turno tiene un enlace requerido a la compañía, cada parada
  tiene un enlace requerido al turno, las duraciones de las paradas
  son calculadas por el servidor (no por el cliente), y el OEE se
  calcula con una función pura testeada en un solo lugar.
- **Auto-migraciones** — cada vez que cambiamos el schema de la base
  de datos, el siguiente despliegue aplica automáticamente la
  migración antes de que corra el nuevo código. El panel no puede
  romperse por un desajuste de schema.
- **Integración continua** — cada commit corre typecheck, lint,
  pruebas, y un build de producción antes de desplegar. El código
  roto nunca llega a producción.
- **Auto-sincronización entre máquinas** — la copia de trabajo del
  desarrollador se mantiene continuamente en sincronía entre la iMac,
  la laptop y GitHub vía un proceso en segundo plano. No se necesita
  `git pull` / `git push` manual.

---

## Qué sigue

El producto está **listo para hacerle demo a clientes reales ahora
mismo**. El trabajo restante es principalmente conectar servicios
externos y pulido.

### Próximos pasos inmediatos (antes de cobrarle a alguien)

1. **Facturación con Stripe** — el andamiaje está todo en su lugar.
   Necesitamos crear productos en Stripe, pegar los IDs de precio,
   y reemplazar los endpoints de stub 501 con manejo real de Stripe
   Checkout y webhooks. El schema está listo.

2. **Autenticación con Clerk** — reemplazar la contraseña de admin
   temporal con un inicio de sesión real con correo/contraseña para
   gerentes. Esta es la única cosa que bloquea pilotos reales con
   clientes porque ahora mismo todos comparten una contraseña de
   admin.

3. **Correo con Resend** — reemplazar el stub de enviar-por-correo
   en la página de resumen del turno con envío real de correos, y
   activar la entrega automática del resumen diario (el cron ya
   está corriendo, solo registra en logs en vez de enviar por
   correo ahora mismo).

### Mediano plazo (para el lanzamiento)

4. **Estados de carga y error** — páginas adecuadas de
   "cargando..." y "algo salió mal" en lugar de pantallas en blanco
5. **Sentry** para rastreo de errores para que sepamos cuando las
   cosas se rompen en producción
6. **Cambio de dominio** — apuntar easy-oee.com del HTML estático
   viejo a la nueva app. (Actualmente el sitio de marketing es la
   nueva app en easy-oee.vercel.app, pero easy-oee.com todavía sirve
   la versión vieja. Cambiaremos una vez que estemos seguros.)
7. **Analíticas de producto con PostHog** — ver qué funciones usa
   la gente realmente

### Fase 4 — Integración con hardware

Esta es la grande. El schema y la capa de ingesta ya están diseñados
para esto. Agregamos un dispositivo pequeño (Raspberry Pi o similar)
que se conecta al PLC de la máquina por Wi-Fi y alimenta los datos
automáticamente. El operador no tiene que tocar ningún botón — el
dispositivo cuenta las piezas y detecta paros en tiempo real.

Esto se convierte en un upsell pagado encima de la suscripción SaaS.
Margen de hardware + ingresos recurrentes. **Todo en la base de
datos ya tiene una columna `data_source`** (`manual` vs `device`)
para que los mismos paneles funcionen para ambos.

### Fase 5 — Funciones empresariales

- Consolidación multi-planta (un cliente con 5 instalaciones ve
  todas en un solo panel)
- Acceso basado en roles (operador / supervisor / gerente / admin)
- Categorías personalizadas de razones de paro por compañía
- API REST para integración con ERP
- Preparación para SOC2
- Tabla de líderes de operadores (gamificación, activable por el
  gerente)
- Alertas SMS / Slack cuando una línea está caída demasiado tiempo

---

## Preguntas frecuentes

### ¿Cuánto tarda la configuración para un nuevo cliente?

Menos de una hora. El gerente se registra, agrega sus líneas de
producción, agrega sus operadores con PINs, imprime la hoja de
PINs, la baja al piso de producción. Los operadores pueden empezar
a registrar turnos en el siguiente cambio de turno.

### ¿Qué pasa si el wifi se cae en el piso de producción?

Ahora mismo: los últimos toques del operador podrían no guardarse
hasta que la conexión regrese. Tenemos **modo offline** en cola para
una versión futura donde la tablet guarda todo localmente y
sincroniza cuando regresa la conexión.

### ¿Qué pasa si un operador olvida su PIN?

El gerente puede restablecerlo desde la página de administración de
Operadores en dos clics.

### ¿Pueden dos operadores estar en la misma máquina al mismo tiempo?

No — un turno por máquina a la vez. Pero pueden **pasarse el control
sin interrupciones** con el nuevo botón de Cambio de Turno. El
turno continúa sin reiniciar ningún cronómetro o contador; ambos
operadores quedan registrados.

### ¿Qué pasa si el gerente quiere arreglar un error después de que el turno termine?

Puede. Hay un **flujo completo de edición de turno** en el panel del
gerente que requiere una razón de auditoría y recalcula el OEE
automáticamente.

### ¿Cómo veo qué está pasando en el piso de producción sin bajar?

Tres formas:
1. **Dashboard** — se actualiza cada 10 segundos, muestra turnos en
   vivo
2. **TV Board** — URL pública que puedes abrir en cualquier TV en
   cualquier oficina
3. **Correo de Resumen del Turno** — el resumen automático te
   enviará un correo a las 6 AM con todo lo que pasó el día anterior
   (cuando Resend esté conectado)

### ¿Puede el operador hacer trampa con los números?

No. **Todas las matemáticas corren en el servidor.** El navegador es
solo una pantalla tonta. Cuando el operador toca "reanudar", el
servidor calcula la duración usando su propio reloj. Cuando tocan
"terminar turno", el servidor corre la fórmula de OEE. No hay forma
de que un operador (o una tablet maliciosa) falsifique un número.

### ¿Qué idiomas soporta?

Inglés, español y francés (canadiense). El usuario elige su idioma
de un selector en la barra de navegación superior, y persiste.

### ¿Qué pasa si un cliente quiere exportar sus datos?

La exportación a CSV está integrada en cada página de resumen de
turno. La exportación a PDF usa el diálogo de impresión del
navegador con una hoja de estilos personalizada. Para exportación
masiva, podemos agregar una función de "exportar todos los turnos"
por compañía en una tarde.

### ¿Los datos están seguros?

Sí. La multi-tenancy se aplica al nivel más bajo de las consultas
de la base de datos — cada consulta está delimitada por
`company_id`, así que los clientes literalmente no pueden ver los
datos de otros incluso si se introduce un bug. Todas las
contraseñas y PINs están con hash bcrypt. Todas las sesiones están
firmadas criptográficamente. Todas las conexiones usan HTTPS. El
hosting está en Vercel + Neon Postgres, ambos proveedores
SOC2-compliant.

### ¿Cuánto nos cuesta operar?

Casi nada ahora mismo. Vercel es gratis hasta un límite generoso,
Neon Postgres es gratis para la rama de desarrollo. Una vez que
tengamos clientes reales, pagaremos quizá $20-50/mes en total en
costos de infraestructura para soportar varios cientos de clientes.
Los márgenes son excelentes.

### ¿Cuándo podemos empezar a vender?

En cuanto Stripe + Clerk estén conectados. Aproximadamente dos días
más de trabajo enfocado en esas dos integraciones y podemos aceptar
dinero real. Todo lo demás está en su lugar.

---

## Enlaces rápidos

- **App en vivo:** https://easy-oee.vercel.app
- **Iniciar sesión:** https://easy-oee.vercel.app/sign-in (contraseña: `EasyOEE2026Admin`)
- **Login del operador:** https://easy-oee.vercel.app/pin (Pierre Lavoie · PIN 1234)
- **Repositorio de GitHub:** https://github.com/cqdesignsny/easy-oee (privado)
- **Dominio:** easy-oee.com (todavía sirviendo el sitio estático viejo, cambiaremos pronto)

---

Si algo en este documento es confuso o quieres profundizar en
cualquier función, solo pide y caminamos por ello juntos.

— CQ
