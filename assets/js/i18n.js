/**
 * Traducciones del sitio (ES/EN).
 *
 * En el HTML los textos se marcan asi:
 *   data-i18n="clave"              -> reemplaza el texto del elemento
 *   data-i18n-alt="clave"          -> setea el atributo alt
 *   data-i18n-aria-label="clave"   -> setea aria-label
 *   data-i18n-content="clave"      -> setea content (meta description)
 *
 * El idioma se resuelve en este orden:
 *   1. ?lang=en / ?lang=es en la URL (para links compartidos, gana siempre)
 *   2. la ultima eleccion guardada en localStorage
 *   3. el idioma del navegador (navigator.languages)
 *   4. espanol, como ultimo recurso
 * Al cambiar de idioma se actualiza el parametro de la URL y se avisa con el
 * evento 'languagechange' en document para que script.js refresque lo que
 * genera por JS.
 */

const STORAGE_KEY = 'bautiavila:lang'
const URL_PARAM = 'lang'
const DEFAULT_LANGUAGE = 'es'
const ATTRIBUTE_PREFIX = 'data-i18n'

let currentLanguage = DEFAULT_LANGUAGE

const translations = {
  es: {
    'lang.toggle': 'English version',
    'lang.aria': 'Cambiar idioma',
    'meta.description':
      'Portfolio de Bautista Avila, estudiante de la tecnicatura en informática y desarrollador Flutter.',

    'nav.home': 'Inicio',
    'nav.skills': 'Habilidades',
    'nav.projects': 'Proyectos',
    'nav.education': 'Estudios',
    'nav.certifications': 'Certificaciones',
    'nav.experience': 'Experiencia',
    'nav.about': 'Acerca de',

    'sidebar.profiles': 'MIS PERFILES',
    'sidebar.role': 'Técnico en Informática',
    'sidebar.credit': 'Desarrollado por Bautista Avila © 2026',
    'sidebar.toggle.open': 'Abrir menú',
    'sidebar.toggle.close': 'Cerrar menú',
    'contact.email.aria': 'Enviar email',

    'hero.title': 'ME GUSTA CREAR.',
    'hero.lead': 'Soy Bautista, técnico y apasionado de la tecnología desde hace 18 años.',
    'hero.ctaProjects': 'Ver proyectos',
    'hero.ctaCv': 'Descargar CV',
    'hero.cv': 'assets/cv/bautista-avila-cv-es.pdf',

    'skills.title': 'MIS HABILIDADES',
    'skills.dev': 'Desarrollo de software',
    'skills.flutter': 'Flutter',
    'skills.backend': 'Backend con PocketBase',
    'skills.databases': 'Diseño de bases de datos',
    'skills.hardware': 'Hardware y redes',
    'skills.micro': 'Microcontroladores: Arduino y ESP32',
    'skills.processing': 'Processing para interfaces visuales',
    'skills.repair': 'Diagnóstico y reparación de equipos',
    'skills.networks': 'Planificación de redes e infraestructura',
    'skills.fabrication': 'Diseño y fabricación',
    'skills.fusion': 'Autodesk Fusion (CAD 3D)',
    'skills.print3d': 'Impresión 3D',
    'skills.rdworks': 'RDWorks (corte láser)',

    'projects.title': 'PROYECTOS',
    'projects.inventory.period': 'mar. 2026 — Actualidad',
    'projects.inventory.title': 'Sistema digital de gestión de inventario',
    'projects.inventory.caption': 'Vista general del programa de administración del pañol.',
    'projects.inventory.description':
      'Al ver que en la escuela no había un control claro sobre los recursos e insumos, me propuse liderar un proyecto para registrar y automatizar el pañol. La idea del sistema no es reemplazar al pañolero, sino facilitarle el trabajo diario. Al retirar un ítem, el usuario solo escanea su carnet (que recibe por email al registrarse) y el código de barras del objeto. Con esto, el sistema genera el préstamo automáticamente y guarda un registro exacto de la fecha, hora, alumno, encargado y cantidad. Para hacerlo más completo y escalable, con el tiempo le fui sumando funciones como un diseñador e impresor de planillas de etiquetas, un panel de estadísticas, compatibilidad con cámaras y lectores físicos, e interfaz web instalable (PWA) en celulares y tablets. El proyecto continúa en desarrollo con nuevas ayudas en camino.',
    'projects.inventory.img1': 'Sección «Inventario» del programa de administración del pañol',
    'projects.inventory.img2': 'Préstamos registrados con su fecha de vencimiento',
    'projects.inventory.img3': 'Formulario para registrar un ítem nuevo',

    'projects.radar.period': 'jun. 2025 — oct. 2025',
    'projects.radar.title': 'Radar ultrasónico con interfaz visual mediante Arduino y Processing',
    'projects.radar.caption': 'Versión final del radar y detalles de su construcción.',
    'projects.radar.description':
      'Con un servo y un sensor ultrasónico, el dispositivo detectaba la distancia y la posición de un objeto, y avisaba con una alarma sonora y una luz de indicación. Processing mostraba una representación visual y exacta de la distancia. El rango máximo de detección era de 40 cm (limitado artificialmente), el servo giraba hasta 180° y el cuerpo del radar fue impreso en 3D.',
    'projects.radar.img1': 'Radar ultrasónico con Arduino en su versión final',
    'projects.radar.img2': 'Interfaz en Processing mostrando la distancia medida',
    'projects.radar.img3': 'Cuerpo del radar impreso en 3D',

    'projects.transport.title': 'Resolvedores de problemas de transporte',
    'projects.transport.description':
      'Es una aplicación web que calcula la solución inicial de problemas de transporte con dos métodos clásicos de investigación operativa: costo mínimo y esquina noroeste. Permite definir orígenes, destinos, ofertas, demandas y costos unitarios, balancea automáticamente los problemas desbalanceados con un nodo ficticio y exporta la matriz resultante a CSV. Lo hicimos como trabajo grupal para la materia «Modelos y Sistemas».',
    'projects.transport.link': 'Mi perfil de GitHub',

    'projects.readMore': 'Leer más',
    'projects.readLess': 'Leer menos',

    'gallery.previous': 'Imagen anterior',
    'gallery.next': 'Imagen siguiente',
    'gallery.goTo': 'Ver imagen {n} de {total}',
    'gallery.unavailable': 'Imagen no disponible',
    'gallery.zoom': 'Ampliar imagen',
    'lightbox.close': 'Cerrar',


    'certifications.title': 'CERTIFICACIONES Y CURSOS',
    'certifications.period': 'En curso',
    'certifications.course': 'Curso avanzado de Flutter',
    'certifications.body':
      'Tomé un curso avanzado de Flutter y estoy cerca de terminarlo. Aprendí mucho sobre el lenguaje y lo apliqué en la práctica.',

    'education.title': 'ESTUDIOS',
    'education.period': '2022 — Actualidad',
    'education.degree': 'Tecnicatura en Informática personal y profesional',
    'education.description': 'Estoy transitando el último año.',

    'experience.title': 'EXPERIENCIA',
    'experience.role': 'Prácticas Profesionalizantes',
    'experience.period': 'mar. 2026 — Actualidad',
    'experience.item1':
      'Me encuentro realizando las prácticas profesionalizantes requeridas para mi titulación.',
    'experience.item2':
      'Diagnóstico y reparación de computadoras y laptops, con el objetivo de donarlas a otras instituciones.',
    'experience.item3':
      'Diseño de objetos en Autodesk Fusion, ya sea desde cero o mediante un plano preexistente.',
    'experience.item4':
      'Mantenimiento general de la infraestructura de la institución: instalación de cámaras y cables de red.',
    'experience.item5':
      'Enseñanza de tecnologías a estudiantes de años inferiores.',

    'about.title': 'ACERCA DE',
    'about.p1':
      'Soy una persona inseparable de la informática desde que tengo uso de razón. Me encuentro transitando el último año de la Tecnicatura en Informática.',
    'about.p2':
      'Durante mi carrera, he realizado toda clase de proyectos que aportaron a mi formación. Se destacan diseñar bases de datos, planificar y presupuestar la infraestructura de red de diversas instituciones, diagnosticar y reparar equipos informáticos, desarrollar y liderar proyectos de electrónica, entre otros. También realicé diseños en 3D mediante Autodesk Fusion y cortes láser en RDWorks.',
    'about.p3':
      'Fuera del ámbito escolar, he participado en diversos cursos de programación y desarrollo, con un especial enfoque en Flutter. Planeo continuar en el futuro la ingeniería en sistemas para seguir expandiendo mis conocimientos y comenzar a especializarme en tecnologías de mi interés, como la programación de bajo nivel y la inteligencia artificial.',
    'about.contact': 'Contacto',
    'about.linkedin': 'LinkedIn',
    'about.github': 'GitHub',
    'about.links': 'Todos mis links',
    'about.cta': 'Hablemos',
    'about.copyEmail': 'Copiar email',

    'notFound.code': 'Error 404',
    'notFound.title': 'Esta página no existe',
    'notFound.text': 'Puede que el enlace esté roto o mal escrito.',
    'notFound.cta': 'Volver al inicio',
  },

  en: {
    'lang.toggle': 'Versión en español',
    'lang.aria': 'Change language',
    'meta.description':
      'Portfolio of Bautista Avila, IT student and Flutter developer.',

    'nav.home': 'Home',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.education': 'Education',
    'nav.certifications': 'Certifications',
    'nav.experience': 'Experience',
    'nav.about': 'About',

    'sidebar.profiles': 'MY PROFILES',
    'sidebar.role': 'IT Technician',
    'sidebar.credit': 'Developed by Bautista Avila © 2026',
    'sidebar.toggle.open': 'Open menu',
    'sidebar.toggle.close': 'Close menu',
    'contact.email.aria': 'Send email',

    'hero.title': 'I LOVE BUILDING.',
    'hero.lead':
      "I'm Bautista, a technician and technology enthusiast for the past 18 years.",
    'hero.ctaProjects': 'See projects',
    'hero.ctaCv': 'Download CV',
    'hero.cv': 'assets/cv/bautista-avila-cv-en.pdf',

    'skills.title': 'MY SKILLS',
    'skills.dev': 'Software development',
    'skills.flutter': 'Flutter',
    'skills.backend': 'PocketBase backend',
    'skills.databases': 'Database design',
    'skills.hardware': 'Hardware & networking',
    'skills.micro': 'Microcontrollers: Arduino and ESP32',
    'skills.processing': 'Processing for visual interfaces',
    'skills.repair': 'Diagnosing and repairing computers',
    'skills.networks': 'Network planning and infrastructure',
    'skills.fabrication': 'Design & fabrication',
    'skills.fusion': 'Autodesk Fusion (3D CAD)',
    'skills.print3d': '3D printing',
    'skills.rdworks': 'RDWorks (laser cutting)',

    'projects.title': 'PROJECTS',
    'projects.inventory.period': 'Mar 2026 — Present',
    'projects.inventory.title': 'Digital inventory management system',
    'projects.inventory.caption': 'Overview of the storage room management app.',
    'projects.inventory.description':
      "Seeing that the school had no clear control over its resources and supplies, I set out to lead a project to register and automate the storage room. The point of the system is not to replace the storekeeper but to make their daily work easier. To take an item out, the user only has to scan their ID card (sent by email when they sign up) and the item's barcode. The system then creates the loan automatically and keeps an exact record of the date, time, student, staff member and quantity. To make it more complete and scalable, over time I added features such as a label-sheet designer and printer, a statistics panel, support for cameras and physical scanners, and an installable web app (PWA) for phones and tablets. The project is still in development, with new helpers on the way.",
    'projects.inventory.img1': '“Inventory” section of the storage room management app',
    'projects.inventory.img2': 'Registered loans with their due dates',
    'projects.inventory.img3': 'Form to register a new item',

    'projects.radar.period': 'Jun 2025 — Oct 2025',
    'projects.radar.title': 'Ultrasonic radar with a visual interface using Arduino and Processing',
    'projects.radar.caption': 'Final version of the radar and details of its construction.',
    'projects.radar.description':
      'With a servo and an ultrasonic sensor, the device detected the distance and position of an object, and warned with a sound alarm and an indicator light. Processing displayed an accurate visual representation of the distance. The maximum detection range was 40 cm (artificially limited), the servo rotated up to 180° and the radar body was 3D printed.',
    'projects.radar.img1': 'Ultrasonic radar with Arduino in its final version',
    'projects.radar.img2': 'Processing interface showing the measured distance',
    'projects.radar.img3': '3D-printed body of the radar',

    'projects.transport.title': 'Transport problem solvers',
    'projects.transport.description':
      'It is a web app that computes the initial solution of transport problems with two classic operations-research methods: minimum cost and northwest corner. You can define origins, destinations, supplies, demands and unit costs, it balances unbalanced problems automatically with a dummy node, and it exports the resulting matrix as CSV. We built it as a group project for the “Models and Systems” course.',
    'projects.transport.link': 'My GitHub profile',

    'projects.readMore': 'Read more',
    'projects.readLess': 'Read less',

    'gallery.previous': 'Previous image',
    'gallery.next': 'Next image',
    'gallery.goTo': 'Go to image {n} of {total}',
    'gallery.unavailable': 'Image unavailable',
    'gallery.zoom': 'Zoom in',
    'lightbox.close': 'Close',


    'certifications.title': 'CERTIFICATIONS & COURSES',
    'certifications.period': 'Ongoing',
    'certifications.course': 'Advanced Flutter course',
    'certifications.body':
      'I took an advanced Flutter course and I am close to finishing it. I learned a lot about the language and applied it in practice.',

    'education.title': 'EDUCATION',
    'education.period': '2022 — Present',
    'education.degree': 'Technical degree in personal and professional computing',
    'education.description': 'I am in my final year.',

    'experience.title': 'EXPERIENCE',
    'experience.role': 'Professional Internship',
    'experience.period': 'Mar 2026 — Present',
    'experience.item1':
      "I'm completing the professional internship required for my degree.",
    'experience.item2':
      'Diagnosing and repairing desktops and laptops, with the goal of donating them to other institutions.',
    'experience.item3':
      'Designing objects in Autodesk Fusion, either from scratch or from an existing blueprint.',
    'experience.item4':
      "General maintenance of the institution's infrastructure: installing cameras and network cabling.",
    'experience.item5':
      'Teaching technology to students in lower years.',

    'about.title': 'ABOUT',
    'about.p1':
      "I've been inseparable from computing for as long as I can remember. I'm currently in the final year of my IT degree.",
    'about.p2':
      "Throughout my studies I've taken on all kinds of projects that contributed to my training. Highlights include designing databases, planning and budgeting the network infrastructure of several institutions, diagnosing and repairing computer equipment, and developing and leading electronics projects, among others. I also did 3D designs with Autodesk Fusion and laser cuts in RDWorks.",
    'about.p3':
      "Outside of school I've taken several programming and development courses, with a special focus on Flutter. I plan to continue with systems engineering in the future to keep expanding my knowledge and start specializing in technologies I'm interested in, such as low-level programming and artificial intelligence.",
    'about.contact': 'Contact',
    'about.linkedin': 'LinkedIn',
    'about.github': 'GitHub',
    'about.links': 'All my links',
    'about.cta': "Let's talk",
    'about.copyEmail': 'Copy email',

    'notFound.code': 'Error 404',
    'notFound.title': 'This page does not exist',
    'notFound.text': 'The link may be broken or mistyped.',
    'notFound.cta': 'Back home',
  },
}

