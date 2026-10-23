const navLinks = document.querySelectorAll('#nav a')
const i18n = window.i18n

const langToggle = document.getElementById('lang-toggle')

langToggle.addEventListener('click', () => {
  const next = i18n.getLanguage() === 'es' ? 'en' : 'es'
  i18n.setLanguage(next)
})

const sidebar = document.getElementById('sidebar')
const sidebarToggle = document.getElementById('sidebar-toggle')
const sidebarBackdrop = document.getElementById('sidebar-backdrop')
const mobileBarCurrent = document.getElementById('mobile-bar-current')

function setSidebarOpen(isOpen) {
  sidebar.classList.toggle('open', isOpen)
  sidebarBackdrop.classList.toggle('open', isOpen)
  sidebarToggle.classList.toggle('open', isOpen)
  sidebarToggle.setAttribute('aria-expanded', String(isOpen))
  sidebarToggle.setAttribute(
    'aria-label',
    i18n.t(isOpen ? 'sidebar.toggle.close' : 'sidebar.toggle.open')
  )
}

const closeSidebar = () => setSidebarOpen(false)

sidebarToggle.addEventListener('click', () => {
  setSidebarOpen(!sidebar.classList.contains('open'))
})

sidebarBackdrop.addEventListener('click', closeSidebar)
navLinks.forEach((link) => link.addEventListener('click', closeSidebar))
document
  .querySelector('.mobile-bar-brand')
  .addEventListener('click', closeSidebar)

// Esc closes the open menu and returns focus to its button.
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !sidebar.classList.contains('open')) return

  closeSidebar()
  sidebarToggle.focus()
})

const sections = Array.from(document.querySelectorAll('section[id]'))

function linkLabel(link) {
  return Array.from(link.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent)
    .join('')
    .trim()
}

// Active section = last one past the 40% viewport line: no stale observer ratios.
function currentSectionId() {
  const anchor = window.innerHeight * 0.4
  let currentId = sections.length ? sections[0].id : null

  for (const section of sections) {
    if (section.getBoundingClientRect().top <= anchor) currentId = section.id
  }

  return currentId
}

let activeId = null

function updateActiveLink() {
  const currentId = currentSectionId()
  // Only touch the DOM on section change: per-frame writes cost style and paint.
  if (!currentId || currentId === activeId) return
  activeId = currentId

  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${currentId}`
    link.classList.toggle('active', isActive)
    if (isActive) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  })

  const activeLink = document.querySelector(`#nav a[href="#${currentId}"]`)
  if (activeLink && mobileBarCurrent) {
    mobileBarCurrent.textContent = linkLabel(activeLink) || mobileBarCurrent.textContent
  }
}

// At most one update per frame, however many scroll events fire.
let spyQueued = false

function queueSpy() {
  if (spyQueued) return
  spyQueued = true
  requestAnimationFrame(() => {
    spyQueued = false
    updateActiveLink()
  })
}

window.addEventListener('scroll', queueSpy, { passive: true })
window.addEventListener('resize', updateActiveLink)
updateActiveLink()

const galleries = []
const lightbox = document.getElementById('lightbox')
const lightboxImage = lightbox && lightbox.querySelector('.lightbox-img')
const lightboxCaption = lightbox && lightbox.querySelector('.lightbox-caption')
let lightboxGallery = null

// Native <dialog>: Esc, focus trap and backdrop for free.
function renderLightbox() {
  const slide = lightboxGallery && lightboxGallery.current()
  if (!slide) return

  lightboxImage.src = slide.getAttribute('src')
  lightboxImage.alt = slide.alt || ''
  lightboxCaption.textContent = slide.alt || ''
}

function openLightbox() {
  if (!lightbox) return

  renderLightbox()
  if (!lightbox.open) lightbox.showModal()
}