/** 'EN-us' / 'es_AR' / 'en' -> 'en' | 'es', o null si no lo hablamos. */
function normalizeLanguage(value) {
  if (!value) return null

  const tag = String(value).toLowerCase()
  const base = tag.split(/[-_]/)[0]

  if (translations[tag]) return tag
  return translations[base] ? base : null
}

function readStoredLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    return null
  }
}

function writeStoredLanguage(language) {
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch (error) {
    /* modo privado: seguimos sin persistir */
  }
}

/** Idioma pedido explicitamente en la URL (?lang=en). */
function languageFromUrl() {
  try {
    return normalizeLanguage(new URL(window.location.href).searchParams.get(URL_PARAM))
  } catch (error) {
    return null
  }
}

/** Primer idioma soportado dentro de las preferencias del navegador. */
function languageFromBrowser(languages) {
  const list = languages || navigator.languages || [navigator.language]

  for (const tag of list) {
    const match = normalizeLanguage(tag)
    if (match) return match
  }

  return null
}

/** Deja la URL con ?lang=<idioma>, sin recargar ni ensuciar el historial. */
function writeUrlLanguage(language) {
  if (!window.history || !window.history.replaceState) return

  try {
    const url = new URL(window.location.href)
    url.searchParams.set(URL_PARAM, language)
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  } catch (error) {
    /* file:// o historial bloqueado: la URL se queda como esta */
  }
}