document.querySelectorAll('[data-gallery]').forEach((gallery) => {
  const image = gallery.querySelector('[data-gallery-image]')
  const counter = gallery.querySelector('[data-gallery-counter]')
  const thumbs = Array.from(gallery.querySelectorAll('[data-gallery-thumb]'))

  if (!image || thumbs.length < 2) return

  // Keep the thumbnail <img>s (not data): alt text follows the language.
  const slides = thumbs.map((thumb) => thumb.querySelector('img'))

  let index = 0

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length
    const slide = slides[index]

    // Fallback hides via inline display:none; restore it before swapping the image.
    image.style.display = ''

    if (slide) {
      const src = slide.getAttribute('src')
      if (image.getAttribute('src') !== src) image.src = src
      if (slide.alt) image.alt = slide.alt
    }

    thumbs.forEach((thumb, position) => {
      const isActive = position === index
      thumb.classList.toggle('is-active', isActive)
      thumb.setAttribute('aria-current', String(isActive))
      thumb.setAttribute(
        'aria-label',
        i18n.t('gallery.goTo', { n: position + 1, total: slides.length })
      )
    })

    if (counter) counter.textContent = `${index + 1} / ${slides.length}`
  }

  const controller = {
    refresh: () => show(index),
    go: (position) => show(position),
    current: () => slides[index],
    position: () => index,
  }

  galleries.push(controller)

  const openButton = gallery.querySelector('[data-gallery-open]')
  if (openButton) {
    openButton.addEventListener('click', () => {
      lightboxGallery = controller
      openLightbox()
    })
  }

  thumbs.forEach((thumb, position) => {
    thumb.addEventListener('click', () => show(position))
  })

  const prevButton = gallery.querySelector('[data-gallery-prev]')
  const nextButton = gallery.querySelector('[data-gallery-next]')
  if (prevButton) prevButton.addEventListener('click', () => show(index - 1))
  if (nextButton) nextButton.addEventListener('click', () => show(index + 1))

  // Finger swipe switches image, horizontal gestures only.
  let touchStart = null

  gallery.addEventListener(
    'touchstart',
    (event) => {
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY }
    },
    { passive: true }
  )

  gallery.addEventListener('touchend', (event) => {
    if (!touchStart) return

    const deltaX = event.changedTouches[0].clientX - touchStart.x
    const deltaY = event.changedTouches[0].clientY - touchStart.y
    touchStart = null

    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return

    show(index + (deltaX < 0 ? 1 : -1))
  })

  show(0)
})

if (lightbox) {
  lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', () => {
    lightboxGallery.go(lightboxGallery.position() - 1)
    renderLightbox()
  })

  lightbox.querySelector('[data-lightbox-next]').addEventListener('click', () => {
    lightboxGallery.go(lightboxGallery.position() + 1)
    renderLightbox()
  })

  lightbox.querySelector('[data-lightbox-close]').addEventListener('click', () => lightbox.close())

  lightbox.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return

    lightboxGallery.go(lightboxGallery.position() + (event.key === 'ArrowLeft' ? -1 : 1))
    renderLightbox()
  })

  // Click outside the box (on the backdrop) closes.
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close()
  })
}

// 'Read more' clips long descriptions; hidden when everything fits.
const descriptions = Array.from(document.querySelectorAll('[data-more]')).map((button) => ({
  button,
  text: button.previousElementSibling,
}))

function refreshDescriptions() {
  descriptions.forEach(({ button, text }) => {
    if (!text || text.classList.contains('is-open')) return

    button.hidden = text.scrollHeight <= text.clientHeight + 1
  })
}

descriptions.forEach(({ button, text }) => {
  button.addEventListener('click', () => {
    const isOpen = text.classList.toggle('is-open')
    button.setAttribute('aria-expanded', String(isOpen))
  })
})

refreshDescriptions()
window.addEventListener('resize', refreshDescriptions)

// Copy the email to the clipboard, with visual confirmation.
const copyButton = document.querySelector('[data-copy-email]')

if (copyButton) {
  let resetTimer = null

  copyButton.addEventListener('click', async () => {
    const email = copyButton.dataset.copyEmail

    try {
      await navigator.clipboard.writeText(email)
    } catch (error) {
      // ponytail: deprecated execCommand covers no-clipboard contexts (plain http).
      const field = document.createElement('textarea')
      field.value = email
      document.body.appendChild(field)
      field.select()
      document.execCommand('copy')
      field.remove()
    }

    copyButton.classList.add('is-copied')
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => copyButton.classList.remove('is-copied'), 2000)
  })
}

// Easter egg: 10 taps on the photo open a video in a new tab.
const pfp = document.querySelector('.pfp-placeholder')

if (pfp) {
  let taps = 0
  let resetTimer = null

  pfp.addEventListener('click', () => {
    taps += 1
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      taps = 0
    }, 3000)

    if (taps >= 10) {
      taps = 0
      window.open('https://www.youtube.com/watch?v=Ti-jrTI0tpM', '_blank', 'noopener')
    }
  })
}

// On language change rebuild what JS owns: gallery labels, active name, menu aria.
document.addEventListener('languagechange', () => {
  // Rerun even on the same section: labels changed language.
  activeId = null
  updateActiveLink()
  setSidebarOpen(sidebar.classList.contains('open'))
  galleries.forEach((gallery) => gallery.refresh())
  if (lightbox && lightbox.open) renderLightbox()
  refreshDescriptions()
})