function getLanguage() {
  return currentLanguage
}


/** Resolucion completa, sin efectos: URL > guardado > navegador > default. */
function resolveLanguage() {
  return (
    languageFromUrl() ||
    normalizeLanguage(readStoredLanguage()) ||
    languageFromBrowser() ||
    DEFAULT_LANGUAGE
  )
}

/** Devuelve la clave traducida, con {variables} interpoladas. */
function t(key, variables) {
  const dictionary = translations[getLanguage()] || translations[DEFAULT_LANGUAGE]
  const value = dictionary[key] ?? translations[DEFAULT_LANGUAGE][key] ?? ''

  if (!variables) return value

  return value.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(variables, name) ? variables[name] : match
  )
}

/** Reemplaza solo los nodos de texto, para no borrar los íconos de adentro. */
function setElementText(element, value) {
  const textNodes = Array.from(element.childNodes).filter(
    (node) => node.nodeType === Node.TEXT_NODE
  )

  if (textNodes.length === 0) {
    element.appendChild(document.createTextNode(value))
    return
  }

  textNodes[0].textContent = value
  textNodes.slice(1).forEach((node) => {
    node.textContent = ''
  })
}

function applyLanguage(language) {
  const dictionary = translations[language] || translations[DEFAULT_LANGUAGE]

  document.documentElement.lang = language === 'es' ? 'es-AR' : 'en'

  document.querySelectorAll('*').forEach((element) => {
    element.getAttributeNames().forEach((name) => {
      // data-i18n (texto) o data-i18n-alt / -aria-label / -content (atributos)
      if (name !== ATTRIBUTE_PREFIX && !name.startsWith(`${ATTRIBUTE_PREFIX}-`)) return

      const value = dictionary[element.getAttribute(name)]
      if (value === undefined) return

      const target = name.slice(ATTRIBUTE_PREFIX.length).replace(/^-/, '')
      if (target) {
        element.setAttribute(target, value)
      } else {
        setElementText(element, value)
      }
    })
  })

  document.dispatchEvent(
    new CustomEvent('languagechange', { detail: { language, dictionary } })
  )
}

function setLanguage(language, options) {
  const normalized = normalizeLanguage(language)
  if (!normalized) return

  const settings = { persist: true, updateUrl: true, ...options }
  currentLanguage = normalized

  if (settings.persist) writeStoredLanguage(normalized)
  if (settings.updateUrl) writeUrlLanguage(normalized)

  applyLanguage(normalized)
}

window.i18n = {
  t,
  getLanguage,
  setLanguage,
  applyLanguage,
  resolveLanguage,
  languageFromBrowser,
  normalizeLanguage,
  languages: Object.keys(translations),
}

// Un ?lang=... en la URL es intencion explicita: se respeta pero no se pisa la
// preferencia guardada de la persona que abrio el link.
const fromUrl = languageFromUrl()
setLanguage(fromUrl || resolveLanguage(), { persist: false, updateUrl: false })
